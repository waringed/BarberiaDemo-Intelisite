
import React from 'react';
import { X, MapPin, Navigation, Smartphone } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Coordenadas exactas basadas en el iframe existente (Centro Histórico CDMX)
  // Usamos la API universal de Google Maps para direcciones
  const destination = "19.432608,-99.133208"; 
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  
  // Generar QR
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mapsUrl)}&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-[fadeIn_0.3s_ease-out] flex flex-col items-center text-center">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
        >
            <X size={24} />
        </button>

        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <Navigation size={32} className="text-blue-500" />
        </div>

        <h3 className="text-2xl font-bold text-white font-serif mb-2">Lleva la Ruta Contigo</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Escanea este código con tu celular para abrir el GPS (Waze/Maps) directamente hacia la barbería.
        </p>

        {/* QR Container */}
        <div className="p-3 bg-white rounded-xl shadow-lg mb-6 relative group cursor-none">
            <img 
                src={qrCodeUrl} 
                alt="Scan for Directions" 
                className="w-56 h-56 object-contain"
            />
            {/* Corner Markers for "Scanning" look */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-slate-900"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-slate-900"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-slate-900"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-slate-900"></div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
            <Smartphone size={14} />
            <span>Compatible con iOS y Android</span>
        </div>

      </div>
    </div>
  );
};

export default LocationModal;
