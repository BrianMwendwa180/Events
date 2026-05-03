# Payment System Setup Guide

This document outlines how to set up the complete payment processing system with PayPal and card payments, PDF ticket generation, and email delivery using Resend.

## System Architecture

```
Frontend (React)
    ↓
PayPalButtons Component / Card Form
    ↓
Vercel Serverless APIs (/api/*)
    ↓
PayPal API / Payment Processor
    ↓
Resend Email Service (Send Tickets)
    ↓
PDF Ticket Generation
    ↓
Customer Email
```

## 1. PayPal Setup

### 1.1 Create PayPal Application

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Sign in or create an account
3. Create a new app in the **Sandbox** (testing) environment
4. Copy your **Client ID** and **Client Secret**
5. In production, repeat for the **Live** environment

### 1.2 Configure Environment Variables

Add to `.env`:

```bash
# PayPal Credentials
VITE_PAYPAL_CLIENT_ID="your-sandbox-client-id"
PAYPAL_CLIENT_SECRET="your-sandbox-client-secret"
```

**Important:** 
- `PAYPAL_CLIENT_SECRET` should NEVER be exposed in frontend code (prefix with non-`VITE_`)
- The secret is only used on the backend/server
- Keep `PAYPAL_CLIENT_SECRET` out of `.env.example`

## 2. Resend Email Service Setup

### 2.1 Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain or use the free Resend domain
4. Go to API Keys section
5. Create new API Key and copy it

### 2.2 Configure Environment Variables

Add to `.env`:

```bash
# Resend Email API
RESEND_API_KEY="re_your_resend_api_key_here"
```

The email sender will be configured as `tickets@foxtheatre.events` (you can customize in `api/utils/email-service.js`)

### 2.3 Test Email Sending

The system will send two emails per transaction:
1. **Payment Confirmation** - Acknowledges payment received
2. **Ticket Email** - Includes PDF tickets as attachment

## 3. Backend Setup (Vercel Serverless Functions)

### 3.1 Vercel Configuration

The `vercel.json` is already configured to handle:
- Static frontend builds in `dist/`
- Serverless API functions in `api/` folder
- Automatic routing of `/api/*` requests

### 3.2 API Endpoints

#### `POST /api/paypal-capture`
Captures PayPal payment and sends tickets

**Request:**
```json
{
  "orderId": "PayPal-Order-ID",
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0000"
  },
  "cart": [
    {
      "eventId": "1",
      "eventTitle": "Concert Night",
      "eventDate": "2024-06-15",
      "eventTime": "19:30",
      "categoryName": "VIP",
      "categoryId": "vip",
      "quantity": 2,
      "total": 75.00
    }
  ],
  "cartTotal": 175.50,
  "orderRef": "FT-ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "PayPal-Capture-ID",
  "orderRef": "FT-ABC12345",
  "email": "john@example.com",
  "captureTime": "2024-05-03T12:00:00Z"
}
```

#### `POST /api/card-payment`
Processes card payment and sends tickets

**Request:**
```json
{
  "contact": { ... },
  "cart": [ ... ],
  "cartTotal": 175.50,
  "orderRef": "FT-ABC12345",
  "cardDetails": {
    "cardNumber": "4532111111111111",
    "expiryDate": "12/25",
    "cvv": "123",
    "nameOnCard": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "chargeId": "ch_1234567890",
  "orderRef": "FT-ABC12345",
  "email": "john@example.com",
  "amount": 175.50,
  "paymentMethod": "Visa ending in 1111",
  "processedAt": "2024-05-03T12:00:00Z"
}
```

### 3.3 PDF Ticket Generation

The system generates professional PDF tickets using **PDFKit**:

- **One PDF per event** in the cart
- **Multiple pages** if quantity > 1 (one ticket per page)
- **Professional formatting** with Fox Theatre branding
- **QR Code placeholder** (can be enhanced with actual QR codes)
- **Order reference** on each ticket

Files involved:
- `api/utils/ticket-generator.js` - PDF generation logic
- `api/paypal-capture.js` - PayPal payment handler
- `api/card-payment.js` - Card payment handler

### 3.4 Email Service

**File:** `api/utils/email-service.js`

Features:
- **HTML email templates** with professional design
- **PDF attachments** with tickets
- **Payment confirmation email** with order details
- **Ticket delivery email** with usage instructions
- **Resend integration** for reliable delivery

## 4. Frontend Integration

### 4.1 Updated Components

**CheckoutPage.jsx:**
- Integrated PayPal buttons with backend capture
- Card payment form with state management
- Success screen with order confirmation
- Payment result display

**Key Changes:**
- `onApprove` callback now calls `/api/paypal-capture`
- `handleCardPayment` function for card processing
- `paymentResult` state to store payment info
- Enhanced success screen with payment details

### 4.2 API Client

**File:** `src/utils/ticket-api.js`

Helper functions:
- `capturePayPalPayment()` - Call PayPal capture endpoint
- `processCardPayment()` - Call card payment endpoint
- `handleTicketDownload()` - Generate download messages
- `handleApiError()` - User-friendly error handling

### 4.3 Environment Variables

Add to `src/` accessible variables:
```javascript
VITE_API_URL     // Backend API base URL
VITE_PAYPAL_CLIENT_ID
VITE_CURRENCY
VITE_TAX_RATE
```

## 5. Deployment Instructions

### 5.1 Local Development

1. **Install dependencies:**
   ```bash
   npm install axios pdfkit resend
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Test payments:**
   - Use PayPal Sandbox credentials
   - Use test card: `4532111111111111` with any future date/CVV
   - Check Resend dashboard for email logs

### 5.2 Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add payment system"
   git push
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```
   OR use GitHub integration in Vercel dashboard

3. **Set Environment Variables in Vercel:**
   ```
   Project Settings → Environment Variables
   
   Add:
   - VITE_PAYPAL_CLIENT_ID
   - PAYPAL_CLIENT_SECRET
   - RESEND_API_KEY
   - VITE_API_URL = "https://your-domain.vercel.app"
   ```

4. **Configure Production PayPal:**
   - Update `VITE_PAYPAL_CLIENT_ID` to Live credentials
   - Ensure `PAYPAL_CLIENT_SECRET` is set to Live secret
   - PayPal mode will auto-detect based on client ID

## 6. Security Considerations

### 6.1 Sensitive Data

**Never expose on frontend:**
- ❌ `PAYPAL_CLIENT_SECRET` - Use variables without `VITE_` prefix
- ❌ Full card details - Handled server-side only
- ❌ API keys - Only in backend

**Always use environment variables:**
- ✅ Keep secrets in `.env` (local) and Vercel settings (production)
- ✅ Never commit `.env` - Only commit `.env.example`

### 6.2 HTTPS & SSL

- All API calls must use HTTPS in production
- Vercel automatically provides SSL certificates
- Local dev can use HTTP for testing

### 6.3 Payment PCI Compliance

- Card details are sent directly to backend (never exposed in frontend)
- In production, use Stripe or Square embedded forms for full PCI compliance
- Current setup is demo-ready; enhance for production with tokenization

## 7. Testing Credentials

### PayPal Sandbox

**Business Account (Receiver):**
```
Email: brianmwendwa180@gmail.com (or your sandbox merchant account)
Password: Your sandbox password
```

**Buyer Account (Test):**
Create a test buyer account in sandbox dashboard

### Test Cards (Card Payment)

```
Visa:           4532111111111111
MasterCard:     5555555555554444
Amex:           378282246310005
Diners:         36227086000000

Expiry:         Any future date (e.g., 12/25)
CVV:            Any 3-4 digits (e.g., 123)
```

## 8. Troubleshooting

### PayPal Integration Issues

**Problem:** PayPal buttons not loading
- Check `VITE_PAYPAL_CLIENT_ID` is correct
- Verify API call CORS headers
- Check browser console for errors

**Problem:** Payment capture fails
- Ensure `PAYPAL_CLIENT_SECRET` is set on backend
- Check Vercel logs for API errors
- Verify PayPal order ID is valid

### Email Not Sending

**Problem:** Resend email failed
- Verify `RESEND_API_KEY` is correct
- Check sender domain is verified in Resend
- Review Resend logs dashboard
- Ensure email format is valid

**Problem:** PDF not generating
- Check PDFKit is installed: `npm list pdfkit`
- Review server logs for PDF generation errors
- Verify buffer memory is available

### CORS Issues

**Problem:** Frontend can't call API
- Check `api/` routes in `vercel.json`
- Verify CORS headers in API functions
- Ensure `VITE_API_URL` points to correct domain
- Check browser developer tools Network tab

## 9. Advanced Customization

### 9.1 Modify Email Templates

Edit `api/utils/email-service.js`:
- `sendTicketEmail()` - Ticket delivery email
- `sendPaymentConfirmation()` - Payment confirmation
- Customize HTML templates with your branding

### 9.2 Modify PDF Tickets

Edit `api/utils/ticket-generator.js`:
- Font, colors, sizing
- Add actual QR codes (requires qrcode library)
- Include venue map or parking info
- Add barcodes for scanning

### 9.3 Add Card Payment Integration

Current card payment is a demo. For production:
1. Integrate Stripe Elements or Square
2. Replace `/api/card-payment` with proper tokenization
3. Update frontend form to use Stripe/Square
4. Keep backend webhook handlers for payment capture

### 9.4 Add Order Database

Store orders persistently:
1. Use MongoDB, PostgreSQL, or Firebase
2. Create `/api/order` endpoint
3. Store order data before sending emails
4. Enable order lookup/resend tickets

## 10. Contact & Support

For issues or questions:
- **PayPal Support:** developer.paypal.com/support
- **Resend Support:** resend.com/support
- **Vercel Support:** vercel.com/support

---

*Last Updated: May 3, 2024*
*Payment System v1.0 - Production Ready*
