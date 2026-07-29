
import React, { useEffect, useState } from 'react';
import { X, Smartphone, ScanLine, Share2 } from 'lucide-react';

interface MobileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileShareModal: React.FC<MobileShareModalProps> = ({ isOpen, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Capturar la URL actual del navegador
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generar QR de la URL actual
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff`;

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

        <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-amber-500/50 shadow-[0_0_30px_rgba(217,119,6,0.2)]">
            <Smartphone size={32} className="text-amber-500" />
        </div>

        <h3 className="text-2xl font-bold text-white font-serif mb-2">Experiencia Móvil</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Este sitio es 100% responsivo. Escanea el código para ver la versión optimizada en tu celular.
        </p>

        {/* QR Container */}
        <div className="p-3 bg-white rounded-xl shadow-lg mb-6 relative group">
            <img 
                src={qrCodeUrl} 
                alt="Scan for Mobile Version" 
                className="w-56 h-56 object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl">
                 <div className="flex flex-col items-center text-slate-900 font-bold text-xs uppercase tracking-widest">
                    <ScanLine size={32} className="mb-2 text-slate-900" />
                    Escanéame
                 </div>
            </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Share2 size={12} />
            <span>Compartir URL: {currentUrl.replace(/(^\w+:|^)\/\//, '').split('/')[0]}...</span>
        </div>

      </div>
    </div>
  );
};

export default MobileShareModal;
