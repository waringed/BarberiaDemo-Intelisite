
import React, { useState, useEffect, useRef } from 'react';
import { CalendarCheck, Scissors, Gift, Sparkles, MessageCircle } from 'lucide-react';
import { BOOKING_URL } from '../constants';

interface HeaderProps {
  onLogoClick: () => void;
  isHeroVisible: boolean;
  onWhatsAppClick: () => void;
  onBookingClick?: () => void;
  onGiftClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, isHeroVisible, onWhatsAppClick, onBookingClick, onGiftClick }) => {
  // The header is now always visible to keep the "Pregunta a Barber-IA" bar accessible during scrolls
  const isVisible = true;

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 px-4 md:px-6 transition-transform duration-300 ease-in-out flex justify-between items-center pointer-events-none
      ${isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}
      ${!isHeroVisible 
        ? 'py-3 md:py-4 bg-slate-950/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none shadow-lg md:shadow-none border-b border-white/5 md:border-none' 
        : 'py-4 md:py-6 bg-transparent border-none shadow-none'}
      `}
    >
      {/* Logo Area */}
      <div 
        onClick={onLogoClick} 
        className={`pointer-events-auto cursor-pointer flex-shrink-0 flex items-center gap-2 md:gap-3 group transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-left
        ${!isHeroVisible ? 'md:scale-110 md:translate-y-1' : 'scale-100'}
        `}
      >
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 shadow-xl
            ${!isHeroVisible ? 'bg-amber-500 shadow-amber-500/40' : 'bg-amber-600 shadow-amber-900/30 group-hover:bg-amber-500 group-hover:shadow-amber-500/50 group-hover:scale-110'}
        `}>
          <Scissors size={18} className="md:w-5 md:h-5 transform -rotate-45 transition-transform duration-500 ease-out group-hover:rotate-0" />
        </div>
        
        {/* Texto del Logo - Siempre visible en móvil y desktop */}
        <div className="flex flex-col group-hover:translate-x-1 transition-transform duration-300 drop-shadow-md">
            <span className="font-bold text-slate-100 tracking-tight font-serif text-[11px] xs:text-xs md:text-lg leading-none">BARBERÍA</span>
            <span className="text-amber-500 text-[8px] md:text-xs font-bold tracking-[0.2em] uppercase group-hover:text-amber-400 transition-colors">Elite</span>
        </div>
      </div>

      {/* Mobile Question Bar - Con efecto de contorno iluminado giratorio en loop */}
      <div className="pointer-events-auto flex-shrink-0 ml-auto md:hidden relative flex items-center justify-end">
        <div className="relative p-[1.5px] rounded-full overflow-hidden flex items-center justify-center max-w-[165px] xs:max-w-[200px] shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-transform">
          {/* Fondo de luz cónica giratoria en loop continuo */}
          <div 
            className="absolute -inset-[200%] animate-border-spin pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 180deg, #f59e0b 260deg, #fef08a 310deg, #f59e0b 360deg)'
            }}
          />
          
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-chat-full'));
            }}
            className="relative z-10 w-full bg-slate-950/90 text-slate-100 rounded-full py-1.5 pl-3 pr-8 text-left transition-colors duration-300 flex items-center justify-between"
          >
            <span className="truncate tracking-tight text-slate-100 font-medium text-[11px] xs:text-xs">Pregunta a Barber-IA</span>
            <div className="absolute right-1.5 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <Sparkles size={11} className="text-amber-400 animate-pulse" />
            </div>
          </button>
        </div>
      </div>

      {/* Desktop Action Buttons Area (WhatsApp & Reservar) - Placed on top right above chat window */}
      <div className="pointer-events-auto hidden md:flex items-center gap-6 transition-transform duration-500">
        {/* WhatsApp Button */}
        <button
          onClick={onWhatsAppClick}
          className="group cursor-pointer flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          title="Contactar por WhatsApp"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all duration-300 shadow-md group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center flex-shrink-0 p-1.5">
            <img 
              src="https://global-files-nginx.builderall.com/0e184df7-813a-4af4-89e6-7f8094a855e1/e69e5daab694041319b4628a595c67f3b23b1f1dee4abfc7a8f17d80705f33f4.webp"
              alt="WhatsApp"
              className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col text-left group-hover:translate-x-0.5 transition-transform duration-300 drop-shadow-md">
            <span className="font-bold text-slate-100 tracking-tight font-serif text-xs md:text-sm leading-none">WHATSAPP</span>
            <span className="text-emerald-400 text-[9px] font-bold tracking-[0.15em] uppercase group-hover:text-emerald-300 transition-colors">Directo</span>
          </div>
        </button>

        {/* Reservar Button */}
        <button
          onClick={onBookingClick}
          className="group cursor-pointer flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          title="Reservar Cita Online"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-400 transition-all duration-300 shadow-md group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={18} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex flex-col text-left group-hover:translate-x-0.5 transition-transform duration-300 drop-shadow-md">
            <span className="font-bold text-slate-100 tracking-tight font-serif text-xs md:text-sm leading-none">RESERVAR</span>
            <span className="text-amber-400 text-[9px] font-bold tracking-[0.15em] uppercase group-hover:text-amber-300 transition-colors">Cita Online</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
