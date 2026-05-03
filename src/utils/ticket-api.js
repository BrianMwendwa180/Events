import axios from 'axios';

/**
 * API client for backend endpoints
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sends contact info + cart to PayPal capture endpoint
 * @param {Object} payload - Payment data
 * @returns {Promise<Object>} Response with order confirmation
 */
export async function capturePayPalPayment(payload) {
  const response = await apiClient.post('/api/paypal-capture', payload);
  return response.data;
}

/**
 * Handles ticket download trigger
 * (Frontend can show it as an email reminder or generate QR)
 * @param {Object} ticketData - Ticket information
 * @returns {string} Download URL or confirmation message
 */
export function handleTicketDownload(ticketData) {
  const { email } = ticketData;
  
  // In a real app, this would trigger an actual PDF generation
  // For now, we show a helpful message
  return `Your ${eventTitle} tickets have been sent to ${email}. Check your email to download the PDF.`;
}

/**
 * Generates a ticket download link (if backend supports direct download)
 * @param {string} orderRef - Order reference ID
 * @returns {string} Download URL
 */
export function getTicketDownloadUrl(orderRef) {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
  return `${baseUrl}/api/tickets/${orderRef}/download`;
}

/**
 * Resends ticket email
 * @param {string} email - Email address
 * @param {string} orderRef - Order reference
 * @returns {Promise<Object>} API response
 */
export async function resendTicketEmail(email, orderRef) {
  const response = await apiClient.post('/api/resend-tickets', {
    email,
    orderRef,
  });
  return response.data;
}

/**
 * Error handler for API calls
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export function handleApiError(error) {
  if (error.response?.data?.details) {
    return error.response.data.details;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.status === 404) {
    return 'Resource not found. Please check your order reference.';
  }
  
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
}
