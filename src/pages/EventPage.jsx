import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Info, ChevronRight, Minus, Plus,
  Ticket, ShoppingCart, Star, Share2, Heart, CheckCircle, AlertCircle
} from 'lucide-react';
import { getEventById } from '../data/events';
import { useCart } from '../context/useCart';
import SeatingChart from '../components/SeatingChart';

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = getEventById(id);
  const { addToCart, toggleAddOn, selectedAddOns } = useCart();

  const [quantities, setQuantities] = useState({});
  const [selectedTab, setSelectedTab] = useState('tickets'); // 'tickets' | 'seating' | 'info'
  const [addedToast, setAddedToast] = useState(false);
  const [, setSelectedSeats] = useState([]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h1 className="text-2xl font-bold text-white">Event Not Found</h1>
        <Link to="/" className="btn-primary">Back to Events</Link>
      </div>
    );
  }

  const updateQty = (catId, delta) => {
    setQuantities(prev => {
      const next = Math.max(0, Math.min(8, (prev[catId] || 0) + delta));
      return { ...prev, [catId]: next };
    });
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const subtotal = event.ticketCategories.reduce((sum, cat) => {
    return sum + (quantities[cat.id] || 0) * cat.price;
  }, 0);
  const fees = event.ticketCategories.reduce((sum, cat) => {
    return sum + (quantities[cat.id] || 0) * cat.fee;
  }, 0);

  const handleAddToCart = () => {
    let added = false;
    event.ticketCategories.forEach(cat => {
      const qty = quantities[cat.id] || 0;
      if (qty > 0) {
        addToCart(event, cat, qty);
        added = true;
      }
    });
    if (added) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const isAddOnSelected = (addOnId) => !!selectedAddOns[`${event.id}-${addOnId}`];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-3 sm:px-4 pb-4 sm:pb-6 w-full">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 overflow-x-auto">
            <Link to="/" className="hover:text-white flex-shrink-0">Home</Link>
            <ChevronRight size={12} className="flex-shrink-0" />
            <Link to="/" className="hover:text-white flex-shrink-0">Events</Link>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="text-gray-200 truncate">{event.title}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs bg-red-700 text-white px-2 py-0.5 rounded uppercase tracking-wider font-semibold inline-block">
                {event.category}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white font-serif mt-2 leading-tight break-words">
                {event.title}
              </h1>
              <p className="text-[#B8860B] text-xs sm:text-sm mt-1">{event.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors flex-shrink-0">
                  <Share2 size={16} />
                </button>
                <button className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors flex-shrink-0">
                  <Heart size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> {/* ← FIX: closes .relative.h-48 hero wrapper */}

      {/* Quick info bar */}
      <div className="bg-[#111] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar size={14} className="text-red-500" />
            <span className="hidden sm:inline">{event.date}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock size={14} className="text-red-500" />
            <span className="hidden sm:inline">Doors {event.doorsOpen} · Show {event.time}</span>
            <span className="sm:hidden">{event.time}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <MapPin size={14} className="text-red-500" />
            {event.venue}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded flex-shrink-0">
            {event.ageRestriction}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left: tabs + content */}
          <div className="lg:col-span-2 order-1 lg:order-none">
            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-800 mb-4 sm:mb-6 overflow-x-auto">
              {[
                { key: 'tickets', label: 'Select Tickets' },
                { key: 'seating', label: 'Seating Chart' },
                { key: 'info', label: 'Event Info' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    selectedTab === tab.key
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Ticket Selection Tab */}
            {selectedTab === 'tickets' && (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-400 mb-4">
                  Select ticket quantities below (max 8 tickets per order). Fees are included in the total.
                </p>
                {event.ticketCategories.map(cat => (
                  <div key={cat.id} className="bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-800 hover:border-gray-600 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-bold text-sm sm:text-base">{cat.name}</div>
                          <div className="text-xs text-gray-400">
                            ${cat.price.toFixed(2)} + ${cat.fee.toFixed(2)} fee
                            <span className="ml-2 text-green-400">{cat.available} available</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 justify-between w-full sm:w-auto">
                        <div className="text-right">
                          <div className="text-white font-bold text-sm sm:text-base">${cat.total.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">per ticket</div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 bg-gray-800 rounded-lg">
                          <button
                            onClick={() => updateQty(cat.id, -1)}
                            className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-30"
                            disabled={!quantities[cat.id]}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 sm:w-8 text-center text-white font-bold text-sm">
                            {quantities[cat.id] || 0}
                          </span>
                          <button
                            onClick={() => updateQty(cat.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors disabled:opacity-30"
                            disabled={totalTickets >= 8}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add-ons */}
                {event.addOns?.length > 0 && (
                  <div className="mt-5 sm:mt-6">
                    <h3 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Star size={16} className="text-[#B8860B] flex-shrink-0" />
                      Enhance Your Experience
                    </h3>
                    <div className="space-y-2">
                      {event.addOns.map(addon => (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddOn(event.id, addon)}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                            isAddOnSelected(addon.id)
                              ? 'border-[#B8860B] bg-yellow-950/30'
                              : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isAddOnSelected(addon.id) ? 'border-[#B8860B] bg-[#B8860B]' : 'border-gray-600'
                            }`}>
                              {isAddOnSelected(addon.id) && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white text-xs sm:text-sm font-semibold">{addon.name}</div>
                              <div className="text-xs text-gray-400 line-clamp-1">{addon.description}</div>
                            </div>
                          </div>
                          <div className="text-white font-bold text-xs sm:text-sm ml-2 flex-shrink-0">
                            +${addon.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seating Chart Tab */}
            {selectedTab === 'seating' && (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Click individual seats to select them, or use the ticket quantity selectors on the Tickets tab.
                </p>
                <SeatingChart event={event} onSeatsChange={setSelectedSeats} />
              </div>
            )}

            {/* Event Info Tab */}
            {selectedTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg mb-3 font-serif">About This Event</h3>
                  <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                    {event.longDescription.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Venue', value: event.venue },
                    { label: 'Address', value: event.address },
                    { label: 'Date', value: event.date },
                    { label: 'Doors Open', value: event.doorsOpen },
                    { label: 'Show Time', value: event.time },
                    { label: 'Duration', value: event.duration },
                    { label: 'Age Restriction', value: event.ageRestriction },
                    { label: 'Genre', value: event.genre },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-900 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className="text-white text-sm font-medium">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>All ticket sales are final. No refunds or exchanges except in the event of cancellation.</p>
                      <p>Latecomers may be seated at the discretion of theatre management.</p>
                      <p>Photography and recording are not permitted without express written permission.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-none">
            <div className="bg-gray-900 rounded-lg sm:rounded-xl border border-gray-800 lg:sticky lg:top-24">
              <div className="p-4 sm:p-5 border-b border-gray-800">
                <h2 className="text-white font-bold text-base sm:text-lg font-serif">Order Summary</h2>
                <p className="text-xs text-gray-400 mt-1">{event.date} · {event.time}</p>
              </div>

              <div className="p-4 sm:p-5">
                {totalTickets === 0 && Object.keys(selectedAddOns).filter(k => k.startsWith(event.id)).length === 0 ? (
                  <div className="text-center py-4 sm:py-6">
                    <Ticket size={32} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs sm:text-sm">No tickets selected yet</p>
                    <p className="text-gray-600 text-xs mt-1">Choose ticket categories above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Tickets in cart */}
                    {event.ticketCategories.filter(cat => quantities[cat.id] > 0).map(cat => (
                      <div key={cat.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {quantities[cat.id]}x {cat.name}
                        </span>
                        <span className="text-white">${(cat.total * quantities[cat.id]).toFixed(2)}</span>
                      </div>
                    ))}
                    {/* Add-ons */}
                    {Object.values(selectedAddOns)
                      .filter(a => a.eventId === event.id)
                      .map(a => (
                        <div key={a.id} className="flex justify-between text-sm">
                          <span className="text-gray-400 text-xs">+ {a.name}</span>
                          <span className="text-[#B8860B] text-xs">${a.price.toFixed(2)}</span>
                        </div>
                      ))}
                    <div className="border-t border-gray-700 pt-3 space-y-1.5">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Subtotal ({totalTickets} tickets)</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Service Fees</span>
                        <span>${fees.toFixed(2)}</span>
                      </div>
                      {Object.values(selectedAddOns).filter(a => a.eventId === event.id).length > 0 && (
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Add-ons</span>
                          <span>
                            ${Object.values(selectedAddOns)
                              .filter(a => a.eventId === event.id)
                              .reduce((s, a) => s + a.price, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-white font-bold text-base border-t border-gray-700 pt-2 mt-2">
                        <span>Total</span>
                        <span>
                          ${(
                            subtotal +
                            fees +
                            Object.values(selectedAddOns)
                              .filter(a => a.eventId === event.id)
                              .reduce((s, a) => s + a.price, 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 sm:mt-5 space-y-2">
                  <button
                    onClick={handleBuyNow}
                    disabled={totalTickets === 0}
                    className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-center text-sm sm:text-base py-2.5 sm:py-3"
                  >
                    Checkout Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={totalTickets === 0}
                    className="w-full flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 py-2 sm:py-2.5 px-3 sm:px-4 rounded text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>

                {/* Security */}
                <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure checkout · SSL encrypted
                </div>

                {/* Payment logos */}
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  {['Visa', 'MC', 'Amex', 'PayPal'].map(p => (
                    <span key={p} className="text-[10px] font-bold px-2 py-0.5 border border-gray-700 rounded text-gray-500">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-green-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle size={18} />
          Tickets added to cart!
        </div>
      )}
    </div>
  );
}