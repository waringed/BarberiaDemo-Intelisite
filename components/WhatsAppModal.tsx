
import React from 'react';
import { X, Smartphone, Monitor, MessageCircle } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumberUrl: string; // La URL base (wa.me/...)
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, phoneNumberUrl }) => {
  if (!isOpen) return null;

  // Construir la URL con el mensaje predeterminado
  const message = "Hola, vi su InteliSite y me gustaría agendar una cita.";
  const encodedMessage = encodeURIComponent(message);
  // Aseguramos que la URL base no tenga ya parámetros para evitar errores
  const baseUrl = phoneNumberUrl.split('?')[0];
  const fullUrl = `${baseUrl}?text=${encodedMessage}`;
  
  // API para generar QR (QuickChart o QRServer son estándares fiables para esto)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullUrl)}&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[fadeIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-900/40">
                <MessageCircle size={24} className="text-white" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white font-serif">Contactar por WhatsApp</h3>
                <p className="text-slate-400 text-sm">Elige cómo prefieres chatear</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6">
            
            {/* Option 1: Mobile (QR) */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest text-xs mb-4">
                    <Smartphone size={16} />
                    <span>Desde tu Celular</span>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-lg mb-4">
                    <img 
                        src={qrCodeUrl} 
                        alt="Escanear para WhatsApp" 
                        className="w-48 h-48 object-contain"
                    />
                </div>
                <p className="text-slate-400 text-xs">Escanea el código con la cámara de tu teléfono para abrir el chat.</p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase">O bien</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Option 2: Desktop (Button) */}
            <a 
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-green-500/30 group"
            >
                <Monitor size={20} />
                <span>Abrir en este dispositivo</span>
            </a>
        </div>

      </div>
    </div>
  );
};

export default WhatsAppModal;
