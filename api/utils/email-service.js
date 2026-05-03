import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends ticket confirmation email with PDF attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.attendeeName - Attendee name
 * @param {string} options.eventTitle - Event name
 * @param {Buffer} options.pdfBuffer - PDF ticket buffer
 * @param {string} options.orderRef - Order reference
 * @param {number} options.amount - Order amount
 * @returns {Promise<Object>} Resend API response
 */
export async function sendTicketEmail({
  to,
  attendeeName,
  eventTitle,
  pdfBuffer,
  orderRef,
  amount,
}) {
  const attachmentData = pdfBuffer.toString('base64');

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .event-box { background-color: #f8f8f8; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .event-title { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 10px; }
    .event-details { font-size: 14px; color: #666; }
    .cta-box { background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .cta-text { font-size: 13px; color: #666; margin-bottom: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .order-ref { background: #f8f8f8; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px; font-weight: bold; text-align: center; margin: 15px 0; }
    .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .divider { height: 1px; background-color: #eee; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎭 FOX THEATRE ATLANTA</h1>
      <p>Your Tickets Are Ready</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${attendeeName},
      </div>
      
      <p>
        Your payment of <strong>$${amount.toFixed(2)} USD</strong> has been received and processed successfully! 
        Your mobile tickets for the following event are ready to go.
      </p>
      
      <div class="event-box">
        <div class="event-title">${eventTitle}</div>
        <div class="event-details">
          <p style="margin: 5px 0;"><strong>Order Reference:</strong> ${orderRef}</p>
          <p style="margin: 5px 0;">Your tickets are attached as PDF files to this email.</p>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="margin-top: 20px;">📱 How to Use Your Mobile Tickets</h3>
      <ol style="font-size: 14px; line-height: 1.8; color: #666;">
        <li><strong>Save the PDF</strong> - Download the attached ticket PDF to your phone</li>
        <li><strong>Show at Entrance</strong> - Display the ticket on your mobile device when you arrive</li>
        <li><strong>Arrive Early</strong> - We recommend arriving 15-20 minutes before the event starts</li>
        <li><strong>Check Details</strong> - Verify your ticket information matches your name and order reference</li>
      </ol>
      
      <div class="divider"></div>
      
      <div class="order-ref">
        Order Reference: ${orderRef}
      </div>
      
      <h3>Important Information</h3>
      <ul style="font-size: 13px; line-height: 1.8; color: #666;">
        <li>All sales are final and non-refundable</li>
        <li>Tickets are non-transferable and must be used on the date specified</li>
        <li>Arrive early to avoid missing your event</li>
        <li>For venue location details, visit our website</li>
      </ul>
      
      <div class="divider"></div>
      
      <p style="font-size: 13px; color: #999; margin-top: 20px;">
        Questions? Contact us at support@foxtheatreatlanta.com or call (404) 881-2100
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">
        © 2024 Fox Theatre Atlanta. All rights reserved.<br>
        660 Peachtree St NE, Atlanta, GA 30308
      </p>
      <p style="margin: 10px 0 0 0; font-size: 11px;">
        This email was sent because you purchased tickets. If you think this was a mistake, 
        please contact us immediately.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await resend.emails.send({
      from: 'Fox Theatre <tickets@foxtheatre.events>',
      to,
      subject: `Your Fox Theatre Tickets - ${eventTitle} (Ref: ${orderRef})`,
      html: emailContent,
      attachments: [
        {
          filename: `tickets-${orderRef}.pdf`,
          content: attachmentData,
          encoding: 'base64',
        },
      ],
    });

    console.log('[Resend] Email sent:', response);
    return response;
  } catch (error) {
    console.error('[Resend] Email send failed:', error);
    throw error;
  }
}

/**
 * Sends payment confirmation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.attendeeName - Attendee name
 * @param {number} options.amount - Order amount
 * @param {string} options.orderRef - Order reference
 * @param {string} options.paymentMethod - Payment method used
 * @returns {Promise<Object>} Resend API response
 */
export async function sendPaymentConfirmation({
  to,
  attendeeName,
  amount,
  orderRef,
  paymentMethod,
}) {
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .amount { font-size: 28px; font-weight: bold; color: #22c55e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Payment Confirmed</h1>
    </div>
    <div class="content">
      <p>Hi ${attendeeName},</p>
      <p>Your payment has been successfully processed.</p>
      <p><strong>Amount Paid:</strong> <span class="amount">$${amount.toFixed(2)}</span></p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Order Reference:</strong> ${orderRef}</p>
      <p>Your tickets will be sent separately.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    return await resend.emails.send({
      from: 'Fox Theatre <tickets@foxtheatre.events>',
      to,
      subject: `Payment Confirmation - ${orderRef}`,
      html: emailContent,
    });
  } catch (error) {
    console.error('[Resend] Payment confirmation email failed:', error);
    throw error;
  }
}
