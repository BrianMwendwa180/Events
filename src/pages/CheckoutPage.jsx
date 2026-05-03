import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  PayPalButtons,
  usePayPalScriptReducer,
  FUNDING,
} from '@paypal/react-paypal-js';
import {
  ChevronLeft, Lock, CreditCard, CheckCircle, AlertCircle,
  User, Mail, Phone, Loader, ShieldCheck, Ticket, Calendar,
  Clock, MapPin, ChevronDown, ChevronUp, X, Download,
} from 'lucide-react';
import { useCart } from '../context/useCart';

const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';
const API_BASE = import.meta.env.VITE_API_URL || undefined;

// API client. When VITE_API_URL is not configured, we send relative requests to the current origin.
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

function OrderSummary({
  cart,
  selectedAddOns,
  cartCount,
  cartSubtotal,
  cartFees,
  addOnTotal,
  cartTax,
  cartTotal,
  step,
  contactEmail,
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-white font-bold font-serif">Order Summary</h2>
        <span className="text-xs text-gray-400">{cartCount} ticket{cartCount > 1 ? 's' : ''}</span>
      </div>
      <div className="p-5">
        <div className="space-y-4 mb-4">
          {cart.map(item => (
            <div key={`${item.eventId}-${item.categoryId}`} className="flex gap-3">
              <div className="w-8 h-8 rounded bg-red-900/30 border border-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Ticket size={14} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-200 text-sm font-medium leading-tight">{item.quantity}× {item.categoryName}</span>
                  <span className="text-white text-sm font-bold flex-shrink-0">${(item.total * item.quantity).toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">{item.eventTitle}</div>
                <div className="flex gap-2 mt-0.5 text-xs text-gray-600 flex-wrap">
                  <span className="flex items-center gap-0.5"><Calendar size={10} />{item.eventDate}</span>
                  <span className="flex items-center gap-0.5"><Clock size={10} />{item.eventTime}</span>
                </div>
              </div>
            </div>
          ))}
          {Object.values(selectedAddOns).map(addon => (
            <div key={addon.id} className="flex justify-between items-center text-sm pl-2 border-l-2 border-yellow-700/50">
              <span className="text-gray-400 text-xs">+ {addon.name}</span>
              <span className="text-[#B8860B] text-xs font-semibold">${addon.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Tickets ({cartCount})</span>
            <span>${cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Service Fees</span>
            <span>${cartFees.toFixed(2)}</span>
          </div>
          {addOnTotal > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Add-ons</span>
              <span>${addOnTotal.toFixed(2)}</span>
            </div>
          )}
          {cartTax > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Estimated Tax</span>
              <span>${cartTax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>Delivery</span>
            <span className="text-green-400">Free</span>
          </div>
          <div className="flex justify-between text-white font-bold text-base border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {step === 2 && contactEmail && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400 flex items-start gap-2">
            <Mail size={13} className="text-green-400 mt-0.5 shrink-0" />
            <span>Tickets will be sent to <span className="text-white font-medium">{contactEmail}</span></span>
          </div>
        )}
        {step === 1 && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-500 flex items-center gap-2">
            <Lock size={12} className="shrink-0" />
            Complete contact info to proceed to payment
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PayPal loading skeleton ─────────────────────────────────────── */
function PayPalSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 rounded-lg bg-[#0070BA]/30 border border-[#0070BA]/20" />
      <div className="h-12 rounded-lg bg-[#1C1E24]/60 border border-gray-700" />
      <div className="h-12 rounded-lg bg-gray-800/60 border border-gray-700" />
    </div>
  );
}

/* ─── PayPal button group (uses context from parent provider) ───── */
function PayPalButtonGroup({ createOrder, onApprove, onError, onCancel }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl flex items-center gap-3 text-red-300 text-sm">
        <AlertCircle size={18} className="shrink-0" />
        PayPal failed to load. Please refresh or try a different browser.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isPending && <PayPalSkeleton />}

      {/* Standard PayPal button */}
      <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        style={{ layout: 'horizontal', color: 'blue', shape: 'rect', label: 'pay', tagline: false, height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />

      {/* PayLater */}
      <PayPalButtons
        fundingSource={FUNDING.PAYLATER}
        style={{ layout: 'horizontal', color: 'silver', shape: 'rect', label: 'paylater', tagline: false, height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />

      {/* Venmo */}
      <PayPalButtons
        fundingSource={FUNDING.VENMO}
        style={{ layout: 'horizontal', shape: 'rect', height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />
    </div>
  );
}

/* ─── Main Checkout Page ────────────────────────────────────────── */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart, cartTotal, cartSubtotal, cartFees, addOnTotal, cartTax,
    selectedAddOns, cartCount, clearCart,
  } = useCart();

  const [step, setStep] = useState(1);        // 1 contact | 2 payment | 3 success
  const [orderError, setOrderError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);  // mobile summary toggle
  const [orderRef] = useState(() => `FT-${Date.now().toString(36).toUpperCase()}`);
  const [paymentResult, setPaymentResult] = useState(null);  // Result from backend

  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [contactErrors, setContactErrors] = useState({});

  /* ── validation ── */
  const validateContact = () => {
    const errs = {};
    if (!contact.firstName.trim()) errs.firstName = 'First name is required';
    if (!contact.lastName.trim()) errs.lastName = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = 'Enter a valid email address';
    if (!/^\+?[\d\s\-()]{7,}$/.test(contact.phone)) errs.phone = 'Enter a valid phone number';
    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContactNext = () => {
    if (validateContact()) setStep(2);
  };

  /* ── PayPal callbacks ── */
  const createOrder = useCallback((data, actions) => {
    setOrderError('');
    return actions.order.create({
      purchase_units: [{
        reference_id: orderRef,
        description: 'Fox Theatre Tickets',
        soft_descriptor: 'FOX THEATRE',
        amount: {
          currency_code: CURRENCY,
          value: cartTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: CURRENCY,
              value: (cartSubtotal + cartFees).toFixed(2),
            },
            ...(addOnTotal > 0 && {
              handling: {
                currency_code: CURRENCY,
                value: addOnTotal.toFixed(2),
              },
            }),
            ...(cartTax > 0 && {
              tax_total: {
                currency_code: CURRENCY,
                value: cartTax.toFixed(2),
              },
            }),
          },
        },
        items: cart.map(item => ({
          name: `${item.eventTitle} – ${item.categoryName}`.slice(0, 127),
          unit_amount: { currency_code: CURRENCY, value: item.total.toFixed(2) },
          quantity: String(item.quantity),
          category: 'DIGITAL_GOODS',
          description: `${item.eventDate} · ${item.eventTime}`.slice(0, 127),
        })),
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: 'Fox Theatre Atlanta',
        return_url: window.location.origin + '/checkout',
        cancel_url: window.location.origin + '/cart',
      },
    });
  }, [cart, cartTotal, cartSubtotal, cartFees, addOnTotal, cartTax, orderRef]);

  const onApprove = useCallback(async (data, actions) => {
    setIsCapturing(true);
    setOrderError('');
    try {
      // Step 1: Capture order on client
      const details = await actions.order.capture();
      console.info('[PayPal] Captured:', details.id, details.status);

      // Step 2: Send capture details to backend to verify payment and send tickets
      const response = await apiClient.post('/api/paypal-capture', {
        orderId: details.id,
        captureDetails: details,
        contact,
        cart,
        cartTotal,
        orderRef,
        paymentMethod: 'PayPal',
      });

      console.info('[Backend] Payment processed:', response.data);

      // Store payment result for success screen
      setPaymentResult({
        orderId: response.data.orderId,
        orderRef: response.data.orderRef,
        email: response.data.email,
        amount: cartTotal,
        paymentMethod: 'PayPal',
      });

      clearCart();
      setStep(3);
    } catch (err) {
      console.error('[PayPal] Error:', err);
      setOrderError(
        err.response?.data?.details ||
        'Your payment could not be completed. Please try again or use a different payment method.'
      );
    } finally {
      setIsCapturing(false);
    }
  }, [contact, cart, cartTotal, orderRef, clearCart]);

  const onError = useCallback((err) => {
    console.error('[PayPal] Error:', err);
    setOrderError('PayPal encountered an error. Please refresh the page or try another payment option.');
  }, []);

  const onCancel = useCallback(() => {
    setOrderError('Payment was cancelled. Your cart is still saved — you can try again whenever you\'re ready.');
  }, []);



  /* ── guard: empty cart ── */
  if (cartCount === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
          <Ticket size={36} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-white font-serif">Your cart is empty</h1>
        <p className="text-gray-400 max-w-sm">Add tickets to your cart before proceeding to checkout.</p>
        <Link to="/" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  /* ── success screen ── */
  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-16">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 sm:p-10 max-w-md w-full shadow-2xl">
          {/* Animated checkmark */}
          <div className="w-20 h-20 bg-green-900/30 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white font-serif mb-2">Order Confirmed!</h1>
          <p className="text-gray-300 mb-1">Thank you, <span className="text-white font-semibold">{contact.firstName || 'valued guest'}</span>!</p>
          <p className="text-gray-500 text-sm mb-6">
            Tickets sent to <span className="text-white">{paymentResult?.email || contact.email || 'your email'}</span>.
            <br />Check your inbox for digital tickets.
          </p>

          {/* Order ref */}
          <div className="bg-gray-800 rounded-xl p-4 mb-4 text-left border border-gray-700">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Order Reference</div>
            <div className="text-white font-mono font-bold text-lg tracking-widest">{paymentResult?.orderRef || orderRef}</div>
          </div>

          {/* Payment details */}
          {paymentResult && (
            <div className="bg-gray-800/50 rounded-xl p-3 mb-4 text-left border border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Details</div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Method:</span>
                  <span className="text-white font-medium">{paymentResult.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-green-400 font-bold">${paymentResult.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Ticket summary */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left space-y-2 border border-gray-700">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Tickets</div>
            {cart.length > 0 ? (
              <>
                {cart.map(item => (
                  <div key={`${item.eventId}-${item.categoryId}`} className="flex justify-between text-sm">
                    <div>
                      <div className="text-white font-medium">{item.quantity}× {item.categoryName}</div>
                      <div className="text-xs text-gray-500">{item.eventTitle}</div>
                      <div className="text-xs text-gray-600">{item.eventDate} · {item.eventTime}</div>
                    </div>
                    <span className="text-white font-semibold">${(item.total * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-white text-sm">
                  <span>Total Paid</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Your cart items will appear here</p>
            )}
          </div>

          {/* Next steps */}
          <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-3 mb-6 text-left">
            <div className="text-xs text-blue-300 font-semibold mb-2">📧 Check Your Email</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your digital tickets have been sent to your email address. Download the PDF and save it to your device for easy access at the venue.
            </p>
          </div>

          <div className="space-y-2">
            <Link to="/" className="block btn-primary text-center">Browse More Events</Link>
            <button 
              onClick={() => {
                // Simulate downloading tickets - in production, this would come from the backend
                const message = `Your tickets have been sent to ${paymentResult?.email || contact.email}. Please check your email to download them.`;
                alert(message);
              }}
              className="w-full border border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} />
              View Email Instructions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-6 sm:py-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step === 1 ? navigate('/cart') : setStep(1)}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">{step === 1 ? 'Back to Cart' : 'Back'}</span>
        </button>
        <h1 className="text-2xl font-bold text-white font-serif">Secure Checkout</h1>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 border border-green-900/50 bg-green-950/20 px-3 py-1 rounded-full">
          <Lock size={11} /> SSL Secured
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex items-center mb-8">
        {['Contact', 'Payment', 'Done'].map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 text-sm font-semibold shrink-0 ${
              step > i + 1 ? 'text-green-400' : step === i + 1 ? 'text-white' : 'text-gray-600'
            }`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                step > i + 1
                  ? 'bg-green-600 border-green-600 text-white'
                  : step === i + 1
                  ? 'bg-red-700 border-red-700 text-white shadow-lg shadow-red-900/40'
                  : 'border-gray-700 text-gray-600'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > i + 1 ? 'bg-green-600' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Mobile Order Summary Accordion ── */}
      <div className="lg:hidden mb-5 bg-gray-900 rounded-xl border border-gray-800">
        <button
          onClick={() => setSummaryOpen(o => !o)}
          className="w-full flex items-center justify-between p-4 text-sm"
        >
          <span className="flex items-center gap-2 text-white font-semibold">
            <Ticket size={15} className="text-red-500" />
            Order Summary — <span className="text-[#B8860B]">${cartTotal.toFixed(2)}</span>
          </span>
          {summaryOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {summaryOpen && (
          <div className="border-t border-gray-800">
            <OrderSummary
              cart={cart}
              selectedAddOns={selectedAddOns}
              cartCount={cartCount}
              cartSubtotal={cartSubtotal}
              cartFees={cartFees}
              addOnTotal={addOnTotal}
              cartTax={cartTax}
              cartTotal={cartTotal}
              step={step}
              contactEmail={contact.email}
            />
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Left column ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* STEP 1: Contact */}
          {step === 1 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <h2 className="text-white font-bold text-base flex items-center gap-2 font-serif">
                  <User size={18} className="text-red-500" /> Contact Information
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Tickets will be delivered to this email address</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'firstName', label: 'First Name', placeholder: 'John' },
                    { key: 'lastName', label: 'Last Name', placeholder: 'Smith' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1.5">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={contact[f.key]}
                        onChange={e => {
                          setContact(p => ({ ...p, [f.key]: e.target.value }));
                          if (contactErrors[f.key]) setContactErrors(p => ({ ...p, [f.key]: '' }));
                        }}
                        className={`w-full bg-gray-800 border text-white placeholder-gray-600 text-sm rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all ${
                          contactErrors[f.key] ? 'border-red-500 bg-red-950/10' : 'border-gray-700 hover:border-gray-600'
                        }`}
                      />
                      {contactErrors[f.key] && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {contactErrors[f.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={contact.email}
                      onChange={e => {
                        setContact(p => ({ ...p, email: e.target.value }));
                        if (contactErrors.email) setContactErrors(p => ({ ...p, email: '' }));
                      }}
                      className={`w-full bg-gray-800 border text-white placeholder-gray-600 text-sm rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all ${
                        contactErrors.email ? 'border-red-500 bg-red-950/10' : 'border-gray-700 hover:border-gray-600'
                      }`}
                    />
                  </div>
                  {contactErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {contactErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={contact.phone}
                      onChange={e => {
                        setContact(p => ({ ...p, phone: e.target.value }));
                        if (contactErrors.phone) setContactErrors(p => ({ ...p, phone: '' }));
                      }}
                      className={`w-full bg-gray-800 border text-white placeholder-gray-600 text-sm rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all ${
                        contactErrors.phone ? 'border-red-500 bg-red-950/10' : 'border-gray-700 hover:border-gray-600'
                      }`}
                    />
                  </div>
                  {contactErrors.phone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {contactErrors.phone}
                    </p>
                  )}
                </div>

                {/* Delivery info */}
                <div className="flex items-start gap-3 p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-xl">
                  <ShieldCheck size={15} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your information is encrypted and protected. Mobile tickets will be emailed immediately after payment confirmation.
                  </p>
                </div>

                <button
                  onClick={handleContactNext}
                  className="w-full btn-primary py-3.5 text-base"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <>
              {/* Contact summary */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Paying as</div>
                  <div className="text-white font-semibold text-sm">{contact.firstName} {contact.lastName}</div>
                  <div className="text-gray-400 text-xs">{contact.email}</div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-700/50 px-3 py-1.5 rounded transition-colors"
                >
                  Edit
                </button>
              </div>

              {/* Payment method */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="text-white font-bold text-base flex items-center gap-2 font-serif">
                    <CreditCard size={18} className="text-red-500" /> Payment Method
                  </h2>
                </div>
                <div className="p-6">
                  {/* ── PayPal payment section ── */}
                    <div>
                      {/* Amount badge */}
                      <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 text-sm">Amount due</span>
                        <span className="text-white font-bold text-lg">${cartTotal.toFixed(2)}</span>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 text-center leading-relaxed">
                        Choose your preferred PayPal payment option below.
                        You'll review your order before payment is charged.
                      </p>

                      {/* Loading overlay when capturing */}
                      {isCapturing ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-10">
                          <Loader size={36} className="text-[#0070BA] animate-spin" />
                          <p className="text-gray-300 text-sm font-semibold">Processing your payment…</p>
                          <p className="text-gray-500 text-xs">Please do not close this page</p>
                        </div>
                      ) : (
                        <PayPalButtonGroup
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                          onCancel={onCancel}
                        />
                      )}

                      {/* Error message */}
                      {orderError && (
                        <div className="mt-4 p-3.5 bg-red-950/30 border border-red-800 rounded-xl flex items-start gap-2.5 text-sm text-red-300">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <span className="flex-1">{orderError}</span>
                          <button onClick={() => setOrderError('')} className="text-red-500 hover:text-red-300 shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      {/* PayPal protections note */}
                      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/80px-PayPal.svg.png"
                          alt=""
                          className="h-3 opacity-50"
                        />
                        <span>Buyer Protection included with every PayPal transaction</span>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Trust badges */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Lock size={12} className="text-green-400" />
                    256-bit SSL Encryption
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-blue-400" />
                    PayPal Buyer Protection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-yellow-500" />
                    Instant Ticket Delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Ticket size={12} className="text-red-400" />
                    Official Fox Theatre Tickets
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right column: Order Summary (desktop) ── */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-24">
            <OrderSummary
              cart={cart}
              selectedAddOns={selectedAddOns}
              cartCount={cartCount}
              cartSubtotal={cartSubtotal}
              cartFees={cartFees}
              addOnTotal={addOnTotal}
              cartTax={cartTax}
              cartTotal={cartTotal}
              step={step}
              contactEmail={contact.email}
            />

            {/* Venue info */}
            <div className="mt-4 bg-gray-900 rounded-xl border border-gray-800 p-4 text-xs text-gray-500 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-gray-300 font-semibold">Fox Theatre Atlanta</div>
                  <div>660 Peachtree St NE, Atlanta, GA 30308</div>
                </div>
              </div>
              <p className="text-gray-600 border-t border-gray-800 pt-2">
                All sales are final. No refunds or exchanges except in the event of show cancellation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
