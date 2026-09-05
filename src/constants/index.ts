import { Category, StoreSettings } from '../types';

export const BRAND = {
  name: 'MAJANYA JI',
  subtitle: "MEN'S ETHNIC WEAR",
  fullName: "MAJANYA JI MEN'S ETHNIC WEAR",
  tagline: "Celebrate Every Tradition in Style — Exclusively Men's Ethnic Wear",
  contactPerson: 'Siddhant Jain',
  supportEmail: 'anshjain1440@gmail.com',
  phone: '+91 7067299101',
  phoneClean: '7067299101',
  phoneLink: 'tel:+917067299101',
  whatsApp: '+91 7007457920',
  whatsAppNumber: '+91 7007457920',
  whatsAppClean: '917007457920',
  whatsAppLink: 'https://wa.me/917007457920',
  defaultWhatsAppMessage: "Hello Majanya Ji Men's Ethnic Wear! I need help with your products.",
  address: {
    line1: '323, Palhar Nagar',
    line2: '60 Feet Road',
    street: '323, Palhar Nagar, 60 Feet Road',
    locality: 'Palhar Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452006',
    country: 'India',
    full: '323, Palhar Nagar, 60 Feet Road, Indore, Madhya Pradesh, India',
  },
  timings: 'Monday - Sunday: 10:30 AM - 9:30 PM',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "MAJANYA JI MEN'S ETHNIC WEAR",
  tagline: "Celebrate Every Tradition in Style — Exclusively Men's Ethnic Wear",
  contactPerson: 'Siddhant Jain',
  phone: '+91 7067299101',
  whatsAppNumber: '+91 7007457920',
  whatsAppLink: 'https://wa.me/917007457920',
  address: '323, Palhar Nagar, 60 Feet Road',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '452002',
  instagramUrl: 'https://instagram.com/majanyaji_ethnicwear',
  facebookUrl: 'https://facebook.com/majanyaji',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117763.5513908861!2d75.7937402!3d22.7241076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sPalhar%20Nagar%2C%20Indore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  freeShippingThreshold: 4999,
  standardShippingFee: 249,
  autoEmailOnStatusUpdate: true,
  autoSmsOnStatusUpdate: true,
  smsSenderId: 'MJNYAJI',
  webhookUrl: '',
  notifyOnConfirmed: true,
  notifyOnProcessing: true,
  notifyOnShipped: true,
  notifyOnDelivered: true,
  notifyOnCancelled: true,
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'kurta-pajama',
    name: 'Kurta Pajama',
    slug: 'kurta-pajama',
    description: 'Classic elegance for every celebration, weddings, festivals and traditional ceremonies.',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=1200&auto=format&fit=crop',
    itemCount: 4,
  },
  {
    id: 'jacket-set',
    name: 'Jacket Set',
    slug: 'jacket-set',
    description: 'Layered luxury with a modern touch, featuring hand-embroidered Nehru jackets and coordinated ensembles.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop',
    itemCount: 4,
  },
  {
    id: 'indo-western',
    name: 'Indo Western',
    slug: 'indo-western',
    description: 'Traditional roots paired with contemporary silhouettes for cocktail nights, receptions and sangeet.',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1200&auto=format&fit=crop',
    itemCount: 4,
  },
  {
    id: 'open-jodhpuri',
    name: 'Open Jodhpuri',
    slug: 'open-jodhpuri',
    description: 'Royal style crafted for special moments, boasting regal cuts, intricate zardozi and bandhgala finesse.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    itemCount: 4,
  },
  {
    id: 'shirts',
    name: 'Shirts',
    slug: 'shirts',
    description: 'Bespoke festive, casual & ceremonial shirts tailored in pure European linen, Banarasi silk, and handcrafted chikankari.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
    itemCount: 4,
  },
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const AVAILABLE_COLORS = [
  { name: 'Royal Blue', hex: '#1E3A8A' },
  { name: 'Classic Ivory', hex: '#FAF7F2' },
  { name: 'Deep Maroon', hex: '#5A1A1A' },
  { name: 'Imperial Gold', hex: '#C9A227' },
  { name: 'Midnight Black', hex: '#1A1A1A' },
  { name: 'Emerald Green', hex: '#064E3B' },
  { name: 'Dusty Rose', hex: '#BE185D' },
];

export const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'bestseller' },
  { label: 'Top Rated', value: 'rating' },
];
