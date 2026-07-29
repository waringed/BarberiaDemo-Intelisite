
import React, { useState, useEffect, useRef } from 'react';
import { SectionId, StyleGalleryItem } from './types';
import Header from './components/Header';
import Dock from './components/Dock';
import ChatWidget from './components/ChatWidget';
import WhatsAppModal from './components/WhatsAppModal'; // Importar el Modal WhatsApp
import MobileShareModal from './components/MobileShareModal'; // Importar el Modal Mobile Share
import LocationModal from './components/LocationModal'; // Importar el nuevo Modal de Ubicación
import BookingModal from './components/BookingModal'; // Importar el nuevo Modal de Agendamiento
import { SERVICES, REVIEWS, SOCIAL_LINKS, TEAM_MEMBERS, BOOKING_URL, STYLE_GALLERY, GOOGLE_REVIEW_URL, PRODUCTS, WHATSAPP_DIRECT_URL, BLOG_URL } from './constants';
import { 
    Scissors, MapPin, Star, Ticket, Calendar, 
    Users, ArrowRight, CheckCircle, Clock, ExternalLink, Camera,
    MessageCircle, Lock, Instagram, Facebook, BookOpen, MessageSquarePlus, ShoppingBag, Info, Zap, Gift, Smartphone, ScanLine, Navigation, Share2,
    RotateCcw, Check, X, Sparkles, Maximize2, ChevronLeft, ChevronRight
} from 'lucide-react';

// Custom TikTok Icon Component
const TikTokIcon = ({ size = 24, strokeWidth = 1.5, className = "" }: { size?: number, strokeWidth?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.HERO);
  
  // State for Modals
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isMobileShareModalOpen, setIsMobileShareModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false); // Nuevo estado para Location Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // Nuevo estado para Modal de Agendamiento
  const [bookingModalUrl, setBookingModalUrl] = useState<string | undefined>(undefined);

  const handleOpenBooking = (url?: string) => {
    setBookingModalUrl(url || BOOKING_URL);
    setIsBookingModalOpen(true);
  };
  
  // State for Service Flips, Product Flips & Selected Gallery Item Index
  const [flippedServiceId, setFlippedServiceId] = useState<number | null>(null);
  const [flippedProductId, setFlippedProductId] = useState<number | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const selectedGalleryItem = selectedGalleryIndex !== null ? STYLE_GALLERY[selectedGalleryIndex] : null;

  // Real-time Drag / Touch Swipe State for Gallery Modal Carousel
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (clientX: number) => {
    if (isAnimating) return;
    dragStartX.current = clientX;
    setIsDragging(true);
    setSkipTransition(false);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX.current === null || !isDragging || isAnimating) return;
    const delta = clientX - dragStartX.current;
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (dragStartX.current === null) return;
    const containerWidth = carouselContainerRef.current?.clientWidth || 380;
    const threshold = Math.min(containerWidth * 0.18, 70); // 18% or max 70px

    if (dragOffset < -threshold) {
      // Swiped Left -> Move to Next
      setIsAnimating(true);
      setDragOffset(-containerWidth);
      setTimeout(() => {
        setSkipTransition(true);
        setSelectedGalleryIndex((prev) => (prev !== null ? (prev === STYLE_GALLERY.length - 1 ? 0 : prev + 1) : null));
        setDragOffset(0);
        setTimeout(() => {
          setSkipTransition(false);
          setIsAnimating(false);
        }, 40);
      }, 220);
    } else if (dragOffset > threshold) {
      // Swiped Right -> Move to Previous
      setIsAnimating(true);
      setDragOffset(containerWidth);
      setTimeout(() => {
        setSkipTransition(true);
        setSelectedGalleryIndex((prev) => (prev !== null ? (prev === 0 ? STYLE_GALLERY.length - 1 : prev - 1) : null));
        setDragOffset(0);
        setTimeout(() => {
          setSkipTransition(false);
          setIsAnimating(false);
        }, 40);
      }, 220);
    } else {
      // Snap back to center
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => {
        setIsAnimating(false);
      }, 220);
    }
    setIsDragging(false);
    dragStartX.current = null;
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isAnimating) return;
    const containerWidth = carouselContainerRef.current?.clientWidth || 380;
    setIsAnimating(true);
    setDragOffset(containerWidth);
    setTimeout(() => {
      setSkipTransition(true);
      setSelectedGalleryIndex((prev) => (prev !== null ? (prev === 0 ? STYLE_GALLERY.length - 1 : prev - 1) : null));
      setDragOffset(0);
      setTimeout(() => {
        setSkipTransition(false);
        setIsAnimating(false);
      }, 40);
    }, 220);
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isAnimating) return;
    const containerWidth = carouselContainerRef.current?.clientWidth || 380;
    setIsAnimating(true);
    setDragOffset(-containerWidth);
    setTimeout(() => {
      setSkipTransition(true);
      setSelectedGalleryIndex((prev) => (prev !== null ? (prev === STYLE_GALLERY.length - 1 ? 0 : prev + 1) : null));
      setDragOffset(0);
      setTimeout(() => {
        setSkipTransition(false);
        setIsAnimating(false);
      }, 40);
    }, 220);
  };

  // Keyboard navigation for gallery modal
  useEffect(() => {
    if (selectedGalleryIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedGalleryIndex((prev) => (prev !== null ? (prev === 0 ? STYLE_GALLERY.length - 1 : prev - 1) : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedGalleryIndex((prev) => (prev !== null ? (prev === STYLE_GALLERY.length - 1 ? 0 : prev + 1) : null));
      } else if (e.key === 'Escape') {
        setSelectedGalleryIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryIndex]);
  
  // Create refs for each section
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    [SectionId.HERO]: null,
    [SectionId.SERVICES]: null,
    [SectionId.GALLERY]: null,
    [SectionId.PRODUCTS]: null, // Added ref
    [SectionId.TEAM]: null,
    [SectionId.LOCATION]: null,
    [SectionId.REVIEWS]: null,
    [SectionId.PROMOS]: null,
    [SectionId.CONTACT]: null,
    [SectionId.SOCIAL]: null,
  });

  // Ref for Background Images (Parallax)
  const heroBgRef = useRef<HTMLImageElement>(null);
  const galleryBgRef = useRef<HTMLImageElement>(null); // Added gallery ref
  const productsBgRef = useRef<HTMLImageElement>(null); // Added bg ref
  const teamBgRef = useRef<HTMLImageElement>(null);
  const locationBgRef = useRef<HTMLImageElement>(null);
  const reviewsBgRef = useRef<HTMLImageElement>(null);
  const promosBgRef = useRef<HTMLImageElement>(null);
  const contactBgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { 
        // [MODIFICADO] Configuración optimizada para Móvil y Desktop
        // rootMargin: Recorta el área de detección. Ignora el 10% superior (Header) y el 40% inferior (Dock/Chat en móvil).
        // Esto crea una "línea de lectura" más centrada, asegurando que se activen las secciones aunque el dock las tape.
        rootMargin: '-10% 0px -40% 0px', 
        threshold: 0.1 // Se activa en cuanto un 10% de la sección entra en esa zona central (más sensible)
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el as Element);
    });

    return () => observer.disconnect();
  }, []);

  // --- PARALLAX EFFECT HANDLER ---
  useEffect(() => {
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // 1. HERO PARALLAX (Special case: starts at top)
        if (heroBgRef.current && scrollPosition <= windowHeight) {
            const translateY = scrollPosition * 0.4;
            const scale = 1 + (scrollPosition * 0.0005);
            heroBgRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        }

        // Helper function for mid-section parallax
        const applyParallax = (sectionId: SectionId, bgRef: React.RefObject<HTMLImageElement | null>) => {
            const section = sectionRefs.current[sectionId];
            if (bgRef.current && section) {
                const rect = section.getBoundingClientRect();
                // Check if section is roughly in view (with some buffer)
                if (rect.top < windowHeight && rect.bottom > 0) {
                    // Parallax Logic relative to viewport position
                    // Calculate zoom based on how far we've scrolled into the section
                    const progress = Math.max(0, windowHeight - rect.top);
                    const scale = 1 + (progress * 0.0002); // Gentle zoom in

                    // Move background slower than scroll
                    const translateY = (rect.top * 0.15); 

                    bgRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
                }
            }
        };

        // Apply to sections
        applyParallax(SectionId.GALLERY, galleryBgRef);
        applyParallax(SectionId.CONTACT, contactBgRef);
        applyParallax(SectionId.PROMOS, promosBgRef);
        applyParallax(SectionId.LOCATION, locationBgRef);
        applyParallax(SectionId.PRODUCTS, productsBgRef);
        applyParallax(SectionId.TEAM, teamBgRef);
        applyParallax(SectionId.REVIEWS, reviewsBgRef);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    setSelectedGalleryIndex(null);
    setFlippedServiceId(null);
    window.dispatchEvent(new CustomEvent('section-scroll-started', { detail: id }));
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- NEW: Helper to trigger Chat Actions ---
  const triggerChatAction = (message: string) => {
    const event = new CustomEvent('chat-action-trigger', { detail: message });
    window.dispatchEvent(event);
  };

  // --- NEW: Listen for Navigation and Booking Events from Chat ---
  useEffect(() => {
    const handleNavigation = (event: CustomEvent<string>) => {
        const rawDetail = (event.detail || '').toString().trim().toLowerCase();
        
        const sectionMap: Record<string, SectionId> = {
          hero: SectionId.HERO,
          services: SectionId.SERVICES,
          servicios: SectionId.SERVICES,
          precios: SectionId.SERVICES,
          menu: SectionId.SERVICES,
          gallery: SectionId.GALLERY,
          galeria: SectionId.GALLERY,
          estilos: SectionId.GALLERY,
          fotos: SectionId.GALLERY,
          products: SectionId.PRODUCTS,
          productos: SectionId.PRODUCTS,
          tienda: SectionId.PRODUCTS,
          team: SectionId.TEAM,
          barberos: SectionId.TEAM,
          equipo: SectionId.TEAM,
          location: SectionId.LOCATION,
          ubicacion: SectionId.LOCATION,
          mapa: SectionId.LOCATION,
          reviews: SectionId.REVIEWS,
          reseñas: SectionId.REVIEWS,
          opiniones: SectionId.REVIEWS,
          promos: SectionId.PROMOS,
          promociones: SectionId.PROMOS,
          descuentos: SectionId.PROMOS,
          contact: SectionId.CONTACT,
          contacto: SectionId.CONTACT,
          citas: SectionId.CONTACT,
          cita: SectionId.CONTACT,
          agendar: SectionId.CONTACT,
          reserva: SectionId.CONTACT,
          social: SectionId.SOCIAL,
          redes: SectionId.SOCIAL,
        };

        const targetSection = sectionMap[rawDetail] || (Object.values(SectionId).includes(rawDetail as SectionId) ? (rawDetail as SectionId) : null);

        if (targetSection) {
            scrollToSection(targetSection);
        }
    };

    const handleOpenBookingTrigger = (event: CustomEvent<string | undefined>) => {
        handleOpenBooking(event.detail);
    };

    window.addEventListener('navigate-section-trigger', handleNavigation as EventListener);
    window.addEventListener('open-booking-modal-trigger', handleOpenBookingTrigger as EventListener);
    
    return () => {
        window.removeEventListener('navigate-section-trigger', handleNavigation as EventListener);
        window.removeEventListener('open-booking-modal-trigger', handleOpenBookingTrigger as EventListener);
    };
  }, []);

  // Helper to get Social Icon Component
  const getSocialIcon = (name: string) => {
      switch(name) {
          case 'Instagram': return Instagram;
          case 'Facebook': return Facebook;
          case 'TikTok': return TikTokIcon; // Using custom Icon
          case 'WhatsApp': return MessageCircle;
          case 'Maps': return MapPin;
          case 'Mobile': return Smartphone;
          default: return ExternalLink;
      }
  };

  // Helper para Compartir Nativo (Mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Barbería Elite',
                text: 'Checa este sitio, está increíble. Agendemos aquí.',
                url: window.location.href,
            });
        } catch (error) {
            console.log('Error sharing', error);
        }
    } else {
         // Fallback por si el navegador no soporta share API
         try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Enlace copiado al portapapeles");
         } catch (err) {
             console.error('Error al copiar', err);
         }
    }
  };

  const handleWhatsAppClick = () => {
    if (window.innerWidth < 768) {
      const message = "Hola, vi su InteliSite y me gustaría agendar una cita.";
      const baseUrl = WHATSAPP_DIRECT_URL.split('?')[0];
      const fullUrl = `${baseUrl}?text=${encodeURIComponent(message)}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
      setIsWhatsAppModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans selection:bg-amber-600 text-slate-200">
      
      {/* Pass isHeroVisible prop to trigger the grow animation AND the whatsapp handler */}
      <Header 
        onLogoClick={() => scrollToSection(SectionId.HERO)} 
        isHeroVisible={activeSection === SectionId.HERO} 
        onWhatsAppClick={handleWhatsAppClick}
        onBookingClick={() => handleOpenBooking()}
        onGiftClick={() => triggerChatAction('¡Hola! Vi el regalo en el menú y quiero saber de qué se trata.')}
      />
      
      {/* --- SECTIONS CONTAINER --- */}
      {/* Removed md:pr-[400px] from main so sections span full width */}
      <main className="pb-32 md:pb-0 w-full"> 
        
        {/* HERO - Optimized height & margins so everything is visible cleanly above the dock on mobile */}
        <section 
          id={SectionId.HERO} 
          ref={(el) => { sectionRefs.current[SectionId.HERO] = el; }}
          className="min-h-screen min-h-[100dvh] flex flex-col justify-center items-center pt-12 pb-24 md:pt-24 md:pb-28 relative overflow-hidden md:pr-[400px]"
        >
          <div className="absolute inset-0 z-0">
             {/* PARALLAX IMAGE: REMOVED MASK, ADDED BOTTOM FADE OVERLAY */}
             <img 
                ref={heroBgRef}
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop" 
                alt="Barber Shop Interior" 
                className="w-full h-full object-cover opacity-100 origin-center"
                style={{ willChange: 'transform' }} 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent pointer-events-none"></div>
             {/* BRIDGE FADE TO BOTTOM (To connect with Services) */}
             <div className="absolute bottom-0 left-0 w-full h-32 md:h-64 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center">
            
            {/* HERO BRANDING LOGO - UPDATED WITH RESPONSIVE SIZES */}
            <div className="mb-4 md:mb-8 flex flex-col items-center animate-[fadeInDown_1s_ease-out] group cursor-default">
                <div className="w-16 h-16 xs:w-20 xs:h-20 md:w-32 md:h-32 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-white shadow-[0_20px_60px_-10px_rgba(245,158,11,0.5)] border border-white/20 ring-1 ring-amber-500/30 mb-3 md:mb-5 animate-rock-sway transition-transform duration-500 ease-out">
                    <Scissors className="text-white transform -rotate-45 drop-shadow-xl w-8 h-8 xs:w-10 xs:h-10 md:w-[64px] md:h-[64px]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col leading-none items-center">
                    <span className="text-2xl xs:text-3xl md:text-5xl font-black text-white tracking-[0.15em] font-serif drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">BARBERÍA</span>
                    <span className="text-amber-500 font-bold tracking-[0.5em] text-xs md:text-xl uppercase mt-1 md:mt-2 drop-shadow-md">ELITE</span>
                </div>
            </div>

            <span className="inline-block py-1 px-3 md:px-4 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[9px] md:text-[10px] font-bold tracking-[0.2em] mb-4 md:mb-6 uppercase backdrop-blur-md">
                Est. 2025 • SmartSite Demo
            </span>

            <h1 className="text-3xl xs:text-4xl md:text-7xl font-black text-white mb-3 md:mb-6 leading-none tracking-tight font-serif drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              MAESTROS <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600 stroke-white stroke-1 filter drop-shadow-lg">
                DEL ESTILO
              </span>
            </h1>
            <p className="text-base md:text-2xl text-slate-100 mb-6 md:mb-10 font-medium max-w-2xl mx-auto drop-shadow-md bg-black/30 px-4 py-2.5 md:p-4 rounded-lg backdrop-blur-[2px]">
              Más que un corte, una experiencia.
            </p>
            <div className="flex flex-col items-center gap-4">
              {/* Modificado: Botón ahora es enlace directo */}
              <button 
                type="button"
                onClick={() => handleOpenBooking(BOOKING_URL)}
                className="px-7 py-3.5 md:px-8 md:py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest text-xs md:text-sm rounded-sm transition-all shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] transform hover:scale-105 border border-amber-400/50 inline-block cursor-pointer"
              >
                  Reservar Ahora
              </button>
            </div>
          </div>
        </section>

        {/* 2. SERVICES */}
        <section 
            id={SectionId.SERVICES}
            ref={(el) => { sectionRefs.current[SectionId.SERVICES] = el; }}
            className="py-16 md:py-0 md:min-h-screen md:pt-20 md:pb-60 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
                {/* Decorative colored blobs - REMOVED MASK */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

                {/* --- ADDED BRIDGES FOR SERVICES --- */}
                {/* Top Bridge: Connects with Hero */}
                <div className="absolute top-0 left-0 w-full h-32 md:h-64 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                {/* Bottom Bridge: Connects with Gallery */}
                <div className="absolute bottom-0 left-0 w-full h-32 md:h-64 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
            </div>
            
            {/* Narrow Content for Price List */}
            <div className="max-w-4xl mx-auto w-full relative z-10 px-6">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-amber-900/40 text-amber-500 rounded-sm border border-amber-900/50 backdrop-blur-md shadow-lg">
                        <Scissors size={32} className="animate-bounce" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-serif drop-shadow-lg">Nuestros Servicios</h2>
                </div>
                
                {/* Price List with 3D Flip Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    {SERVICES.map((s) => {
                        const isFlipped = flippedServiceId === s.id;
                        return (
                            <div 
                                key={s.id} 
                                className="perspective-1000 min-h-[250px] relative w-full group"
                            >
                                <div className={`relative w-full h-full min-h-[250px] transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    
                                    {/* FRONT SIDE */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden p-6 rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-700/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md shadow-lg flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/20 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 blur-xl pointer-events-none"></div>
                                        <div>
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <h3 className="text-xl font-bold text-slate-100 font-serif tracking-wide group-hover:text-amber-500 transition-colors">{s.title}</h3>
                                                <span className="text-amber-500 text-lg font-bold">{s.price}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-4">{s.description}</p>
                                            {s.duration && (
                                                <div className="flex items-center gap-2 text-xs text-amber-400/90 mb-3 font-medium bg-amber-500/10 px-2.5 py-1 rounded w-fit border border-amber-500/20">
                                                    <Clock size={13} />
                                                    <span>Duración: {s.duration}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFlippedServiceId(isFlipped ? null : s.id);
                                                }}
                                                className="text-amber-400 hover:text-amber-300 font-bold uppercase text-xs tracking-widest flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded border border-amber-500/40 transition-all shadow-sm active:scale-95"
                                            >
                                                <span>Detalle</span>
                                                <RotateCcw size={13} className="text-amber-400" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenBooking(BOOKING_URL);
                                                }}
                                                className="text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <span>Reservar</span>
                                                <ArrowRight size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* BACK SIDE */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-3.5 sm:p-4 rounded-sm border border-amber-500/50 bg-slate-900/95 transition-all overflow-hidden backdrop-blur-md shadow-2xl flex flex-col justify-between ring-1 ring-amber-500/30">
                                        <div>
                                            <div className="flex justify-between items-center pb-2 mb-2 border-b border-amber-500/20">
                                                <div>
                                                    <h4 className="text-base sm:text-lg font-bold text-amber-400 font-serif leading-tight">{s.title}</h4>
                                                    <span className="text-[11px] text-slate-400 font-medium">{s.duration} • {s.price}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFlippedServiceId(null)}
                                                    className="p-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-transform hover:rotate-180 duration-300 flex-shrink-0"
                                                    title="Volver al frente"
                                                >
                                                    <RotateCcw size={13} />
                                                </button>
                                            </div>

                                            {s.includes && (
                                                <div className="mb-2">
                                                    <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block mb-1">Incluye:</span>
                                                    <ul className="grid grid-cols-1 gap-0.5 text-xs text-slate-200">
                                                        {s.includes.map((inc, idx) => (
                                                            <li key={idx} className="flex items-center gap-1.5 leading-tight">
                                                                <Check size={11} className="text-amber-400 flex-shrink-0" />
                                                                <span className="text-[11px] sm:text-xs">{inc}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {s.idealFor && (
                                                <p className="text-[11px] sm:text-xs text-slate-300 leading-snug mt-1">
                                                    <strong className="text-amber-400 font-semibold">Ideal para:</strong> {s.idealFor}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2 mt-auto">
                                            <button
                                                type="button"
                                                onClick={() => setFlippedServiceId(null)}
                                                className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
                                            >
                                                <RotateCcw size={12} />
                                                <span>Volver</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleOpenBooking(BOOKING_URL)}
                                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>Reservar</span>
                                                <ArrowRight size={13} />
                                            </button>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* 3. GALLERY */}
        <section 
            id={SectionId.GALLERY}
            ref={(el) => { sectionRefs.current[SectionId.GALLERY] = el; }}
            className="py-16 md:py-0 md:min-h-screen md:pt-20 md:pb-60 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px] bg-slate-950"
        >
             <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                 {/* Updated Background Image for Parallax */}
                 <img 
                    ref={galleryBgRef}
                    src="https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-20 filter grayscale contrast-125 origin-center" 
                    loading="lazy"
                    style={{ willChange: 'transform' }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950"></div>
                 {/* BRIDGE FADE TO TOP (Connects with Services) */}
                 <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                 {/* BRIDGE FADE TO BOTTOM (Connects with Contact) */}
                 <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
             </div>

             {/* Modificado: max-w-6xl (antes max-w-[1900px]) para reducir el ancho general */}
             <div className="w-full max-w-6xl px-6 md:px-12 relative z-10">
                <div className="flex items-center gap-4 mb-10 max-w-4xl mx-auto">
                    <div className="p-3 bg-white/10 text-white rounded-sm border border-white/20 backdrop-blur-md shadow-lg">
                        <Camera size={32} className="animate-bounce" />
                    </div>
                    <div>
                         <h2 className="text-4xl md:text-5xl font-bold text-white font-serif drop-shadow-lg leading-none">Galería Elite</h2>
                         <p className="text-amber-500 text-sm font-bold tracking-widest uppercase mt-1">PRESIONA CUALQUIER FOTO PARA VERLA EN GRANDE</p>
                    </div>
                </div>

                {/* GRID LAYOUT */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 auto-rows-fr">
                    {STYLE_GALLERY.map((style, idx) => (
                        <div 
                            key={style.id}
                            onClick={() => setSelectedGalleryIndex(idx)}
                            className="group relative rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-pointer aspect-[3/4] hover:shadow-2xl hover:shadow-amber-900/20 hover:border-amber-500/50 transition-all duration-500"
                        >
                            <img 
                                src={style.image} 
                                alt={style.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                            
                            {/* Hover Reveal Badge */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                                <div className="bg-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-xl transition-transform hover:scale-105">
                                    <Maximize2 size={14} />
                                    <span className="font-bold text-xs uppercase tracking-wider">Ampliar</span>
                                </div>
                            </div>
                            
                            {/* Title & Price */}
                            <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                <span className="text-white font-bold text-sm md:text-base leading-tight block font-serif drop-shadow-md">
                                    {style.title}
                                </span>
                                {style.price && (
                                    <span className="text-amber-400 font-bold text-xs block mt-0.5">
                                        {style.price}
                                    </span>
                                )}
                                <div className="h-0.5 w-0 group-hover:w-10 bg-amber-500 transition-all duration-500 mt-1"></div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        {/* 4. CONTACT (MOVED UP) */}
        <section 
            id={SectionId.CONTACT}
            ref={(el) => { sectionRefs.current[SectionId.CONTACT] = el; }}
            className="py-16 md:py-0 md:min-h-screen md:pt-20 md:pb-60 px-6 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Parallax Background - REMOVED MASK */}
                <img 
                    ref={contactBgRef}
                    // Updated URL with provided Unsplash image
                    src="https://images.unsplash.com/photo-1496181832051-69dcf27fc27d?q=80&w=4031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-30 origin-center" 
                    loading="lazy" 
                    alt="Contact Background" 
                    style={{ willChange: 'transform' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/80"></div>
                {/* BRIDGE FADE TO TOP */}
                <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                {/* BRIDGE FADE TO BOTTOM */}
                <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
            </div>

            <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-900/40 text-emerald-500 rounded-sm border border-emerald-900/50 backdrop-blur-md shadow-lg">
                            <Calendar size={32} className="animate-bounce" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-serif drop-shadow-lg">Tu Tiempo</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-sm border border-white/10 hover:border-emerald-500/30 transition-colors">
                            <Clock className="text-amber-500 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-slate-200 mb-1">Horarios</h4>
                                <ul className="text-sm text-slate-400 space-y-1">
                                    <li className="flex justify-between w-48"><span>Lun - Vie:</span> <span>10:00 - 20:00</span></li>
                                    <li className="flex justify-between w-48"><span>Sábado:</span> <span>09:00 - 18:00</span></li>
                                    <li className="flex justify-between w-48 text-amber-600"><span>Domingo:</span> <span>Cerrado</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-sm border border-white/10 hover:border-emerald-500/30 transition-colors">
                            <CheckCircle className="text-emerald-500 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-slate-200 mb-1">Reserva Online</h4>
                                <p className="text-sm text-slate-400">Confirmación inmediata. Sin esperas.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => handleOpenBooking(BOOKING_URL)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-sm transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1 cursor-pointer"
                    >
                        <span>Agendar Cita</span>
                        <Calendar size={18} />
                    </button>
                </div>

                <div className="flex-1 w-full relative group">
                     <div className="absolute inset-0 bg-emerald-500/10 rounded-sm transform rotate-3 transition-transform group-hover:rotate-6"></div>
                     <div className="relative rounded-sm overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                            src="https://plus.unsplash.com/premium_photo-1661542350224-8e3f095ce053?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                            alt="Barber Chair" 
                            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                            <p className="text-white font-serif italic text-xl">"El estilo es eterno."</p>
                        </div>
                     </div>
                </div>
            </div>
        </section>

        {/* 5. PROMOS (MOVED UP) */}
        <section 
            id={SectionId.PROMOS}
            ref={(el) => { sectionRefs.current[SectionId.PROMOS] = el; }}
            className="min-h-screen min-h-[100dvh] px-4 sm:px-6 pt-12 pb-24 md:pt-20 md:pb-60 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
             <div className="absolute inset-0 z-0 overflow-hidden">
                 {/* Parallax Background - REMOVED MASK */}
                 <img 
                    ref={promosBgRef}
                    src="https://images.unsplash.com/photo-1702865272115-5afdbae975af?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-50 origin-center" 
                    loading="lazy"
                    style={{ willChange: 'transform' }} 
                 />
                 {/* Reverted heavy black overlay to standard gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/90"></div>
                 {/* BRIDGE FADE TO TOP */}
                 <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                 {/* BRIDGE FADE TO BOTTOM */}
                 <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
             </div>
             
            <div className="max-w-2xl mx-auto w-full relative z-10 text-center border-2 md:border-4 border-double border-amber-500/30 p-5 sm:p-8 md:p-12 bg-black/50 backdrop-blur-md shadow-2xl rounded-sm">
                <div className="inline-flex p-2.5 sm:p-4 bg-amber-600/30 rounded-full mb-3 sm:mb-6 md:mb-8 border border-amber-500/50 shadow-[0_0_30px_rgba(217,119,6,0.3)]">
                    <Ticket className="w-8 h-8 md:w-12 md:h-12 text-amber-400 animate-bounce" />
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4 text-white font-serif tracking-tight drop-shadow-lg">PRIMERA VISITA</h2>
                <p className="text-sm sm:text-lg md:text-xl text-amber-50 mb-4 sm:mb-8 max-w-lg mx-auto font-light leading-snug sm:leading-relaxed drop-shadow-md">
                    Vive la experiencia Elite con una cerveza artesanal de cortesía y <span className="text-amber-400 font-bold">20% OFF</span> en tu primer corte.
                </p>
                
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-4 sm:mb-8">
                     <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-amber-400/80 font-bold flex items-center gap-1.5">
                        <Lock size={12} />
                        Cupón Bloqueado
                     </span>
                     <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-500 px-5 py-2.5 sm:px-8 sm:py-4 text-xl sm:text-3xl font-mono font-bold tracking-widest transform -rotate-2 shadow-inner border-2 sm:border-4 border-slate-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl sm:text-6xl select-none">???</div>
                        ?????????
                     </div>
                </div>

                <button 
                    onClick={() => triggerChatAction('Quiero desbloquear el descuento secreto de primera visita.')}
                    className="
                        w-full md:w-auto px-6 py-3.5 sm:px-12 sm:py-5
                        mx-auto
                        bg-amber-600 text-white font-black uppercase tracking-wider sm:tracking-widest text-xs sm:text-base
                        rounded-xl border-2 sm:border-4 border-white
                        shadow-[0_8px_16px_rgba(0,0,0,0.5)] 
                        transform transition-all duration-300 ease-out
                        hover:-translate-y-2 hover:rotate-1 hover:scale-105
                        hover:bg-amber-500
                        hover:shadow-[0_20px_30px_-5px_rgba(217,119,6,0.6)]
                        active:scale-95 active:translate-y-0
                        flex items-center justify-center gap-2
                        cursor-pointer
                    "
                >
                    <span>🔓 Desbloquear Descuento</span>
                </button>
                <p className="mt-3 sm:mt-6 text-[11px] sm:text-xs text-amber-200/60 font-medium tracking-wide">*Requiere activación en Chat.</p>
            </div>
        </section>

        {/* 6. LOCATION (MOVED UP) */}
        <section 
            id={SectionId.LOCATION}
            ref={(el) => { sectionRefs.current[SectionId.LOCATION] = el; }}
            className="py-16 md:py-0 md:min-h-screen md:pt-20 md:pb-60 px-6 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
             <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Parallax Background - REMOVED MASK */}
                <img 
                    ref={locationBgRef}
                    src="https://plus.unsplash.com/premium_photo-1763063466350-417e6094a3d1?q=80&w=4015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-50 origin-center" 
                    loading="lazy" 
                    style={{ willChange: 'transform' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950"></div>
                {/* BRIDGE FADE TO TOP */}
                <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                {/* BRIDGE FADE TO BOTTOM */}
                <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
            </div>
            
             <div className="max-w-5xl mx-auto w-full flex flex-col relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-red-900/40 text-red-500 rounded-sm border border-red-900/50 backdrop-blur-md shadow-lg">
                        <MapPin size={32} className="animate-bounce" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-serif drop-shadow-lg">El Santuario</h2>
                </div>

                {/* Split Layout: Info Left, Interactive Map Right */}
                <div className="grid md:grid-cols-2 gap-0 bg-slate-900/60 rounded-sm overflow-hidden shadow-2xl border border-white/20 backdrop-blur-md">
                     {/* Info Column */}
                     <div className="p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Scissors size={100} />
                        </div>
                        <h4 className="font-bold text-3xl text-white mb-2 font-serif">Barbería Elite Central</h4>
                        <div className="h-1 w-16 bg-amber-600 mb-6"></div>
                        
                        <p className="text-slate-300 mb-2 text-lg font-medium">Calle Principal 555</p>
                        <p className="text-slate-400 mb-8 text-sm">Centro Histórico, Ciudad de México</p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => window.open('https://maps.app.goo.gl/kqVTppn2tg6R8USP9', '_blank')}
                                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-4 rounded-sm font-bold text-sm hover:bg-slate-200 transition-colors uppercase tracking-wide group"
                            >
                                <MapPin size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
                                Abrir en Google Maps
                            </button>
                            
                            {/* BOTÓN MÓVIL: ABRE DIRECTO LA APP DE MAPAS */}
                            <button 
                                onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=19.432608,-99.133208', '_blank')}
                                className="md:hidden w-full flex items-center justify-center gap-3 bg-slate-800 text-white py-4 px-4 rounded-sm font-bold text-sm hover:bg-slate-700 hover:text-amber-400 transition-all uppercase tracking-wide border border-slate-600 hover:border-amber-500/50 group"
                            >
                                <Navigation size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                Abrir Ruta GPS
                            </button>

                            {/* BOTÓN DESKTOP: ABRE MODAL CON QR */}
                            <button 
                                onClick={() => setIsLocationModalOpen(true)}
                                className="hidden md:flex w-full items-center justify-center gap-3 bg-slate-800 text-white py-4 px-4 rounded-sm font-bold text-sm hover:bg-slate-700 hover:text-amber-400 transition-all uppercase tracking-wide border border-slate-600 hover:border-amber-500/50 group"
                            >
                                <ScanLine size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                Escanear Ruta (GPS)
                            </button>

                            <button 
                                onClick={() => triggerChatAction('¿Tienen estacionamiento disponible?')}
                                className="w-full border border-slate-500 text-slate-300 py-4 px-4 rounded-sm font-bold text-sm hover:border-amber-500 hover:text-amber-500 transition-colors uppercase tracking-wide bg-transparent hover:bg-black/30"
                            >
                                Info de Estacionamiento
                            </button>
                        </div>
                     </div>

                     {/* Interactive Map Column */}
                     <div className="h-[300px] md:h-auto min-h-[400px] relative bg-slate-800 group">
                         {/* Loading/Cover in case iframe is slow */}
                         <div className="absolute inset-0 bg-slate-800 flex items-center justify-center -z-10">
                             <MapPin className="text-slate-700 animate-pulse" size={48}/>
                         </div>
                         <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.536830508542!2d-99.133208!3d19.432608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f92b75aa014d%3A0x17d2a58b5e406f8b!2sCentro%20Hist%C3%B3rico%20de%20la%20Cdad.%20de%20M%C3%A9xico%2C%20Centro%2C%20Cuauht%C3%A9moc%2C%2006000%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX%2C%20Mexico!5e0!3m2!1sen!2sus!4v1709900000000!5m2!1sen!2sus"
                            width="100%" 
                            height="100%" 
                            style={{ border: 0, filter: 'grayscale(100%)' }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full transition-all duration-700 group-hover:filter-none"
                            title="Mapa de Ubicación"
                        ></iframe>
                        {/* Overlay to hint interaction */}
                        <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
                     </div>
                </div>
            </div>
        </section>

        {/* 7. PRODUCTS (MOVED DOWN) */}
        <section 
            id={SectionId.PRODUCTS}
            ref={(el) => { sectionRefs.current[SectionId.PRODUCTS] = el; }}
            className="py-16 md:py-0 md:min-h-screen px-4 sm:px-6 pt-16 md:pt-20 pb-16 md:pb-60 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img 
                    ref={productsBgRef}
                    src="https://images.unsplash.com/photo-1621607505833-616916c46a25?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-50 origin-center" 
                    loading="lazy" 
                    style={{ willChange: 'transform' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/90"></div>
                {/* BRIDGE FADE TO TOP */}
                <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                {/* BRIDGE FADE TO BOTTOM */}
                <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
            </div>

            <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                    <div className="p-2.5 md:p-3 bg-emerald-900/40 text-emerald-500 rounded-sm border border-emerald-900/50 backdrop-blur-md shadow-lg">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 animate-bounce" />
                    </div>
                    <div>
                         <h2 className="text-3xl md:text-5xl font-bold text-white font-serif drop-shadow-lg leading-none">Productos Elite</h2>
                         <p className="text-amber-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-1">Estilo profesional en tus manos</p>
                    </div>
                </div>

                {/* FLASH ANIMADO DE DISPONIBILIDAD */}
                <div className="mb-6 md:mb-12 relative group cursor-default">
                   <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                   <div className="relative px-4 py-2 sm:px-7 sm:py-3 bg-black/60 ring-1 ring-emerald-500/50 rounded-lg leading-none flex items-center gap-2 backdrop-blur-md">
                     <Zap size={14} className="text-emerald-400 fill-emerald-400 flex-shrink-0" />
                     <span className="text-emerald-400 font-bold tracking-wider sm:tracking-widest uppercase text-[10px] sm:text-xs md:text-sm">Solicítalos exclusivamente en la barbería</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
                    {PRODUCTS.map((product) => {
                        const isFlipped = flippedProductId === product.id;
                        return (
                            <div 
                                key={product.id} 
                                className="perspective-1000 h-[calc(100dvh-220px)] min-h-[350px] max-h-[480px] md:h-[440px] w-full relative group"
                            >
                                <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    
                                    {/* FRONT SIDE */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 transition-all overflow-hidden backdrop-blur-md shadow-2xl flex flex-col justify-between">
                                        {/* Product Image */}
                                        <div className="relative h-[48%] sm:h-[52%] md:h-[55%] w-full overflow-hidden flex-shrink-0">
                                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-emerald-400 font-bold text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-500/40 z-10 shadow-md">
                                                {product.price}
                                            </div>
                                            {product.volume && (
                                                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-300 font-semibold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-white/10 z-10">
                                                    {product.volume}
                                                </div>
                                            )}
                                            <img 
                                                src={product.image} 
                                                alt={product.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                                        </div>

                                        {/* Front Info Content */}
                                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl sm:text-2xl font-bold text-white font-serif mb-1 sm:mb-2">{product.title}</h3>
                                                <p className="text-slate-300 text-xs sm:text-sm leading-snug sm:leading-relaxed line-clamp-3">{product.description}</p>
                                            </div>

                                            {/* Front Action Button */}
                                            <div className="pt-3 border-t border-white/10 mt-2">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFlippedProductId(isFlipped ? null : product.id);
                                                    }}
                                                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold uppercase text-[11px] sm:text-xs tracking-wider rounded-lg border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                                                >
                                                    <span>Más Información</span>
                                                    <RotateCcw size={13} className="text-emerald-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BACK SIDE */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-4 sm:p-5 rounded-xl border border-emerald-500/50 bg-slate-900/95 transition-all overflow-hidden backdrop-blur-md shadow-2xl flex flex-col justify-between ring-1 ring-emerald-500/30">
                                        <div className="flex flex-col h-full justify-between">
                                            {/* Top header of back side */}
                                            <div>
                                                <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-emerald-500/30">
                                                    <div>
                                                        <h4 className="text-lg sm:text-xl font-bold text-emerald-400 font-serif leading-tight">{product.title}</h4>
                                                        <span className="text-xs sm:text-sm text-emerald-200/90 font-semibold">{product.price} {product.volume ? `• ${product.volume}` : ''}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFlippedProductId(null)}
                                                        className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-transform hover:rotate-180 duration-300 flex-shrink-0 cursor-pointer"
                                                        title="Volver al frente"
                                                    >
                                                        <RotateCcw size={15} />
                                                    </button>
                                                </div>

                                                {/* Benefits */}
                                                {product.benefits && (
                                                    <div className="mb-3">
                                                        <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">Beneficios Elite:</span>
                                                        <ul className="space-y-1.5">
                                                            {product.benefits.map((benefit, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 leading-snug">
                                                                    <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                                                    <span className="text-xs sm:text-sm text-slate-200">{benefit}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Usage instructions */}
                                                {product.usage && (
                                                    <div className="bg-emerald-950/50 p-2.5 sm:p-3 rounded-lg border border-emerald-500/30 mb-2">
                                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Modo de uso:</span>
                                                        <p className="text-xs sm:text-sm text-slate-200 leading-snug italic">{product.usage}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Back info badge */}
                                            <div className="w-full py-2.5 sm:py-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-xs sm:text-sm tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-inner text-center">
                                                <ShoppingBag size={16} className="text-emerald-400" />
                                                <span>Solicítalo en la barbería</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* 8. TEAM (MOVED DOWN) */}
        <section 
            id={SectionId.TEAM}
            ref={(el) => { sectionRefs.current[SectionId.TEAM] = el; }}
            className="py-16 md:py-0 md:min-h-screen px-4 sm:px-6 pt-16 md:pt-20 pb-16 md:pb-60 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Updated Background Image for Team Section WITH PARALLAX REF - REMOVED MASK */}
                {/* Modificado: opacity-60 (más claro), h-[120%] (para dar espacio al movimiento), -top-[10%] (centrado para movimiento) */}
                <img 
                    ref={teamBgRef}
                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=3548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-60 origin-center" 
                    loading="lazy" 
                    style={{ willChange: 'transform' }}
                />
                {/* Modificado: Degradado más suave (via-transparent) para que se vea la foto */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/80"></div>
                {/* BRIDGE FADE TO TOP */}
                <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                {/* BRIDGE FADE TO BOTTOM */}
                <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
            </div>

             <div className="max-w-5xl mx-auto w-full relative z-10">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-12">
                    <div className="p-2.5 md:p-3 bg-blue-900/40 text-blue-500 rounded-sm border border-blue-900/50 backdrop-blur-md shadow-lg">
                        <Users className="w-6 h-6 md:w-8 md:h-8 animate-bounce" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-serif drop-shadow-lg">El Equipo</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
                    {TEAM_MEMBERS.map((member) => (
                        <div key={member.id} className="group flex flex-col justify-between">
                            <div className="h-[calc(100dvh-220px)] min-h-[340px] max-h-[480px] md:h-[400px] w-full overflow-hidden rounded-sm border border-white/10 shadow-2xl relative mb-3 md:mb-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 opacity-90"></div>
                                <img 
                                    src={member.image} 
                                    alt={member.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0" 
                                />
                                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 md:p-6 z-20">
                                    <h3 className="text-xl sm:text-2xl font-bold text-white font-serif mb-1">{member.name}</h3>
                                    <p className="text-amber-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">{member.role}</p>
                                    <p className="text-slate-300 text-xs sm:text-sm italic opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:transform md:translate-y-4 md:group-hover:translate-y-0">
                                        Especialidad: {member.specialty}
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => handleOpenBooking(member.bookingUrl)}
                                className="w-full py-3.5 md:py-4 bg-white/5 border border-white/10 text-slate-300 font-bold uppercase text-xs tracking-wider md:tracking-widest hover:bg-amber-600 hover:text-white hover:border-amber-500 transition-all duration-300 flex items-center justify-center gap-2 rounded-sm backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/20 shadow-lg cursor-pointer"
                            >
                                <Scissors size={14} />
                                Reservar con {member.name.split('"')[0].trim()}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* 9. REVIEWS (MOVED DOWN) */}
        <section 
            id={SectionId.REVIEWS}
            ref={(el) => { sectionRefs.current[SectionId.REVIEWS] = el; }}
            className="py-16 md:py-0 md:min-h-screen md:pt-20 md:pb-60 px-6 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px]"
        >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Parallax Background - REMOVED MASK */}
                <img 
                    ref={reviewsBgRef}
                    src="https://images.unsplash.com/photo-1588771930296-88c2cb03f386?q=80&w=3236&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-[120%] absolute -top-[10%] object-cover opacity-40 origin-center" 
                    loading="lazy" 
                    style={{ willChange: 'transform' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/80"></div>
                {/* BRIDGE FADE TO TOP */}
                <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-slate-950 to-transparent z-10"></div>
                {/* BRIDGE FADE TO BOTTOM */}
                <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
            </div>

            <div className="max-w-4xl mx-auto w-full relative z-10">
                
                {/* HEADER: Removed the top button */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-900/40 text-yellow-500 rounded-sm border border-yellow-900/50 backdrop-blur-md shadow-lg">
                            <Star size={32} className="animate-bounce" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-serif drop-shadow-lg">Clientes Reales</h2>
                    </div>
                </div>

                {/* TESTIMONIALS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {REVIEWS.map((r) => (
                        <div key={r.id} className="p-8 rounded-sm bg-black/40 border border-white/10 flex flex-col gap-4 hover:border-amber-800/50 hover:bg-black/60 transition-all backdrop-blur-md shadow-xl hover:-translate-y-1">
                            <div className="flex gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-slate-700"} />
                                ))}
                            </div>
                            <p className="text-slate-200 italic text-lg font-serif">"{r.comment}"</p>
                            <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/10">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 border border-slate-600">
                                    {r.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-100 text-sm uppercase tracking-wide">{r.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* NEW: Direct Review Call to Action (Replaces Popup) */}
                <div className="max-w-2xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden group">
                     {/* Background Icon Decoration */}
                     <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500 pointer-events-none">
                        <MessageSquarePlus size={100} />
                     </div>
                     
                     <div className="relative z-10 flex flex-col items-center">
                        {/* Animated Icon - Changed to 5 Stars */}
                        <div className="px-6 py-3 bg-amber-600/20 rounded-full flex items-center justify-center gap-2 mb-4 border border-amber-600/30 group-hover:scale-110 transition-transform duration-500">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} className="text-amber-500 fill-amber-500" />
                             ))}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white font-serif mb-2">Tu Opinión Importa</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm md:text-base">
                            Ayúdanos a mejorar. Califícanos en Google.
                        </p>

                        <button 
                            onClick={() => window.open(GOOGLE_REVIEW_URL, '_blank')}
                            className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-amber-500/30 transform hover:-translate-y-1 hover:scale-105"
                        >
                            <MessageSquarePlus size={18} />
                            <span>ESCRIBIR RESEÑA</span>
                        </button>
                     </div>
                </div>
            </div>
        </section>

        {/* 10. SOCIAL (LAST) */}
        <section 
            id={SectionId.SOCIAL}
            ref={(el) => { sectionRefs.current[SectionId.SOCIAL] = el; }}
            className="py-16 md:py-0 md:min-h-screen md:pt-20 md:pb-60 px-6 flex flex-col justify-center items-center relative overflow-hidden md:pr-[400px] bg-slate-950"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-950 to-slate-950"></div>
            
            <div className="max-w-4xl mx-auto w-full relative z-10 text-center">
                 <div className="mb-12 inline-block">
                    {/* Changed Title from CONTACTO to SÍGUENOS */}
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4 relative z-10">SÍGUENOS</h2>
                    <div className="h-1 w-24 bg-amber-500 mx-auto"></div>
                 </div>
                 
                 <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                    {SOCIAL_LINKS.map((social) => {
                        const Icon = getSocialIcon(social.name);
                        
                        // Check if it's WhatsApp to override behavior
                        const isWhatsApp = social.name === 'WhatsApp';
                        // Check if it's Mobile Item
                        const isMobileItem = social.name === 'Mobile';
                        
                        // LOGIC FOR MOBILE ITEM SPLIT
                        if (isMobileItem) {
                             return (
                                <React.Fragment key={social.name}>
                                    {/* DESKTOP VERSION: Show QR Code Modal (Hidden on mobile) */}
                                    <a 
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setIsMobileShareModalOpen(true); }}
                                        className={`
                                            hidden md:flex 
                                            group w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-col items-center justify-center 
                                            text-white shadow-lg transition-all duration-300 
                                            hover:scale-110 hover:-translate-y-2 border border-white/5 hover:border-white/20 relative cursor-pointer
                                            ${social.color}
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-2xl"></div>
                                        <div className="relative z-10">
                                            <Smartphone size={40} strokeWidth={1.5} />
                                        </div>
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap">
                                            Ver en Móvil
                                        </div>
                                    </a>

                                    {/* MOBILE VERSION: Native Share Button (Hidden on desktop) */}
                                    <button 
                                        onClick={handleNativeShare}
                                        className={`
                                            md:hidden flex
                                            group w-20 h-20 rounded-2xl flex-col items-center justify-center 
                                            text-white shadow-lg transition-all duration-300 
                                            active:scale-95 border border-white/5 relative cursor-pointer
                                            bg-indigo-600
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-2xl"></div>
                                        <div className="relative z-10">
                                            <Share2 size={40} strokeWidth={1.5} />
                                        </div>
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap">
                                            Compartir
                                        </div>
                                    </button>
                                </React.Fragment>
                             );
                        }

                        const isTopThree = ['Instagram', 'Facebook', 'TikTok'].includes(social.name);

                        // STANDARD RENDERING FOR OTHER ICONS
                        return (
                            <a 
                                key={social.name}
                                href={isWhatsApp ? undefined : social.url}
                                onClick={(e) => {
                                   if (isWhatsApp) {
                                       e.preventDefault();
                                       handleWhatsAppClick();
                                   }
                                }}
                                target={isWhatsApp ? undefined : "_blank"}
                                rel={isWhatsApp ? undefined : "noopener noreferrer"}
                                // Removed overflow-hidden to allow tooltip to show
                                className={`
                                    group w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center 
                                    text-white shadow-lg transition-all duration-300 
                                    hover:scale-110 hover:-translate-y-2 border border-white/5 hover:border-white/20 relative cursor-pointer
                                    ${social.color}
                                `}
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-2xl"></div>
                                <div className="relative z-10">
                                    {social.name === 'WhatsApp' ? (
                                        <img 
                                            src="https://global-files-nginx.builderall.com/0e184df7-813a-4af4-89e6-7f8094a855e1/e69e5daab694041319b4628a595c67f3b23b1f1dee4abfc7a8f17d80705f33f4.webp"
                                            alt="WhatsApp"
                                            className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <Icon size={40} strokeWidth={1.5} />
                                    )}
                                </div>

                                {/* Tooltip on Hover */}
                                <div className={`${isTopThree ? 'hidden md:block' : ''} absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap`}>
                                    {social.name}
                                </div>
                            </a>
                        );
                    })}
                 </div>

                 {/* NEW BLOG BUTTON - UPDATED WITH MERCAMOCION URL */}
                 <div className="mt-12 flex justify-center">
                    <a 
                        href={BLOG_URL}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="
                            flex items-center gap-3 px-6 py-3 rounded-full 
                            bg-white/5 border border-white/10 
                            hover:bg-amber-600/20 hover:border-amber-500/50 hover:text-amber-400 
                            transition-all duration-300 group
                        "
                    >
                        <BookOpen size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-amber-400">
                            Blog
                        </span>
                    </a>
                 </div>

                 {/* --- NEW FOOTER: 3 Levels (Copyright, Legal, Branding) --- */}
                 <div className="mt-20 flex flex-col items-center gap-6 pb-8">
                    {/* Level 0: Icon */}
                    <Scissors size={24} className="text-amber-500/50" />
                    
                    {/* Level 1: Client Copyright */}
                    <p className="text-slate-400 text-sm tracking-widest font-bold">
                        © 2025 BARBERÍA ELITE
                    </p>
                    
                    {/* Level 2: Legal Links */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                        <a href="#" className="hover:text-slate-300 transition-colors">Términos y Condiciones</a>
                        <span className="text-slate-700">•</span>
                        <a href="#" className="hover:text-slate-300 transition-colors">Política de Privacidad</a>
                    </div>
                    
                    {/* Level 3: InteliSite Branding */}
                    <a 
                        href="https://intelisite.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-600 hover:text-amber-400 transition-colors font-mono tracking-widest border-t border-slate-800 pt-4 px-4 hover:border-amber-500/30"
                    >
                        InteliSite • Creado por Mercamoción
                    </a>
                </div>
            </div>
        </section>

      </main>
      
      {/* ADD MODALS HERE */}
      <WhatsAppModal 
        isOpen={isWhatsAppModalOpen} 
        onClose={() => setIsWhatsAppModalOpen(false)} 
        phoneNumberUrl={WHATSAPP_DIRECT_URL}
      />

      <MobileShareModal
        isOpen={isMobileShareModalOpen}
        onClose={() => setIsMobileShareModalOpen(false)}
      />

      {/* Renderizado del nuevo LocationModal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* MODAL CARRUSEL DE GALERÍA AMPLIADA */}
      {selectedGalleryIndex !== null && (() => {
        const prevIdx = selectedGalleryIndex === 0 ? STYLE_GALLERY.length - 1 : selectedGalleryIndex - 1;
        const nextIdx = selectedGalleryIndex === STYLE_GALLERY.length - 1 ? 0 : selectedGalleryIndex + 1;
        const prevSlide = STYLE_GALLERY[prevIdx];
        const currentSlide = STYLE_GALLERY[selectedGalleryIndex];
        const nextSlide = STYLE_GALLERY[nextIdx];
        const slides = [prevSlide, currentSlide, nextSlide];

        return (
          <div 
            className="fixed inset-0 h-[100dvh] z-40 flex items-center justify-center px-3 sm:px-4 pt-10 pb-14 sm:pt-12 sm:pb-20 md:pr-[420px] bg-black/90 backdrop-blur-md animate-fade-in overflow-hidden"
            onClick={() => setSelectedGalleryIndex(null)}
          >
            <div 
              className="relative w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón Anterior Único y Sutil */}
              <button
                type="button"
                onClick={handlePrevSlide}
                className="flex absolute left-1 sm:-left-12 lg:-left-14 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-xl"
                title="Anterior estilo"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Botón Siguiente Único y Sutil */}
              <button
                type="button"
                onClick={handleNextSlide}
                className="flex absolute right-1 sm:-right-12 lg:-right-14 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 shadow-xl"
                title="Siguiente estilo"
              >
                <ChevronRight size={20} />
              </button>

              <div 
                ref={carouselContainerRef}
                className="relative w-full overflow-hidden touch-pan-y"
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={() => { if (isDragging) handleDragEnd(); }}
              >
              {/* Contenedor deslizable de 3 tarjetas con espacio entre marcos */}
              <div 
                className="w-[300%] flex flex-row"
                style={{
                  transform: `translateX(calc(-33.333333% + ${dragOffset}px))`,
                  transition: (isDragging || skipTransition) ? 'none' : 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                {slides.map((item, slideIdx) => {
                  const cardIndex = slideIdx === 0 ? prevIdx : slideIdx === 1 ? selectedGalleryIndex : nextIdx;
                  return (
                    <div key={slideIdx} className="w-1/3 flex-shrink-0 px-1.5 sm:px-2.5 box-border select-none">
                      {/* MARCO Y TARJETA INDIVIDUAL - Más alta y proporcionada */}
                      <div className="relative w-full bg-slate-900 rounded-2xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-85px)] sm:max-h-[calc(100dvh-130px)]">
                        
                        {/* Header de la tarjeta con contador y botón de cerrar */}
                        <div className="absolute top-3 left-3 right-3 z-30 flex justify-between items-center pointer-events-none">
                          <span className="px-3 py-1 bg-slate-950/85 backdrop-blur-md text-amber-400 font-bold text-xs rounded-full border border-amber-500/30 shadow-lg pointer-events-auto select-none">
                            {cardIndex + 1} / {STYLE_GALLERY.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedGalleryIndex(null)}
                            className="p-2.5 rounded-full bg-slate-950/85 text-slate-300 hover:text-white border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
                            title="Cerrar carrusel"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* Foto Ampliada */}
                        <div className="relative w-full h-[270px] sm:h-[400px] bg-slate-950 flex-shrink-0 overflow-hidden select-none">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover pointer-events-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/20 pointer-events-none"></div>
                        </div>

                        {/* Contenido / Detalles del Estilo */}
                        <div className="p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0">
                          <div>
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
                                {item.title}
                              </h3>
                              {item.price && (
                                <span className="text-base sm:text-lg font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex-shrink-0">
                                  {item.price}
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Botón de agendar */}
                          <div className="pt-2 border-t border-white/10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGalleryIndex(null);
                                handleOpenBooking(BOOKING_URL);
                              }}
                              className="w-full py-3 sm:py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider text-center transition-all shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Calendar size={18} />
                              <span>Agendar Cita</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
      })()}

      {/* DESKTOP GIFT BUTTON (Bottom Left) */}
      <button 
          onClick={() => triggerChatAction('¡Hola! Vi el regalo en el menú y quiero saber de qué se trata.')}
          className="hidden md:flex fixed bottom-10 left-10 z-50 w-16 h-16 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full items-center justify-center shadow-2xl border-2 border-white/20 hover:scale-110 transition-transform duration-300 group hover:shadow-[0_0_30px_rgba(244,63,94,0.6)]"
      >
          <Gift size={32} className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-white"></span>
          </span>
      </button>

      {/* MOBILE FLOATING WHATSAPP BUTTON (Bottom Left above Dock) - Icon Only */}
      <button 
          onClick={handleWhatsAppClick}
          className="md:hidden fixed bottom-20 left-3.5 z-40 w-11 h-11 flex items-center justify-center bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 backdrop-blur-md active:scale-95 transition-all duration-300 p-2"
          title="Contactar por WhatsApp"
          aria-label="Contactar por WhatsApp"
      >
          <div className="relative flex items-center justify-center w-full h-full">
            <img 
              src="https://global-files-nginx.builderall.com/0e184df7-813a-4af4-89e6-7f8094a855e1/e69e5daab694041319b4628a595c67f3b23b1f1dee4abfc7a8f17d80705f33f4.webp"
              alt="WhatsApp"
              className="w-full h-full object-contain drop-shadow-md"
            />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300 border border-emerald-700"></span>
            </span>
          </div>
      </button>

      <Dock activeSection={activeSection} onNavigate={scrollToSection} />
      <ChatWidget activeSection={activeSection} />

      {/* Booking Modal (Agenda en vivo) */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        bookingUrl={bookingModalUrl} 
      />
    </div>
  );
};

export default App;
