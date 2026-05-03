/**
 * Vercel Serverless Function: Verify PayPal capture and send tickets
 * POST /api/paypal-capture
 *
 * Expected payload:
 * {
 *   orderId: string,
 *   captureDetails?: object,
 *   contact: { firstName, lastName, email, phone },
 *   cart: [ { eventId, eventTitle, eventDate, eventTime, categoryName, categoryId, quantity, total } ],
 *   cartTotal: number,
 *   orderRef: string,
 * }
 */

import { generateMultipleTicketPages } from './utils/ticket-generator.js';
import { sendTicketEmail } from './utils/email-service.js';

const PAYPAL_MODE = process.env.PAYPAL_MODE?.toLowerCase() === 'live' ? 'live' : 'sandbox';
const PAYPAL_API_URL = PAYPAL_MODE === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client credentials are not configured');
  }

  return fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en_US',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
}

async function captureOrder(orderId, accessToken) {
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.message || JSON.stringify(data);
    throw new Error(`PayPal capture request failed: ${message}`);
  }

  return data;
}

function ensureCartHasItems(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Cart must contain at least one item');
  }
}

function combinePDFs(buffers) {
  if (!buffers || buffers.length === 0) {
    throw new Error('No ticket PDFs were generated');
  }
  return buffers[0];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.VITE_APP_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, captureDetails, contact, cart, cartTotal, orderRef } = req.body;

    if (!orderId || !contact || !cart || !cartTotal || !orderRef) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    ensureCartHasItems(cart);

    let captureData;

    if (captureDetails?.status === 'COMPLETED') {
      captureData = captureDetails;
      console.log('[PayPal] Using client-side capture details for order:', orderId);
    } else {
      console.log('[PayPal] Capturing order server-side:', orderId);
      const tokenResponse = await getPayPalAccessToken();
      if (!tokenResponse.ok) {
        const body = await tokenResponse.text();
        throw new Error(`Failed to get PayPal access token: ${body}`);
      }
      const { access_token } = await tokenResponse.json();
      captureData = await captureOrder(orderId, access_token);
    }

    if (captureData.status !== 'COMPLETED') {
      throw new Error(`PayPal payment not completed: ${captureData.status}`);
    }

    console.log('[PayPal] Order verification succeeded:', orderId);

    const ticketPromises = cart.map((item) =>
      generateMultipleTicketPages(
        {
          orderRef,
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          eventTime: item.eventTime,
          categoryName: item.categoryName,
          venueName: 'Fox Theatre Atlanta',
          venueAddress: '660 Peachtree St NE, Atlanta, GA 30308',
          attendeeName: `${contact.firstName} ${contact.lastName}`,
          email: contact.email,
          quantity: item.quantity,
        },
        item.quantity
      )
    );

    const ticketBuffers = await Promise.all(ticketPromises);
    const combinedTicketBuffer = combinePDFs(ticketBuffers);

    await sendTicketEmail({
      to: contact.email,
      attendeeName: `${contact.firstName} ${contact.lastName}`,
      eventTitle: cart.map((c) => c.eventTitle).join(', '),
      pdfBuffer: combinedTicketBuffer,
      orderRef,
      amount: cartTotal,
    });

    console.log('[Email] Tickets sent to:', contact.email);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and tickets sent successfully',
      orderId,
      orderRef,
      email: contact.email,
      captureTime: new Date().toISOString(),
      paypalMode: PAYPAL_MODE,
    });
  } catch (error) {
    console.error('[PayPal Capture] Error:', error);
    return res.status(500).json({
      error: 'Payment processing failed',
      details: error.message,
    });
  }
}
