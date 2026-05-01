import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, ChevronLeft, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { useCart } from '../context/useCart';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, selectedAddOns, cartSubtotal, cartFees, addOnTotal, cartTax, cartTotal, cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
        <ShoppingCart size={64} className="text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-white font-serif mb-2">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-6">Browse upcoming events and add tickets to get started.</p>
        <Link to="/" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  // Group add-ons by event
  const addOnsByEvent = Object.values(selectedAddOns).reduce((acc, a) => {
    if (!acc[a.eventId]) acc[a.eventId] = [];
    acc[a.eventId].push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
          <ChevronLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-white font-serif">Your Cart</h1>
        <span className="bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={`${item.eventId}-${item.categoryId}`} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-900/30 border border-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ticket size={22} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold font-serif leading-tight">{item.eventTitle}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                    <span className="flex items-center gap-1"><Calendar size={11} />{item.eventDate}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{item.eventTime}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{item.venue}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-medium">
                      {item.categoryName}
                    </span>
                    <span className="text-xs text-gray-500">×{item.quantity}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold">${(item.total * item.quantity).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">${item.total.toFixed(2)} each</div>
                  <button
                    onClick={() => removeFromCart(item.eventId, item.categoryId)}
                    className="mt-2 text-gray-600 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Add-ons for this event */}
              {addOnsByEvent[item.eventId]?.map(addon => (
                <div key={addon.id} className="mt-3 ml-16 flex items-center justify-between text-sm bg-gray-800 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-gray-300 font-medium">+ {addon.name}</span>
                    <p className="text-xs text-gray-500">{addon.description}</p>
                  </div>
                  <span className="text-[#B8860B] font-bold flex-shrink-0 ml-4">${addon.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ))}

          {/* Promo code */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Have a Promo Code?</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded px-3 py-2 focus:outline-none focus:border-gray-500"
              />
              <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
                Apply
              </button>
            </div>
          </div>

          {/* Delivery method */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Ticket Delivery</h3>
            <div className="space-y-2">
              {[
                { id: 'mobile', label: 'Mobile Ticket', sub: 'Access via the Fox Theatre app or email link', price: 'Free' },
                { id: 'email', label: 'Print-at-Home', sub: 'PDF sent to your email', price: 'Free' },
                { id: 'willcall', label: 'Will Call', sub: 'Pick up at box office night of show', price: 'Free' },
              ].map((method, i) => (
                <label key={method.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    defaultChecked={i === 0}
                    className="accent-red-600"
                  />
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{method.label}</div>
                    <div className="text-xs text-gray-400">{method.sub}</div>
                  </div>
                  <span className="text-green-400 text-xs font-semibold">{method.price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 sticky top-24">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-white font-bold font-serif">Order Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Tickets ({cartCount})</span>
                <span className="text-white">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Service Fees</span>
                <span className="text-white">${cartFees.toFixed(2)}</span>
              </div>
              {addOnTotal > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Add-ons</span>
                  <span className="text-white">${addOnTotal.toFixed(2)}</span>
                </div>
              )}
              {cartTax > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Estimated Tax</span>
                  <span className="text-white">${cartTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Delivery</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
              >
                Checkout <ArrowRight size={16} />
              </button>

              {/* PayPal quick checkout */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-3 px-6 rounded transition-colors text-sm"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png"
                  alt="PayPal"
                  className="h-4 filter brightness-0 invert"
                />
                Pay with PayPal
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                All sales final. See our <a href="#" className="text-gray-400 underline">ticket policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
