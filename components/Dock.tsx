import React, { useState } from 'react';
import { 
  Scissors, 
  MapPin, 
  Star, 
  Ticket, 
  Calendar, 
  Users, 
  Share2,
  Camera,
  ShoppingBag,
  Menu,
  Gift,
  X,
  BookOpen
} from 'lucide-react';
import { SectionId } from '../types';
import { BLOG_URL } from '../constants';

interface DockProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

const Dock: React.FC<DockProps> = ({ activeSection, onNavigate }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // All 9 items for Desktop layout
  const desktopItems = [
    { id: SectionId.SERVICES, icon: Scissors, label: 'Menú' },
    { id: SectionId.GALLERY, icon: Camera, label: 'Galería' },
    { id: SectionId.CONTACT, icon: Calendar, label: 'Cita' },
    { id: SectionId.PROMOS, icon: Ticket, label: 'Promos' },
    { id: SectionId.LOCATION, icon: MapPin, label: 'Ubicación' },
    { id: SectionId.PRODUCTS, icon: ShoppingBag, label: 'Tienda' },
    { id: SectionId.TEAM, icon: Users, label: 'Equipo' },
    { id: SectionId.REVIEWS, icon: Star, label: 'Reseñas' },
    { id: SectionId.SOCIAL, icon: Share2, label: 'Contacto' },
  ];

  // Exactly 4 items for Mobile main buttons (to sum 5 with "Más")
  const mobileMainItems = [
    { id: SectionId.SERVICES, icon: Scissors, label: 'Menú' },
    { id: SectionId.GALLERY, icon: Camera, label: 'Galería' },
    { id: SectionId.CONTACT, icon: Calendar, label: 'Cita' },
    { id: SectionId.LOCATION, icon: MapPin, label: 'Ubicación' },
  ];

  // Items for the hamburger/more sheet
  const moreItems = [
    { id: SectionId.PROMOS, icon: Ticket, label: 'Promos' },
    { id: SectionId.PRODUCTS, icon: ShoppingBag, label: 'Tienda' },
    { id: SectionId.TEAM, icon: Users, label: 'Equipo' },
    { id: SectionId.REVIEWS, icon: Star, label: 'Reseñas' },
    { id: SectionId.SOCIAL, icon: Share2, label: 'Contacto' },
    { 
      id: null, 
      icon: Gift, 
      label: 'Regalo',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('chat-action-trigger', { 
          detail: '¡Hola! Vi el regalo en el menú y quiero saber de qué se trata.' 
        }));
      }
    },
    { 
      id: null, 
      icon: BookOpen, 
      label: 'Blog',
      onClick: () => {
        window.open(BLOG_URL, '_blank', 'noopener,noreferrer');
      }
    }
  ];

  return (
    <>
      {/* 1. DESKTOP DOCK (Visible only on md screens and up) */}
      <div className="hidden md:block fixed z-50 bottom-5 left-[calc(50%-200px)] w-auto -translate-x-1/2 max-w-fit transition-all duration-300">
        <div className="
          flex items-center justify-center gap-1.5 px-3.5 py-2 backdrop-blur-xl 
          bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-2xl 
          shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-x-auto no-scrollbar
        ">
          {desktopItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center justify-center min-w-[54px] h-[54px] rounded-xl
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group relative flex-shrink-0
                  ${isActive 
                    ? 'bg-amber-600 text-white -translate-y-2 scale-105 shadow-[0_4px_12px_-3px_rgba(217,119,6,0.6)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon 
                  size={18} 
                  className={`relative z-10 md:w-[20px] md:h-[20px] md:mb-1 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                />
                <span className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MOBILE DOCK (Exactly 5 icons: 4 Main + 1 Más) */}
      <div className="md:hidden fixed z-50 bottom-0 left-0 w-full transition-all duration-300">
        <div className="
          flex items-center justify-between px-2 py-2 backdrop-blur-xl 
          bg-slate-950/85 border-t-2 border-amber-500 rounded-none shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]
        ">
          {/* Main 4 items */}
          {mobileMainItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center justify-center flex-1 h-[48px] rounded-lg
                  transition-all duration-300 relative group
                  ${isActive ? 'text-amber-500' : 'text-slate-400'}
                `}
              >
                {isActive && (
                  <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-amber-600/10 to-transparent rounded-lg animate-fade-in"></div>
                )}
                <Icon 
                  size={20} 
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-115 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'stroke-2'}`} 
                />
                <span className="relative z-10 text-[9px] font-bold uppercase tracking-wide mt-1 truncate max-w-full">
                  {item.label}
                </span>
                {isActive && (
                  <div className="mt-0.5 w-6 h-0.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]"></div>
                )}
              </button>
            );
          })}

          {/* 5th Item: Hamburger Menu */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`
              flex flex-col items-center justify-center flex-1 h-[48px] rounded-lg
              transition-all duration-300 text-slate-400 hover:text-white relative group
            `}
          >
            <Menu size={20} className="relative z-10 stroke-2" />
            <span className="relative z-10 text-[9px] font-bold uppercase tracking-wide mt-1">
              Más
            </span>
          </button>
        </div>
      </div>

      {/* 3. MOBILE HAMBURGER SIDE DRAWER (Full height, half-screen width from right) */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop Blur Layer */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          {/* Slide-left Sidebar Drawer (Spans full vertical height, 50vw wide) */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-slate-900 border-l-2 border-amber-500 p-4 shadow-[-10px_0_40px_rgba(0,0,0,0.7)] animate-slide-left flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)] flex-shrink-0"></div>
                  <h3 className="font-bold text-white text-xs tracking-wider uppercase font-serif truncate">Más</h3>
                </div>
                <button 
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 active:scale-90 transition-transform flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Vertical Menu List for high precision at 50% screen width */}
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[70vh] pr-0.5 scrollbar-none">
                {moreItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = item.id && activeSection === item.id;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.id) {
                          onNavigate(item.id);
                        }
                        setIsMoreMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 active:scale-[0.97]
                        ${isSelected 
                          ? 'bg-amber-600/20 border-amber-500 text-amber-400' 
                          : 'bg-slate-950/40 hover:bg-slate-800 border-white/5 text-slate-300'
                        }
                      `}
                    >
                      <Icon size={18} className={`${isSelected ? 'text-amber-400' : 'text-amber-500'} flex-shrink-0`} />
                      <span className="text-[10px] font-bold uppercase tracking-wide truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom branding detail */}
            <div className="pt-4 border-t border-white/5 text-center">
              <span className="text-[8px] uppercase tracking-[0.2em] text-slate-600 font-bold">Elite Barber</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Dock;
