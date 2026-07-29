import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, RefreshCw } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUrl?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, bookingUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check window size to toggle between mobile (clean cards view) and desktop (full info view)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Base embed URLs
  const baseEmbed = "https://booking.builderall.com/embed/067d9e4d8e52fc90372e8da99eb78a54";
  
  // Decide targetUrl:
  // - On mobile: clean embed (no show_event_infos) so Persona 1 & Persona 2 cards show immediately at top without scrolling
  // - On desktop: include show_event_infos=true to display title & intro text
  let rawUrl = bookingUrl || baseEmbed;
  let targetUrl = rawUrl;

  if (rawUrl.includes('booking.builderall.com')) {
    const cleanUrl = rawUrl.split('?')[0];
    if (isMobile) {
      targetUrl = cleanUrl; // Clean embed for mobile
    } else {
      targetUrl = `${cleanUrl}?show_event_infos=true`; // Full info for desktop
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 h-[100dvh] z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 md:pr-[420px] bg-black/85 backdrop-blur-sm animate-fade-in overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[92dvh] sm:h-[94dvh] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-950 border-b border-amber-500/20 flex items-center justify-between gap-3 flex-shrink-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-white font-serif leading-none truncate">
                Agendar Cita en Línea
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-500 font-medium leading-none mt-1 truncate">
                Barbería Elite • Sistema de Reservas Digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-transform active:scale-95"
              title="Cerrar agenda"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full h-full bg-white overflow-hidden flex items-start justify-center">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
              <RefreshCw className="animate-spin text-amber-500" size={32} />
              <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-200">
                Cargando agenda de Barbería Elite...
              </p>
            </div>
          )}

          <div className="w-full h-full overflow-hidden flex items-start justify-center">
            <iframe
              ref={iframeRef}
              src={targetUrl}
              className="border-0 transition-transform duration-300"
              style={{
                width: isMobile ? '122%' : '112%',
                height: isMobile ? '122%' : '112%',
                transform: isMobile ? 'scale(0.82)' : 'scale(0.89)',
                transformOrigin: 'top center',
              }}
              title="Agenda de Citas Barbería Elite"
              onLoad={() => setIsLoading(false)}
              allow="payment; geolocation; camera; microphone"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;


