
export enum SectionId {
  HERO = 'hero',
  SERVICES = 'services',
  GALLERY = 'gallery',
  PRODUCTS = 'products', // Nueva sección
  TEAM = 'team',
  LOCATION = 'location',
  REVIEWS = 'reviews',
  PROMOS = 'promos',
  CONTACT = 'contact',
  SOCIAL = 'social',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isContextTrigger?: boolean;
}

export interface ServiceItem {
  id: number;
  title: string;
  price: string;
  iconName: string;
  description: string;
  duration?: string;
  includes?: string[];
  idealFor?: string;
  recommendedFrequency?: string;
}

export interface StyleGalleryItem {
  id: string;
  title: string;
  image: string;
  prompt: string;
  price?: string;
  description?: string;
  faceShape?: string;
  hairType?: string;
  maintenance?: string;
  recommendedProduct?: string;
}

export interface ProductItem {
  id: number;
  title: string;
  price: string;
  image: string;
  description: string;
  whatsappMessage: string;
  volume?: string;
  benefits?: string[];
  usage?: string;
}

export interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  specialty: string;
  bookingUrl: string; // Nuevo campo para enlace individual
}

export interface SocialLink {
  name: string;
  url: string;
  iconName: string;
  color?: string;
}
