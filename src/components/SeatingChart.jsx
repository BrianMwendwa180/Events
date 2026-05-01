import { useState, useMemo } from 'react';

function generateSection(rows, cols, startRow, sectionId, unavailableRatio = 0.15) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const isUnavailable = Math.random() < unavailableRatio;
      return {
        id: `${sectionId}-${startRow + r}-${c}`,
        row: String.fromCharCode(65 + startRow + r),
        num: c + 1,
        section: sectionId,
        available: !isUnavailable,
      };
    })
  );
}

export default function SeatingChart({ event, onSeatsChange }) {
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Generate deterministic seating layout
  const sections = useMemo(() => {
    // Seed-based deterministic unavailability using event ID
    const seed = event.id.charCodeAt(0) / 100;
    return {
      floor: generateSection(3, 14, 0, 'floor', 0.2 + seed * 0.1),
      orchestraL: generateSection(6, 8, 0, 'orchestraL', 0.15),
      orchestraC: generateSection(6, 12, 0, 'orchestraC', 0.12),
      orchestraR: generateSection(6, 8, 0, 'orchestraR', 0.15),
      mezzL: generateSection(4, 7, 6, 'mezzL', 0.1),
      mezzC: generateSection(4, 10, 6, 'mezzC', 0.08),
      mezzR: generateSection(4, 7, 6, 'mezzR', 0.1),
      balconyL: generateSection(3, 6, 10, 'balconyL', 0.05),
      balconyC: generateSection(3, 9, 10, 'balconyC', 0.05),
      balconyR: generateSection(3, 6, 10, 'balconyR', 0.05),
    };
  }, [event.id]);

  const catColors = {
    floor: '#22c55e',
    orchestraL: '#3b82f6', orchestraC: '#3b82f6', orchestraR: '#3b82f6',
    mezzL: '#B8860B', mezzC: '#B8860B', mezzR: '#B8860B',
    balconyL: '#6b7280', balconyC: '#6b7280', balconyR: '#6b7280',
  };

  const toggleSeat = (seat) => {
    if (!seat.available) return;
    let updated;
    if (selectedSeats.find(s => s.id === seat.id)) {
      updated = selectedSeats.filter(s => s.id !== seat.id);
    } else {
      if (selectedSeats.length >= 8) return; // max 8 seats
      updated = [...selectedSeats, seat];
    }
    setSelectedSeats(updated);
    onSeatsChange(updated);
  };

  const isSelected = (id) => selectedSeats.some(s => s.id === id);

  const renderSection = (sectionKey, sectionData, label) => (
    <div className="flex flex-col items-center gap-0.5" title={label}>
      {sectionData.map((row, ri) => (
        <div key={ri} className="flex gap-0.5">
          {row.map(seat => (
            <div
              key={seat.id}
              title={seat.available ? `Row ${seat.row}, Seat ${seat.num} - ${label}` : 'Unavailable'}
              onClick={() => toggleSeat(seat)}
              className={`w-3.5 h-3.5 rounded-t-sm cursor-pointer transition-all duration-100 ${
                !seat.available
                  ? 'bg-gray-700 opacity-40 cursor-not-allowed'
                  : isSelected(seat.id)
                  ? 'scale-110 ring-1 ring-white'
                  : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{
                backgroundColor: !seat.available
                  ? '#374151'
                  : isSelected(seat.id)
                  ? '#ffffff'
                  : catColors[sectionKey]
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-950 rounded-xl p-4 md:p-6 w-full">
      {/* Stage */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="bg-gradient-to-b from-gray-200 to-gray-400 text-gray-900 font-bold text-sm px-16 py-3 rounded-b-full text-center tracking-widest uppercase shadow-lg">
            STAGE
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gray-600 blur-sm rounded-full" />
        </div>
      </div>

      {/* Floor */}
      <div className="flex justify-center mb-3">
        <div className="flex flex-col items-center">
          <span className="text-xs text-green-400 mb-1 font-semibold uppercase tracking-widest">Floor</span>
          {renderSection('floor', sections.floor, 'Floor')}
        </div>
      </div>

      {/* Orchestra */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="flex flex-col items-center">
          <span className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-widest">Orch L</span>
          {renderSection('orchestraL', sections.orchestraL, 'Orchestra Left')}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-widest">Orchestra</span>
          {renderSection('orchestraC', sections.orchestraC, 'Orchestra Center')}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-widest">Orch R</span>
          {renderSection('orchestraR', sections.orchestraR, 'Orchestra Right')}
        </div>
      </div>

      {/* Mezzanine */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1 font-semibold uppercase tracking-widest" style={{color:'#B8860B'}}>Mezz L</span>
          {renderSection('mezzL', sections.mezzL, 'Mezzanine Left')}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1 font-semibold uppercase tracking-widest" style={{color:'#B8860B'}}>Mezzanine</span>
          {renderSection('mezzC', sections.mezzC, 'Mezzanine Center')}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1 font-semibold uppercase tracking-widest" style={{color:'#B8860B'}}>Mezz R</span>
          {renderSection('mezzR', sections.mezzR, 'Mezzanine Right')}
        </div>
      </div>

      {/* Balcony */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-widest">Balc L</span>
          {renderSection('balconyL', sections.balconyL, 'Balcony Left')}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-widest">Balcony</span>
          {renderSection('balconyC', sections.balconyC, 'Balcony Center')}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-widest">Balc R</span>
          {renderSection('balconyR', sections.balconyR, 'Balcony Right')}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs border-t border-gray-800 pt-4">
        {[
          { color: '#22c55e', label: 'Floor' },
          { color: '#3b82f6', label: 'Orchestra' },
          { color: '#B8860B', label: 'Mezzanine' },
          { color: '#6b7280', label: 'Balcony' },
          { color: '#374151', label: 'Unavailable', opacity: '0.4' },
          { color: '#ffffff', label: 'Selected', ring: true },
        ].map(({ color, label, opacity, ring }) => (
          <span key={label} className="flex items-center gap-1.5 text-gray-400">
            <span
              className={`w-3 h-3 rounded-sm inline-block ${ring ? 'ring-1 ring-gray-500' : ''}`}
              style={{ backgroundColor: color, opacity: opacity || 1 }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* Selected seats info */}
      {selectedSeats.length > 0 && (
        <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">
            <span className="text-white font-semibold">{selectedSeats.length}</span> seat{selectedSeats.length > 1 ? 's' : ''} selected
            <span className="text-gray-500 ml-2">(max 8)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(s => (
              <span key={s.id} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
                Row {s.row}, Seat {s.num}
                <button
                  onClick={() => toggleSeat(s)}
                  className="ml-1.5 text-gray-400 hover:text-red-400"
                >×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
