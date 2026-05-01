import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';

export default function App() {
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
