import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, CreditCard, Download, X } from 'lucide-react';

export const AnimatedTicket = ({
  ticketId = "0120034399434",
  amount = 0,
  date = new Date(),
  cardHolder = "Guest",
  last4Digits = "8237",
  barcodeValue = "28937261273650",
  eventTitle = "Event Title",
  eventLocation = "Event Venue",
  eventImage,
  onClose
}) => {
  const formattedDate = date instanceof Date ? date : new Date(date);
  
  const dateStr = formattedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeStr = formattedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print-overlay-container">
      <style>{`
        @media print {
          /* Hide everything in the document */
          body * {
            visibility: hidden !important;
          }
          /* Show only the printable ticket and its child elements */
          .printable-ticket, .printable-ticket * {
            visibility: visible !important;
          }
          /* Absolutely position the ticket in the printable area */
          .printable-ticket {
            position: absolute !important;
            left: 50% !important;
            top: 40% !important;
            transform: translate(-50%, -50%) scale(1.1) !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            width: 380px !important;
            max-width: 380px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Completely hide close and print actions during printing */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="relative max-w-sm w-full">
        {/* Close Button (floats above the ticket card) */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute -top-12 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors active:scale-90 no-print"
          >
            <X size={20} />
          </button>
        )}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-100 printable-ticket"
        >
          {/* Ticket Header & Top Section */}
          <div className={`relative text-white p-6 overflow-hidden ${!eventImage ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-red-950'}`}>
            {eventImage && (
              <>
                <img 
                  src={eventImage} 
                  alt={eventTitle} 
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                {/* Overlay gradient to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/85 to-black/35 z-10"></div>
              </>
            )}
            
            <div className="relative z-20">
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase">
                  Event Pass
                </span>
                <Ticket className="w-5 h-5 opacity-80" />
              </div>

              <h3 className="text-2xl font-black tracking-tight leading-tight mb-4 drop-shadow-md">{eventTitle}</h3>

              <div className="space-y-2 text-sm opacity-95">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="opacity-80" />
                  <span>{dateStr} • {timeStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="opacity-80" />
                  <span className="truncate">{eventLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* The Ticket Divider */}
          <div className="relative h-6 bg-gray-50 flex items-center">
            {/* Left punch */}
            <div className="absolute -left-3 w-6 h-6 rounded-full bg-black/60"></div>
            {/* Right punch */}
            <div className="absolute -right-3 w-6 h-6 rounded-full bg-black/60"></div>
            {/* Dashed line */}
            <div className="w-full border-t-2 border-dashed border-gray-300 mx-4"></div>
          </div>

          {/* Ticket Bottom Section */}
          <div className="bg-gray-50 p-6 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <span className="block text-gray-400 font-medium uppercase tracking-wider mb-0.5">Attendee</span>
                <span className="block text-gray-800 font-bold text-sm truncate">{cardHolder}</span>
              </div>
              <div>
                <span className="block text-gray-400 font-medium uppercase tracking-wider mb-0.5">Ticket ID</span>
                <span className="block text-gray-800 font-bold text-sm font-mono truncate">{ticketId.substring(0, 12)}</span>
              </div>
              <div>
                <span className="block text-gray-400 font-medium uppercase tracking-wider mb-0.5">Price</span>
                <span className="block text-gray-850 font-extrabold text-sm text-red-600">
                  {amount > 0 ? `₹${amount.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 font-medium uppercase tracking-wider mb-0.5">Payment</span>
                <span className="block text-gray-800 font-bold text-sm flex items-center gap-1.5">
                  <CreditCard size={14} className="text-gray-400" />
                  <span>•••• {last4Digits}</span>
                </span>
              </div>
            </div>

            {/* Barcode representation */}
            <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl">
              <div className="h-10 flex items-center gap-[1.5px] opacity-85">
                {Array.from({ length: 42 }).map((_, i) => {
                  const heights = ['h-8', 'h-10', 'h-7', 'h-9'];
                  const widths = ['w-[1.5px]', 'w-[2.5px]', 'w-[1px]', 'w-[3px]'];
                  const randomH = heights[i % heights.length];
                  const randomW = widths[(i * 7) % widths.length];
                  return <div key={i} className={`${randomH} ${randomW} bg-black`}></div>;
                })}
              </div>
              <span className="mt-2 text-[10px] font-mono tracking-[4px] text-gray-500">{barcodeValue}</span>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3 no-print">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-black text-white hover:bg-gray-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
