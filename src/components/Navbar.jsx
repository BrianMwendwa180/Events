import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/useCart';

export default function Navbar() {
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#0a0a0a] py-1 px-4 text-xs text-gray-400 flex justify-between items-center max-w-7xl mx-auto">
        <span className="flex items-center gap-1">
          <Phone size={11} /> (855) 285-8499
        </span>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/" className="hover:text-white transition-colors">My Account</Link>
          <Link to="/" className="hover:text-white transition-colors">Help</Link>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex flex-col leading-none">
            <span className="text-red-600 font-bold text-2xl tracking-wider font-serif">THE FOX</span>
            <span className="text-[#B8860B] text-xs tracking-[0.3em] uppercase">Theatre</span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wide">Events</Link>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wide">Broadway</Link>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wide">Concerts</Link>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wide">Subscriptions</Link>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wide">Group Sales</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="hidden md:flex text-gray-400 hover:text-white p-2 transition-colors">
            <Search size={18} />
          </button>
          <button className="hidden md:flex items-center gap-1 text-gray-400 hover:text-white text-sm p-2 transition-colors">
            <User size={18} />
            <span className="hidden lg:inline">Sign In</span>
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded transition-colors text-sm"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#B8860B] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-gray-800 px-4 py-4 flex flex-col gap-3">
          {['Events', 'Broadway', 'Concerts', 'Subscriptions', 'Group Sales'].map(item => (
            <Link
              key={item}
              to="/"
              className="text-gray-300 hover:text-white py-2 border-b border-gray-800 text-sm uppercase tracking-wide"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link to="/" className="text-gray-300 hover:text-white py-2 text-sm flex items-center gap-2">
            <User size={16} /> Sign In / My Account
          </Link>
        </div>
      )}
    </header>
  );
}
