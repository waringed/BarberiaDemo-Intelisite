import React, { useState, useEffect, useRef } from 'react';
import { Send, Scissors, Sparkles, Minimize2, WifiOff, X } from 'lucide-react';
import { SectionId, ChatMessage } from '../types';
import { sendMessageToGemini, triggerContextMessage } from '../services/geminiService';

// Shortcuts list for quick action pills
const CHAT_SHORTCUTS: { label: string; text: string; section?: SectionId }[] = [
  { label: '✂️ Servicios', text: '¿Cuáles son los servicios y precios?', section: SectionId.SERVICES },
  { label: '🖼️ Galería', text: 'Quiero ver la galería de estilos y cortes', section: SectionId.GALLERY },
  { label: '🏷️ 20% OFF', text: 'Quiero desbloquear mi descuento del 20%', section: SectionId.PROMOS },
  { label: '📍 Ubicación', text: '¿Dónde están ubicados y cómo llegar?', section: SectionId.LOCATION },
  { label: '📅 Cita', text: 'Quiero agendar una cita', section: SectionId.CONTACT },
  { label: '🧔 Barberos', text: '¿Quiénes son los barberos del equipo?', section: SectionId.TEAM },
  { label: '⭐ Reseñas', text: 'Quiero ver las reseñas y testimonios de clientes', section: SectionId.REVIEWS },
  { label: '🎁 Regalo', text: 'Quiero mi regalo sorpresa', section: SectionId.PROMOS },
  { label: '📞 Contacto', text: 'Quiero ver los datos de contacto y redes sociales', section: SectionId.CONTACT },
];

interface ChatWidgetProps {
  activeSection: SectionId;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ activeSection }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy Barber-IA. ¿En qué te ayudo hoy?',
      timestamp: Date.now(),
      isContextTrigger: true, // Mark initial message as auto-generated
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Independent state for desktop (starts open by default) and mobile (starts closed by default)
  const [isDesktopMinimized, setIsDesktopMinimized] = useState(false);
  const [isMobileMinimized, setIsMobileMinimized] = useState(true); 

  // State to track if we are using Real AI or Fallback
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const desktopMessagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileMessagesContainerRef = useRef<HTMLDivElement>(null);
  const desktopMessagesEndRef = useRef<HTMLDivElement>(null);
  const mobileMessagesEndRef = useRef<HTMLDivElement>(null);
  const prevSectionRef = useRef<SectionId>(SectionId.HERO);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Swipe-right close and Swipe-left open gesture state
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingToOpen, setIsDraggingToOpen] = useState(false);
  const [isGestureDecided, setIsGestureDecided] = useState(false);
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null);

  // Helper functions to open and close chat safely resetting all touch/drag state
  const openMobileChat = () => {
    setIsMobileMinimized(false);
    setIsDesktopMinimized(false);
    setTranslateX(0);
    setIsDragging(false);
    setIsDraggingToOpen(false);
    setStartX(null);
    setStartY(null);
    setIsGestureDecided(false);
    setDragDirection(null);
  };

  const closeMobileChat = () => {
    setIsMobileMinimized(true);
    setTranslateX(0);
    setIsDragging(false);
    setIsDraggingToOpen(false);
    setStartX(null);
    setStartY(null);
    setIsGestureDecided(false);
    setDragDirection(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Don't intercept touches if user is typing, tapping buttons/links or focusing inputs
    if (target.closest('button') || target.closest('input') || target.closest('a') || target.closest('textarea')) {
      return;
    }
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setIsDraggingToOpen(false);
    setIsGestureDecided(false);
    setDragDirection(null);
  };

  const handleOpenTouchStart = (e: React.TouchEvent) => {
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
    setIsDraggingToOpen(true);
    setIsGestureDecided(true);
    setDragDirection('horizontal');
    const panelWidthVal = typeof window !== 'undefined' ? window.innerWidth * 0.75 : 300;
    setTranslateX(panelWidthVal); // Start fully offscreen
    setIsMobileMinimized(false); // Mount the chat drawer immediately so it becomes visible
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null || startY === null || !isDragging) return;
    const currentClientX = e.touches[0].clientX;
    const currentClientY = e.touches[0].clientY;
    
    const diffX = currentClientX - startX;
    const diffY = Math.abs(currentClientY - startY);

    const panelWidthVal = typeof window !== 'undefined' ? window.innerWidth * 0.75 : 300;

    // If direction is not decided yet, wait until we've moved at least 5 pixels
    if (!isGestureDecided) {
      const totalDist = Math.sqrt(diffX * diffX + diffY * diffY);
      if (totalDist > 5) {
        if (Math.abs(diffX) > diffY) {
          setDragDirection('horizontal');
        } else {
          setDragDirection('vertical');
        }
        setIsGestureDecided(true);
      }
      return;
    }

    if (dragDirection === 'horizontal') {
      if (isDraggingToOpen) {
        // Dragging left (negative diffX) pulls the drawer in from the right
        const pullDistance = -diffX;
        if (pullDistance > 0) {
          const transX = Math.max(0, panelWidthVal - pullDistance);
          setTranslateX(transX);
          if (e.cancelable) {
            e.preventDefault(); // Stop default browser navigation gesture
          }
        } else {
          setTranslateX(panelWidthVal);
        }
      } else {
        // Dragging right (positive diffX) pushes the drawer out
        if (diffX > 0) {
          setTranslateX(diffX);
          if (e.cancelable) {
            e.preventDefault();
          }
        } else {
          setTranslateX(0);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const panelWidthVal = typeof window !== 'undefined' ? window.innerWidth * 0.75 : 300;
    
    if (dragDirection === 'horizontal') {
      if (isDraggingToOpen) {
        // If we pulled the panel in so that remaining offscreen is less than 70% (meaning we dragged > 30% of width)
        if (translateX < panelWidthVal * 0.7) {
          openMobileChat();
        } else {
          closeMobileChat();
        }
      } else {
        // If released and dragged past 30% of panel width, close it
        if (translateX > panelWidthVal * 0.3) {
          closeMobileChat();
        } else {
          setTranslateX(0);
        }
      }
    } else {
      setTranslateX(0);
    }
    
    setStartX(null);
    setStartY(null);
    setIsGestureDecided(false);
    setDragDirection(null);
    setIsDraggingToOpen(false);
  };

  // Calculate dynamic backdrop opacity based on horizontal translation
  const panelWidth = typeof window !== 'undefined' ? window.innerWidth * 0.75 : 300;
  const dragPercentage = Math.max(0, Math.min(1, translateX / panelWidth));
  const backdropOpacity = 0.65 * (1 - dragPercentage);

  // Listen to mobile header search bar triggers
  useEffect(() => {
    const handleOpenFull = () => {
      openMobileChat();
      // Let the slideUp animation complete, then focus
      setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
    };
    window.addEventListener('open-chat-full', handleOpenFull);
    return () => window.removeEventListener('open-chat-full', handleOpenFull);
  }, []);

  // Refs for state access inside async/event closures
  const isMobileMinimizedRef = useRef(isMobileMinimized);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isMobileMinimizedRef.current = isMobileMinimized;
  }, [isMobileMinimized]);
  
  // Flag to track if navigation was triggered by the bot and suppress context messages during smooth scrolling
  const isNavigatingViaChatRef = useRef(false);
  const suppressContextUntilRef = useRef<number>(0);

  // Auto-scroll to bottom of expanded list
  const scrollToBottom = (smooth = true) => {
    const scrollContainer = (container: HTMLDivElement | null, endElement: HTMLDivElement | null) => {
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      if (endElement) {
        endElement.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
      }
    };

    const executeScroll = () => {
      scrollContainer(desktopMessagesContainerRef.current, desktopMessagesEndRef.current);
      scrollContainer(mobileMessagesContainerRef.current, mobileMessagesEndRef.current);
    };

    requestAnimationFrame(executeScroll);
    setTimeout(executeScroll, 50);
    setTimeout(executeScroll, 180);
  };

  useEffect(() => {
    if (!isDesktopMinimized || !isMobileMinimized) {
      scrollToBottom();
    }
  }, [messages, isDesktopMinimized, isMobileMinimized, isLoading]);

  // Helper to process bot response: extract navigation commands
  const processBotResponse = (rawText: string, userQuery?: string, enableNavigation = true): string => {
    if (!rawText) return rawText;

    // 1. First check for explicit [[NAVIGATE:section_id]] tags (case-insensitive)
    const navRegex = /\[\[NAVIGATE:\s*(.*?)\s*\]\]/gi;
    const matches = Array.from(rawText.matchAll(navRegex));

    if (matches.length > 0) {
        const sectionId = matches[0][1].trim().toLowerCase();
        
        if (enableNavigation) {
          // SET FLAG: We are moving because of the bot
          isNavigatingViaChatRef.current = true;
          suppressContextUntilRef.current = Date.now() + 4000;
          
          // Dispatch event for App.tsx to handle
          const event = new CustomEvent('navigate-section-trigger', { detail: sectionId });
          window.dispatchEvent(event);
        }
        
        // Return text without the command tag
        return rawText.replace(navRegex, '').trim();
    }

    if (!enableNavigation) {
        return rawText;
    }

    // 2. Fallback: If AI/fallback response didn't include the tag, detect section intent from query or response
    const combinedText = `${userQuery || ''} ${rawText}`.toLowerCase();
    let detectedSection: SectionId | null = null;

    if (combinedText.includes('servicio') || combinedText.includes('precio') || combinedText.includes('corte executive') || combinedText.includes('ritual de barba') || combinedText.includes('gentleman') || combinedText.includes('menú')) {
      detectedSection = SectionId.SERVICES;
    } else if (combinedText.includes('galería') || combinedText.includes('galeria') || combinedText.includes('foto') || combinedText.includes('estilo') || combinedText.includes('look') || combinedText.includes('catálogo') || combinedText.includes('catalogo')) {
      detectedSection = SectionId.GALLERY;
    } else if (combinedText.includes('producto') || combinedText.includes('cera') || combinedText.includes('aceite') || combinedText.includes('shampoo') || combinedText.includes('tienda')) {
      detectedSection = SectionId.PRODUCTS;
    } else if (combinedText.includes('barbero') || combinedText.includes('equipo') || combinedText.includes('alex') || combinedText.includes('marco') || combinedText.includes('jay')) {
      detectedSection = SectionId.TEAM;
    } else if (combinedText.includes('ubicación') || combinedText.includes('ubicacion') || combinedText.includes('dónde') || combinedText.includes('donde') || combinedText.includes('mapa') || combinedText.includes('dirección') || combinedText.includes('direccion') || combinedText.includes('estacionamiento') || combinedText.includes('parking')) {
      detectedSection = SectionId.LOCATION;
    } else if (combinedText.includes('reseña') || combinedText.includes('opinión') || combinedText.includes('opinion') || combinedText.includes('testimonio')) {
      detectedSection = SectionId.REVIEWS;
    } else if (combinedText.includes('descuento') || combinedText.includes('promo') || combinedText.includes('cupón') || combinedText.includes('cupon') || combinedText.includes('regalo') || combinedText.includes('oferta')) {
      detectedSection = SectionId.PROMOS;
    } else if (combinedText.includes('agendar') || combinedText.includes('cita') || combinedText.includes('reserva') || combinedText.includes('horario') || combinedText.includes('contacto')) {
      detectedSection = SectionId.CONTACT;
    } else if (combinedText.includes('redes') || combinedText.includes('instagram') || combinedText.includes('facebook') || combinedText.includes('tiktok')) {
      detectedSection = SectionId.SOCIAL;
    }

    if (detectedSection) {
      isNavigatingViaChatRef.current = true;
      suppressContextUntilRef.current = Date.now() + 4000;
      window.dispatchEvent(new CustomEvent('navigate-section-trigger', { detail: detectedSection }));
    }

    return rawText;
  };

  // Helper to detect if a link is for booking
  const isBookingLink = (url: string, text: string = '') => {
    const lowerUrl = url.toLowerCase();
    const lowerText = text.toLowerCase();
    return (
      lowerUrl.includes('booking') ||
      lowerText.includes('agendar') ||
      lowerText.includes('reservar') ||
      lowerText.includes('disponibilidad') ||
      lowerText.includes('cita') ||
      lowerText.includes('reserva')
    );
  };

  // Helper to handle booking button clicks inside chat messages
  const handleBookingClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Trigger booking modal popup in main App
    window.dispatchEvent(new CustomEvent('open-booking-modal-trigger', { detail: url }));
    // Only close chat popup window on mobile devices
    if (window.innerWidth < 768) {
      setIsMobileMinimized(true);
    }
  };

  // Helper to render text with Markdown links transformed into buttons
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Regex for [Link Text](URL)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // Check if any markdown links exist
    if (!markdownLinkRegex.test(text)) {
        // If not, fallback to simple URL parsing logic (just in case)
        const rawUrlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(rawUrlRegex);
        return parts.map((part, i) => {
            if (part.match(rawUrlRegex)) {
                if (isBookingLink(part)) {
                    return (
                      <a 
                          key={i} 
                          href={part} 
                          className="underline font-bold hover:text-amber-300 break-all transition-colors cursor-pointer"
                          onClick={(e) => handleBookingClick(e, part)}
                      >
                          {part}
                      </a>
                    );
                }
                return (
                <a 
                    key={i} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline font-bold hover:text-amber-300 break-all transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
                );
            }
            return <span key={i}>{part}</span>;
        });
    }

    // Reset regex index for execution
    markdownLinkRegex.lastIndex = 0;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
            parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
        }
        
        const linkText = match[1];
        const linkUrl = match[2];

        if (isBookingLink(linkUrl, linkText)) {
            parts.push(
                <a 
                    key={`btn-${match.index}`}
                    href={linkUrl} 
                    className="
                        inline-flex items-center gap-1.5 
                        bg-amber-600 text-white 
                        px-3 py-1.5 mx-1 my-1
                        rounded-lg shadow-md
                        text-xs md:text-sm font-bold uppercase tracking-wide
                        hover:bg-amber-500 hover:scale-105 hover:shadow-[0_0_10px_rgba(217,119,6,0.5)]
                        transition-all duration-200 ease-out
                        no-underline
                        border border-white/10
                        cursor-pointer
                    "
                    onClick={(e) => handleBookingClick(e, linkUrl)}
                >
                    {linkText} 📅
                </a>
            );
        } else {
            parts.push(
                <a 
                    key={`btn-${match.index}`}
                    href={linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="
                        inline-flex items-center gap-1.5 
                        bg-amber-600 text-white 
                        px-3 py-1.5 mx-1 my-1
                        rounded-lg shadow-md
                        text-xs md:text-sm font-bold uppercase tracking-wide
                        hover:bg-amber-500 hover:scale-105 hover:shadow-[0_0_10px_rgba(217,119,6,0.5)]
                        transition-all duration-200 ease-out
                        no-underline
                        border border-white/10
                        cursor-pointer
                    "
                    onClick={(e) => e.stopPropagation()}
                >
                    {linkText} ↗
                </a>
            );
        }
        lastIndex = markdownLinkRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
        parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  // --- Listen for Custom Events from App buttons ---
  useEffect(() => {
    const handleTrigger = async (event: CustomEvent<string>) => {
        const message = event.detail;
        
        // Open Chat if closed
        openMobileChat();

        // Add User Message immediately
        const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const userMsg: ChatMessage = {
            id: userMsgId,
            role: 'user',
            text: message,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        // Get AI Response
        const response = await sendMessageToGemini(message);
        setIsOfflineMode(response.isFallback);
        
        const finalVisualText = processBotResponse(response.text, message);
        const botMsgId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        setMessages((prev) => [
            ...prev,
            {
                id: botMsgId,
                role: 'model',
                text: finalVisualText,
                timestamp: Date.now(),
            },
        ]);
        setIsLoading(false);
    };

    window.addEventListener('chat-action-trigger', handleTrigger as EventListener);

    const handleScrollStart = () => {
      suppressContextUntilRef.current = Date.now() + 4000;
      isNavigatingViaChatRef.current = true;
    };
    window.addEventListener('section-scroll-started', handleScrollStart);

    return () => {
        window.removeEventListener('chat-action-trigger', handleTrigger as EventListener);
        window.removeEventListener('section-scroll-started', handleScrollStart);
    };
  }, []);

  // Handle Section Changes (Disabled automatic proactive context messages per user preference)
  useEffect(() => {
    prevSectionRef.current = activeSection;
  }, [activeSection]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const queryText = input.trim();
    const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: queryText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToGemini(queryText);
    setIsOfflineMode(response.isFallback);
    
    const finalVisualText = processBotResponse(response.text, queryText);
    const botMsgId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        role: 'model',
        text: finalVisualText,
        timestamp: Date.now(),
      },
    ]);
    setIsLoading(false);
  };

  const handleShortcutClick = async (shortcut: { label: string; text: string; section?: SectionId }) => {
    if (isLoading) return;

    // Immediately trigger navigation if shortcut specifies a section
    if (shortcut.section) {
      isNavigatingViaChatRef.current = true;
      suppressContextUntilRef.current = Date.now() + 3500;
      window.dispatchEvent(new CustomEvent('navigate-section-trigger', { detail: shortcut.section }));
    }

    // Automatically send user message to chat
    const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: shortcut.text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToGemini(shortcut.text);
    setIsOfflineMode(response.isFallback);

    const finalVisualText = processBotResponse(response.text, shortcut.text);
    const botMsgId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        role: 'model',
        text: finalVisualText,
        timestamp: Date.now(),
      },
    ]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* 1. DESKTOP LAYOUT (Visible only on medium screens and up) */}
      <div 
        className={`hidden md:flex fixed z-[80] transition-all duration-500 ease-in-out shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        ${isDesktopMinimized 
          ? 'w-16 h-16 bottom-[60px] right-4 rounded-full items-center justify-center cursor-pointer hover:scale-110 bg-slate-800 border border-white/10' 
          : 'w-[400px] h-[calc(100vh-110px)] top-[90px] right-6 rounded-3xl flex flex-col bg-slate-900 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
        }`}
      >
        {isDesktopMinimized ? (
          <div 
            onClick={() => setIsDesktopMinimized(false)} 
            className="relative w-full h-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-lg border-2 border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles size={24} className="animate-pulse" />
          </div>
        ) : (
          <>
            {/* Desktop Chat Header */}
            <div className="flex items-center justify-between p-2.5 border-b border-slate-700 bg-slate-800 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-lg ring-1 ring-amber-400/30">
                  <Scissors size={14} className="transform -rotate-45" />
                </div>
                
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">Barber-IA</h3>
                  <span className="text-slate-600 text-xs">|</span>
                  {isOfflineMode ? (
                    <p className="text-[10px] text-amber-500 flex items-center gap-1 font-bold animate-[fadeIn_0.5s]">
                      <WifiOff size={10} />
                      <span>Básico</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold animate-[fadeIn_0.5s]">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                      <span>Conectado</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center text-slate-400">
                <button onClick={() => setIsDesktopMinimized(true)} className="hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full cursor-pointer flex items-center justify-center">
                  <Minimize2 size={16} />
                </button>
              </div>
            </div>

            {/* Desktop Messages Area */}
            <div ref={desktopMessagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div
                  key={msg.id ? `${msg.id}-${index}` : index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease-out]`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-xl text-sm md:text-base leading-snug shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm font-medium'
                        : 'bg-slate-700 text-slate-100 rounded-tl-sm border border-slate-600'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 px-4 py-3 rounded-xl rounded-tl-sm border border-slate-600 shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={desktopMessagesEndRef} />
            </div>

            {/* Shortcut pills floating above input over chat background without gray container */}
            <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {CHAT_SHORTCUTS.map((sc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleShortcutClick(sc)}
                    disabled={isLoading}
                    className="flex-shrink-0 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 rounded-full text-[11px] font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Input Area */}
            <div className="p-3 bg-slate-800 border-t border-slate-700 rounded-b-3xl">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe aquí..."
                  className="w-full bg-slate-950 text-white text-sm md:text-base rounded-lg pl-3 pr-2 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-slate-600 placeholder-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <Send size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. MOBILE LAYOUT (Visible only on screens under 768px) */}
      <div className="md:hidden">
        {/* Swipe-to-open touch zone and visible orange handle on the right edge */}
        {isMobileMinimized && (
          <div 
            className="fixed right-0 top-1/2 -translate-y-1/2 h-36 w-6 z-[40] flex items-center justify-end pr-0.5 cursor-pointer touch-none"
            onTouchStart={handleOpenTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={openMobileChat}
            title="Abrir asistente de IA"
          >
            <div className="w-1.5 h-16 bg-orange-400/80 rounded-full shadow-md border border-orange-300/60 transition-all animate-pulse" />
          </div>
        )}

        {/* Full screen backdrop click-outside triggers close */}
        {!isMobileMinimized && (
          <div 
            className="fixed inset-0 z-[70] backdrop-blur-xs cursor-pointer"
            style={{ 
              backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
              transition: isDragging ? 'none' : 'background-color 0.3s ease-out'
            }}
            onClick={closeMobileChat}
          />
        )}

        {/* Almost full screen mobile chat bottom drawer */}
        {!isMobileMinimized && (
          <div 
            className={`fixed top-0 right-0 w-3/4 h-full flex flex-col bg-slate-900 border-l-2 border-amber-500 shadow-2xl z-[80] ${
              isDragging || translateX > 0 ? '' : 'animate-slide-left'
            }`}
            style={{
              transform: isDragging ? `translate3d(${translateX}px, 0, 0)` : 'translate3d(0, 0, 0)',
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Light Orange Vertical Drag Handle on the Left Edge */}
            <div 
              className="absolute -left-1 top-0 h-full w-4 flex items-center justify-center cursor-grab active:cursor-grabbing z-50 group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-1.5 h-16 bg-orange-400/60 rounded-full shadow-sm border border-orange-300/40 transition-all" />
            </div>

            {/* Chat Header Drawer - Drag-friendly area */}
            <div 
              className="flex items-center justify-between px-3 pt-4 pb-3 border-b border-slate-800 bg-transparent cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center gap-1.5 truncate pointer-events-none select-none">
                <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-lg ring-1 ring-amber-400/30 flex-shrink-0">
                  <Scissors size={12} className="transform -rotate-45" />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate">Barber-IA</h3>
                  <span className="text-slate-800 text-[10px] flex-shrink-0">|</span>
                  {isOfflineMode ? (
                    <p className="text-[9px] text-amber-500 flex items-center gap-0.5 font-bold flex-shrink-0">
                      <WifiOff size={8} />
                      <span>Básico</span>
                    </p>
                  ) : (
                    <p className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-semibold flex-shrink-0">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                      <span>Conectado</span>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Corner X Close Button */}
              <button 
                onClick={closeMobileChat} 
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 active:scale-90 transition-transform cursor-pointer flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={mobileMessagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-slate-900 scrollbar-none">
              {messages.map((msg, index) => (
                <div
                  key={msg.id ? `${msg.id}-${index}` : index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease-out]`}
                >
                  <div
                    className={`max-w-[88%] p-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm font-medium'
                        : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/80'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 px-3.5 py-2 rounded-2xl rounded-tl-sm border border-slate-700 shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={mobileMessagesEndRef} />
            </div>

            {/* Shortcut pills floating above input over chat background without gray container */}
            <div className="px-2.5 py-1.5 bg-slate-900 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {CHAT_SHORTCUTS.map((sc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleShortcutClick(sc)}
                    disabled={isLoading}
                    className="flex-shrink-0 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 rounded-full text-[10px] font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input inside mobile drawer */}
            <div className="p-2.5 bg-slate-800 border-t border-slate-700 pb-6">
              <div className="relative flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe aquí..."
                  className="w-full bg-slate-950 text-white text-base rounded-lg pl-3 pr-2 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-slate-700 placeholder-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-md active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <Send size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
