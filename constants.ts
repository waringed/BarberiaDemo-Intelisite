
import { ServiceItem, ReviewItem, TeamMember, SocialLink, ProductItem } from './types';

// --- CONFIGURACIÓN DE RESERVAS ---
// Enlace general (usado también para Jay Cruz)
export const BOOKING_URL = "https://booking.builderall.com/embed/067d9e4d8e52fc90372e8da99eb78a54?show_event_infos=true"; 

// Enlace directo a WhatsApp (Formato internacional sin +)
export const WHATSAPP_DIRECT_URL = "https://wa.me/525512345678"; 

// URL para escribir reseña en Google Maps (Enlace Directo de Mercamoción)
export const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJYxySPAQb0oUR-7aMHACq2JU";

// URL DEL REGALO (PDF DEMO)
export const PDF_DOWNLOAD_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

// URL DEL BLOG (MERCAMOCION)
export const BLOG_URL = "https://mercamocion.com";

// Enlaces específicos por barbero
export const ALEX_BOOKING_URL = "https://booking.builderall.com/c/mercamocion/demositiointeligente/j5AaK9j5";
export const MARCO_BOOKING_URL = "https://booking.builderall.com/c/mercamocion/demositiointeligente/9NvZ4BbN";
export const JAY_BOOKING_URL = "https://booking.builderall.com/c/mercamocion/demositiointeligente";

export const SERVICES: ServiceItem[] = [
  {
    id: 1,
    title: 'Corte Executive',
    price: '$350',
    iconName: 'scissors',
    description: 'Asesoría de imagen, corte de precisión, lavado y peinado con productos premium.',
    duration: '45 minutos',
    includes: ['Diagnóstico capilar', 'Lavado tonificante', 'Corte de tijera/máquina', 'Peinado con Cera Mate'],
    idealFor: 'Profesionales que buscan elegancia y pulcritud diaria.',
    recommendedFrequency: 'Cada 3 semanas'
  },
  {
    id: 2,
    title: 'Ritual de Barba',
    price: '$250',
    iconName: 'user',
    description: 'Toalla caliente, aceites esenciales, perfilado con navaja y bálsamo hidratante.',
    duration: '30 minutos',
    includes: ['Vapor de toalla caliente', 'Aceite orgánico hidratante', 'Perfilado navaja tradicional', 'Bálsamo mentolado'],
    idealFor: 'Barbas medianas o largas que requieren forma.',
    recommendedFrequency: 'Cada 2 semanas'
  },
  {
    id: 3,
    title: 'The Gentleman',
    price: '$550',
    iconName: 'star',
    description: 'Servicio completo: Corte + Ritual de Barba + Masaje capilar + Bebida de cortesía.',
    duration: '75 minutos',
    includes: ['Corte Executive completo', 'Ritual de Barba con toalla', 'Masaje relajante de cabeza', 'Bebida premium gratis'],
    idealFor: 'Experiencia de relajación total y makeover completo.',
    recommendedFrequency: 'Mensual'
  },
  {
    id: 4,
    title: 'Camuflaje de Canas',
    price: '$400',
    iconName: 'smile',
    description: 'Matización sutil para un look rejuvenecido y natural en cabello o barba.',
    duration: '40 minutos',
    includes: ['Tono personalizado sin amoniaco', 'Aplicación rápida', 'Shampoo fijador de color', 'Acabado 100% natural'],
    idealFor: 'Disimular canas sin efecto de tinte artificial.',
    recommendedFrequency: 'Cada 4 semanas'
  }
];

export const PRODUCTS: ProductItem[] = [
  {
    id: 1,
    title: 'Cera Mate Elite',
    price: '$280',
    image: 'https://images.unsplash.com/photo-1542818279-04aa19d54f06?q=80&w=3538&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Fijación fuerte con acabado natural. Ideal para estilos texturizados y crops.',
    whatsappMessage: 'Hola, me interesa comprar la Cera Mate Elite de $280.',
    volume: '100g',
    benefits: [
      'Fijación alta con acabado 100% mate',
      'Removible fácilmente solo con agua',
      'Aporta textura sin apelmazar el cabello',
      'Fragancia sutil a bergamota y maderas'
    ],
    usage: 'Aplica una pequeña cantidad en las palmas, frota suavemente y distribuye sobre cabello seco o húmedo.'
  },
  {
    id: 2,
    title: 'Aceite Barba Real',
    price: '$250',
    image: 'https://images.unsplash.com/photo-1627875777089-d32f1127e9ff?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Hidratación profunda con aroma a madera y sándalo. Elimina la picazón.',
    whatsappMessage: 'Hola, quiero reservar el Aceite para Barba de $250.',
    volume: '50ml',
    benefits: [
      'Nutrición intensiva para piel y vello',
      'Mezcla de aceites orgánicos premium',
      'Elimina la resequedad y picazón',
      'Aroma distinguido a sándalo y maderas'
    ],
    usage: 'Aplica de 3 a 5 gotas en las palmas, frota y masajea desde la raíz del vello hacia las puntas.'
  },
  {
    id: 3,
    title: 'Shampoo Mentol',
    price: '$220',
    image: 'https://images.unsplash.com/photo-1707910393331-0145331bc039?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Limpieza profunda que estimula el cuero cabelludo. Sensación extra fresca.',
    whatsappMessage: 'Hola, me interesa el Shampoo de Mentol de $220.',
    volume: '250ml',
    benefits: [
      'Efecto refrescante de mentol helado',
      'Estimula el cuero cabelludo y folículos',
      'Remueve residuos de ceras y pomadas',
      'Fórmula equilibrada para uso diario'
    ],
    usage: 'Aplica sobre cabello mojado, masajea suavemente durante 1 minuto para activar el efecto y enjuaga.'
  }
];

export const STYLE_GALLERY: StyleGalleryItem[] = [
  {
    id: 's1',
    title: 'Degradado Medio',
    price: '$350',
    image: 'https://plus.unsplash.com/premium_photo-1661645788141-8196a45fb483?q=80&w=800&auto=format&fit=crop',
    prompt: 'Me interesa el estilo Degradado Medio',
    description: 'Transición suave desde la piel a la altura media del cráneo. Limpio, versátil e impecable.',
    faceShape: 'Ovalado, Cuadrado o Rectangular',
    hairType: 'Todo tipo de cabello (Liso, Ondulado)',
    maintenance: 'Cada 2 semanas',
    recommendedProduct: 'Cera Mate Elite'
  },
  {
    id: 's2',
    title: 'Tupé Clásico Pompadour',
    price: '$380',
    image: 'https://plus.unsplash.com/premium_photo-1661288502656-7265af3e6b23?q=80&w=800&auto=format&fit=crop',
    prompt: 'Cuéntame sobre el estilo Tupé Clásico o Pompadour',
    description: 'Peinado con volumen superior peinado hacia atrás. Un icono de elegancia clásica y distinción.',
    faceShape: 'Rostro Ovalado o Redondo',
    hairType: 'Cabello Liso o Ligeramente Ondulado',
    maintenance: 'Cada 3 semanas',
    recommendedProduct: 'Pomada Brillo Fuerte'
  },
  {
    id: 's3',
    title: 'Crop Texturizado',
    price: '$350',
    image: 'https://images.unsplash.com/photo-1760641371942-e3d39565ac67?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    prompt: '¿Cómo es el corte Crop Texturizado?',
    description: 'Flequillo recto con capas superiores desordenadas. Moderno, urbano y fácil de peinar.',
    faceShape: 'Rostro Alargado, Ovalado o Diamante',
    hairType: 'Ideal para cabello Liso o Texturizado',
    maintenance: 'Cada 2-3 semanas',
    recommendedProduct: 'Polvo de Volúmen & Cera Mate'
  },
  {
    id: 's4',
    title: 'Mullet Moderno',
    price: '$350',
    image: 'https://plus.unsplash.com/premium_photo-1742445188769-86d419595529?q=80&w=800&auto=format&fit=crop',
    prompt: 'Quiero información sobre el estilo Mullet Moderno',
    description: 'Corto a los lados y frente, con longitud extendida en la nuca. Rebelde, audaz y en tendencia.',
    faceShape: 'Rostro Cuadrado u Ovalado',
    hairType: 'Ondulado o Riado con textura',
    maintenance: 'Cada 4 semanas',
    recommendedProduct: 'Spray de Sal Marina'
  },
  {
    id: 's5',
    title: 'Rapado Geométrico',
    price: '$280',
    image: 'https://images.unsplash.com/photo-1602641902219-622a1b9a257a?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    prompt: 'Háblame del Rapado Geométrico',
    description: 'Líneas super marcadas con máquina y navaja. Máxima definición para un aspecto sobrio.',
    faceShape: 'Rostro Cuadrado o Definido',
    hairType: 'Cabello Corto o Rapado',
    maintenance: 'Cada 10 a 14 días',
    recommendedProduct: 'Bálsamo Post-Afeitado'
  },
  {
    id: 's6',
    title: 'Rizos con Taper Fade',
    price: '$350',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6J5TjekoNzEVuwvxDvW58w-MCJRAQSOr-Dg&s',
    prompt: 'Cuéntame sobre el estilo para Rizos con Taper',
    description: 'Mantén la textura rizada natural arriba mientras desvaneces sutilmente patillas y nuca.',
    faceShape: 'Rostro Redondo o Triangulado',
    hairType: 'Cabello Rizado, Afrikano u Ondulado',
    maintenance: 'Cada 2-3 semanas',
    recommendedProduct: 'Crema Activadora de Rizos'
  },
  {
    id: 's7',
    title: 'Barba Vikinga',
    price: '$250',
    image: 'https://plus.unsplash.com/premium_photo-1658506708205-6621fa6a7f25?q=80&w=800&auto=format&fit=crop',
    prompt: 'Quiero saber más sobre la Barba Vikinga',
    description: 'Barba poblada y tupida con corte en punta y perfilado pulcro en mejillas.',
    faceShape: 'Rostro Ovalado, Redondo o Rectangular',
    hairType: 'Vello facial denso',
    maintenance: 'Perfilado cada 2 semanas',
    recommendedProduct: 'Aceite Barba Real & Cepillo Cerda'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Alex "The Razor"',
    role: 'Maestro Barbero',
    specialty: 'Navaja Libre & Fades',
    image: 'https://plus.unsplash.com/premium_photo-1671741519429-c0465c1b5c12?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bookingUrl: ALEX_BOOKING_URL 
  },
  {
    id: 2,
    name: 'Don Marco',
    role: 'Estilista Senior',
    specialty: 'Cortes Clásicos & Tijera',
    image: 'https://images.unsplash.com/photo-1582893561942-d61adcb2e534?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D',
    bookingUrl: MARCO_BOOKING_URL 
  },
  {
    id: 3,
    name: 'Jay Cruz',
    role: 'Barbero y Colorista',
    specialty: 'Diseño Urbano & Color',
    image: 'https://images.unsplash.com/photo-1635273051937-a0ddef9573b6?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bookingUrl: JAY_BOOKING_URL 
  }
];

export const REVIEWS: ReviewItem[] = [
  {
    id: 1,
    name: 'Javier R.',
    rating: 5,
    comment: 'El mejor fade que me han hecho en años. El ambiente es increíble y la cerveza fría se agradece.'
  },
  {
    id: 2,
    name: 'Miguel Ángel T.',
    rating: 5,
    comment: 'Excelente atención. Reservé por aquí y al llegar ya tenían todo listo. Muy profesionales.'
  },
  {
    id: 3,
    name: 'Roberto D.',
    rating: 4,
    comment: 'Gran experiencia de barbería clásica. La IA me ayudó a elegir el estilo de barba perfecto.'
  }
];

export const SOCIAL_LINKS: SocialLink[] = [
    { name: 'Instagram', url: 'https://www.instagram.com', iconName: 'instagram' },
    { name: 'Facebook', url: 'https://www.facebook.com', iconName: 'facebook' },
    { name: 'TikTok', url: 'https://www.tiktok.com', iconName: 'video' },
    { name: 'WhatsApp', url: WHATSAPP_DIRECT_URL, iconName: 'message-circle' },
    { name: 'Maps', url: 'https://maps.google.com', iconName: 'map-pin' },
    { name: 'Mobile', url: '#', iconName: 'smartphone' }, // Nuevo enlace para Mobile Share
].map(link => ({
    ...link,
    // Add default color classes based on network
    color: link.name === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' :
           link.name === 'Facebook' ? 'bg-blue-600' :
           link.name === 'TikTok' ? 'bg-black' :
           link.name === 'WhatsApp' ? 'bg-green-500' : 
           link.name === 'Maps' ? 'bg-red-500' : 'bg-slate-700'
}));
