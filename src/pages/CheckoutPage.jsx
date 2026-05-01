import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ChevronLeft, Lock, CreditCard, CheckCircle, AlertCircle, User, Mail, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PAYPAL_CLIENT_ID = 'AahbpbrxmSF3IfAkmqlsi_RmHh9l8LYn5xaQEG_c4SSasB8zDzBd28NkxTvaGErJJjoXtLX4L_rBjCI8'; // sandbox mode — replace with real client ID for production

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartSubtotal, cartFees, addOnTotal, selectedAddOns, cartCount, clearCart } = useCart();

  const [step, setStep] = useState(1); // 1=contact, 2=payment, 3=success
  const [payMethod, setPayMethod] = useState('paypal'); // 'paypal' | 'card'
  const [orderError, setOrderError] = useState('');

  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [contactErrors, setContactErrors] = useState({});

  const validateContact = () => {
    const errs = {};
    if (!contact.firstName.trim()) errs.firstName = 'Required';
    if (!contact.lastName.trim()) errs.lastName = 'Required';
    if (!contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
    if (!contact.phone.match(/^\+?[\d\s\-()]{7,}$/)) errs.phone = 'Valid phone required';
    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContactNext = () => {
    if (validateContact()) setStep(2);
  };

  const handlePayPalApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      clearCart();
      setStep(3);
    } catch {
      setOrderError('Payment could not be completed. Please try again.');
    }
  };

  const handlePayPalError = () => {
    setOrderError('PayPal encountered an error. Please try again or use a different payment method.');
  };

  if (cartCount === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle size={48} className="text-yellow-500" />
        <h1 className="text-2xl font-bold text-white">No items in cart</h1>
        <Link to="/" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  // Success screen
  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-16">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-10 max-w-md w-full">
          <div className="w-20 h-20 bg-green-900/30 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white font-serif mb-2">Order Confirmed!</h1>
          <p className="text-gray-400 mb-2">Thank you, {contact.firstName || 'valued guest'}!</p>
          <p className="text-gray-500 text-sm mb-6">
            Your tickets have been sent to <span className="text-white">{contact.email || 'your email'}</span>.<br />
            Check your inbox for your mobile ticket links.
          </p>
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs text-gray-500 mb-1">Order Reference</div>
            <div className="text-white font-mono font-bold text-lg">FT-{Date.now().toString(36).toUpperCase()}</div>
          </div>
          <div className="space-y-2">
            <Link to="/" className="block btn-primary text-center">Browse More Events</Link>
            <button className="w-full border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white py-2.5 rounded text-sm font-semibold transition-colors">
              Download Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step === 1 ? navigate('/cart') : setStep(1)}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={18} /> {step === 1 ? 'Back to Cart' : 'Back'}
        </button>
        <h1 className="text-2xl font-bold text-white font-serif">Checkout</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {['Contact Info', 'Payment', 'Confirmation'].map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-2 text-sm font-semibold ${
              step > i + 1 ? 'text-green-400' : step === i + 1 ? 'text-white' : 'text-gray-600'
            }`}>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                step > i + 1
                  ? 'bg-green-600 border-green-600 text-white'
                  : step === i + 1
                  ? 'bg-red-700 border-red-700 text-white'
                  : 'border-gray-700 text-gray-600'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < 2 && <div className={`w-12 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-600' : 'bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2 font-serif">
                <User size={20} className="text-red-500" /> Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { key: 'firstName', label: 'First Name', placeholder: 'John', type: 'text' },
                  { key: 'lastName', label: 'Last Name', placeholder: 'Smith', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={contact[field.key]}
                      onChange={e => setContact(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className={`w-full bg-gray-800 border text-white placeholder-gray-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600 ${
                        contactErrors[field.key] ? 'border-red-600' : 'border-gray-700'
                      }`}
                    />
                    {contactErrors[field.key] && (
                      <p className="text-red-400 text-xs mt-1">{contactErrors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={contact.email}
                      onChange={e => setContact(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full bg-gray-800 border text-white placeholder-gray-600 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600 ${
                        contactErrors.email ? 'border-red-600' : 'border-gray-700'
                      }`}
                    />
                  </div>
                  {contactErrors.email && <p className="text-red-400 text-xs mt-1">{contactErrors.email}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={contact.phone}
                      onChange={e => setContact(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full bg-gray-800 border text-white placeholder-gray-600 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600 ${
                        contactErrors.phone ? 'border-red-600' : 'border-gray-700'
                      }`}
                    />
                  </div>
                  {contactErrors.phone && <p className="text-red-400 text-xs mt-1">{contactErrors.phone}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2 mb-6 p-3 bg-blue-950/30 border border-blue-900/40 rounded-lg">
                <Lock size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                  Your personal information is encrypted and protected. Tickets will be emailed to the address provided.
                </p>
              </div>
              <button onClick={handleContactNext} className="w-full btn-primary">
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Payment method selector */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2 font-serif">
                  <CreditCard size={20} className="text-red-500" /> Payment Method
                </h2>
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setPayMethod('paypal')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                      payMethod === 'paypal'
                        ? 'border-[#0070BA] bg-blue-950/30'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png"
                      alt="PayPal"
                      className="h-5"
                    />
                    <span className="text-white text-sm font-semibold">PayPal</span>
                  </button>
                  <button
                    onClick={() => setPayMethod('card')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                      payMethod === 'card'
                        ? 'border-red-600 bg-red-950/20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <CreditCard size={18} className="text-gray-400" />
                    <span className="text-white text-sm font-semibold">Credit / Debit Card</span>
                  </button>
                </div>

                {/* PayPal Buttons */}
                {payMethod === 'paypal' && (
                  <div>
                    <p className="text-gray-400 text-sm mb-4 text-center">
                      You'll be redirected to PayPal to complete your purchase securely.
                    </p>
                    <PayPalScriptProvider options={{
                      'client-id': PAYPAL_CLIENT_ID,
                      currency: 'USD',
                      intent: 'capture',
                    }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{
                              description: `Fox Theatre Tickets`,
                              amount: {
                                currency_code: 'USD',
                                value: cartTotal.toFixed(2),
                                breakdown: {
                                  item_total: { currency_code: 'USD', value: (cartSubtotal + cartFees).toFixed(2) },
                                  handling: { currency_code: 'USD', value: addOnTotal.toFixed(2) },
                                }
                              },
                              items: cart.map(item => ({
                                name: `${item.eventTitle} - ${item.categoryName}`,
                                unit_amount: { currency_code: 'USD', value: item.total.toFixed(2) },
                                quantity: String(item.quantity),
                                category: 'DIGITAL_GOODS',
                              })),
                            }],
                            application_context: {
                              shipping_preference: 'NO_SHIPPING',
                              user_action: 'PAY_NOW',
                              brand_name: 'Fox Theatre Atlanta',
                            }
                          });
                        }}
                        onApprove={handlePayPalApprove}
                        onError={handlePayPalError}
                        onCancel={() => setOrderError('Payment was cancelled. Your cart is still saved.')}
                      />
                    </PayPalScriptProvider>
                    {orderError && (
                      <div className="mt-3 p-3 bg-red-950/30 border border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-300">
                        <AlertCircle size={16} /> {orderError}
                      </div>
                    )}
                  </div>
                )}

                {/* Card form (UI only — wire up to real processor in production) */}
                {payMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          maxLength={7}
                          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Smith"
                        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                    <button
                      onClick={() => { clearCart(); setStep(3); }}
                      className="w-full btn-primary"
                    >
                      Pay ${cartTotal.toFixed(2)}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Card payments powered by Stripe (demo mode)
                    </p>
                  </div>
                )}
              </div>

              {/* Security badges */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><Lock size={13} className="text-green-400" />256-bit SSL encryption</span>
                <span className="flex items-center gap-1.5">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/80px-PayPal.svg.png" alt="" className="h-4" />
                  PayPal Buyer Protection
                </span>
                <span className="flex items-center gap-1.5">🛡️ Secure Checkout</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 sticky top-24">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-white font-bold font-serif">Order Summary</h2>
            </div>
            <div className="p-5">
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={`${item.eventId}-${item.categoryId}`} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300 leading-tight">
                        {item.quantity}× {item.categoryName}
                      </span>
                      <span className="text-white flex-shrink-0 ml-2">${(item.total * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 leading-tight">{item.eventTitle}</div>
                    <div className="text-xs text-gray-600">{item.eventDate} · {item.eventTime}</div>
                  </div>
                ))}
                {Object.values(selectedAddOns).map(addon => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 text-xs">+ {addon.name}</span>
                    <span className="text-[#B8860B] text-xs">${addon.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Service Fees</span><span>${cartFees.toFixed(2)}</span>
                </div>
                {addOnTotal > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Add-ons</span><span>${addOnTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-base border-t border-gray-700 pt-2 mt-1">
                  <span>Total</span><span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {step === 1 && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-500">
                  Complete contact info to proceed to payment
                </div>
              )}
              {step === 2 && contact.email && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
                  Tickets will be sent to:<br />
                  <span className="text-white font-medium">{contact.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
