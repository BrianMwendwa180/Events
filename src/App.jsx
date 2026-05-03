import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID?.trim();
const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';

function renderMissingPayPalConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] px-4">
      <div className="max-w-xl rounded-3xl border border-red-900 bg-gray-900 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white mb-3">PayPal is not configured</h1>
        <p className="text-sm text-gray-300 leading-relaxed">
          The application requires <code>VITE_PAYPAL_CLIENT_ID</code> to be set for production.
          Check your Vercel environment variables and redeploy with a live PayPal client ID.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!PAYPAL_CLIENT_ID) {
    return renderMissingPayPalConfig();
  }

  if (import.meta.env.PROD && PAYPAL_CLIENT_ID.toLowerCase().startsWith('sb-')) {
    console.warn('PayPal sandbox client ID is configured in a production build. Update VITE_PAYPAL_CLIENT_ID to a live PayPal client ID.');
  }

  return (
    <PayPalScriptProvider options={{
      'client-id': PAYPAL_CLIENT_ID,
      currency: CURRENCY,
      intent: 'capture',
      components: 'buttons,funding-eligibility',
      'enable-funding': 'venmo,paylater',
      'disable-funding': '',
    }}>
      <BrowserRouter>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-[#1A1A1A]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events/:id" element={<EventPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}
