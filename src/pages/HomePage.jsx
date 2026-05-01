import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight, Ticket } from 'lucide-react';
import { events } from '../data/events';

export default function HomePage() {
  const featured = events[0];
  const rest = events.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[520px] md:h-[600px] overflow-hidden">
        <img
          src={featured.image}
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-xl">
              <span className="inline-block bg-red-700 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-widest mb-4">
                Featured Event
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-serif leading-tight mb-2">
                {featured.title}
              </h1>
              <p className="text-[#B8860B] text-lg mb-4">{featured.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-300 mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-red-500" />
                  {featured.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-red-500" />
                  {featured.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-red-500" />
                  {featured.venue}, {featured.city}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-8 line-clamp-3">
                {featured.description}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to={`/events/${featured.id}`} className="btn-primary">
                  <Ticket size={16} className="inline mr-2" />
                  Buy Tickets
                </Link>
                <Link
                  to={`/events/${featured.id}`}
                  className="border border-white/40 text-white hover:bg-white/10 font-semibold py-3 px-6 rounded transition-colors text-sm uppercase tracking-wide"
                >
                  More Info
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb / venue banner */}
      <div className="bg-[#111] py-3 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400">
          <span>Fox Theatre</span>
          <ChevronRight size={12} />
          <span className="text-gray-200">Upcoming Events</span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white font-serif">Upcoming Events</h2>
            <p className="text-gray-400 text-sm mt-1">Experience world-class entertainment at the historic Fox Theatre</p>
          </div>
          <button className="hidden md:flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded transition-colors">
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['All', 'Concert', 'Broadway', 'Comedy', 'Special Events'].map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                i === 0
                  ? 'bg-red-700 border-red-700 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured card (large) */}
          <div className="md:col-span-2 lg:col-span-1 group cursor-pointer">
            <Link to={`/events/${featured.id}`}>
              <div className="relative overflow-hidden rounded-lg bg-gray-900">
                <img
                  src={featured.thumbImage}
                  alt={featured.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-red-700 text-white text-xs px-2 py-1 rounded font-semibold">Featured</span>
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">{featured.genre}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg font-serif leading-tight mb-1 group-hover:text-red-400 transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-3">{featured.subtitle}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {featured.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {featured.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">From</span>
                      <span className="text-white font-bold ml-1">${featured.ticketCategories.at(-1).price}</span>
                    </div>
                    <span className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase">
                      Buy Tickets
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Other events */}
          {rest.map(event => (
            <Link to={`/events/${event.id}`} key={event.id} className="group">
              <div className="relative overflow-hidden rounded-lg bg-gray-900 hover:ring-1 hover:ring-red-700 transition-all duration-200">
                <img
                  src={event.thumbImage}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">{event.genre}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-base font-serif leading-tight mb-1 group-hover:text-red-400 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-col gap-1 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {event.date} · {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {event.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">From</span>
                      <span className="text-white font-bold ml-1">${event.ticketCategories.at(-1).price}</span>
                    </div>
                    <span className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors uppercase">
                      Tickets
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#111] border-t border-b border-gray-800 py-10 px-4 mt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🎭', title: 'Historic Venue', desc: 'Experience performances in the landmark 1929 Egyptian-inspired theatre' },
            { icon: '🎟️', title: 'Easy Ticketing', desc: 'Mobile, print-at-home, or will-call ticket delivery options' },
            { icon: '⭐', title: 'World-Class Shows', desc: 'Broadway, concerts, comedy, and special events year-round' },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-2">
              <span className="text-4xl">{item.icon}</span>
              <h3 className="text-white font-bold">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
