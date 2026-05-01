import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <div className="text-red-600 font-bold text-2xl tracking-wider font-serif">THE FOX</div>
              <div className="text-[#B8860B] text-xs tracking-[0.3em] uppercase">Theatre</div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Atlanta's premier entertainment destination since 1929. Experience world-class performances in a historic landmark.
            </p>
            <div className="flex gap-3 mt-4">
              {['f', 'ig', 'tw', 'yt'].map((name) => (
                <a key={name} href="#" className="text-gray-500 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded border border-gray-700 hover:border-gray-500 text-xs font-bold">
                  {name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wide text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['All Events', 'Broadway Series', 'Concerts', 'Group Sales', 'Gift Cards', 'Subscriptions', 'Accessibility'].map(l => (
                <li key={l}>
                  <Link to="/" className="hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wide text-sm">My Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Sign In', 'Create Account', 'Order History', 'Print Tickets', 'Mobile Tickets', 'Transfer Tickets', 'Help & FAQ'].map(l => (
                <li key={l}>
                  <Link to="/" className="hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wide text-sm">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-red-600" />
                <span>660 Peachtree St NE<br />Atlanta, GA 30308</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-red-600" />
                <a href="tel:8552858499" className="hover:text-white transition-colors">(855) 285-8499</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-red-600" />
                <a href="mailto:info@foxtheatre.org" className="hover:text-white transition-colors">info@foxtheatre.org</a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-500">
              <strong className="text-gray-400 block mb-1">Box Office Hours</strong>
              Mon–Fri: 10AM – 6PM<br />
              Sat: 10AM – 4PM<br />
              Sun: Closed (Event days open early)
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 The Fox Theatre, Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
