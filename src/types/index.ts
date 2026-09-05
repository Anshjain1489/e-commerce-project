export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: 'Kurta Pajama' | 'Jacket Set' | 'Indo Western' | 'Open Jodhpuri' | 'Shirts' | string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  fabric: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
  createdAt?: string;
}

export interface CartItem {
  id?: string;
  product: Product;
  selectedSize: string;
  size?: string;
  selectedColor: { name: string; hex: string };
  color?: { name: string; hex: string };
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
  country?: string;
  isDefault?: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | string;
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Cash on Delivery' | string;
export type PaymentMethod = 'Online (Razorpay)' | 'Cash on Delivery' | string;

export interface OrderItem {
  id?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  size: string;
  color: any;
  quantity: number;
  price?: number;
  product?: any;
}

export interface DeliveryExecutive {
  id?: string;
  name: string;
  phone: string;
  vehicleNumber?: string;
  agency?: string;
  activeOrdersCount?: number;
}

export interface ProofOfDelivery {
  receiverName: string;
  relation: 'Self' | 'Family Member' | 'Neighbor' | 'Reception' | 'Other';
  deliveredAt: string;
  otpVerified?: boolean;
  notes?: string;
}

export interface Order {
  id?: string;
  orderId?: string;
  userId?: string;
  customerName: string;
  email?: string;
  customerEmail?: string;
  phone?: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  products?: OrderItem[];
  items?: any[];
  subtotal: number;
  shippingCharge?: number;
  shipping?: number;
  discount: number;
  couponCode?: string;
  totalAmount?: number;
  total?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  orderStatus?: OrderStatus;
  status?: any;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  courier?: string;
  trackingNumber?: string;
  trackingId?: string;
  carrierStatus?: CarrierTrackingData;
  adminNotes?: string;
  estimatedDelivery?: string;
  dispatchDate?: string;
  deliveryExecutive?: DeliveryExecutive;
  deliveredAt?: string;
  pod?: ProofOfDelivery;
  packageWeightKg?: number;
  originHub?: string;
  deliveryNotes?: string;
  rescheduledReason?: string;
  notifications?: OrderNotification[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  customerName: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: 'email' | 'sms' | 'both';
  status: OrderStatus;
  title: string;
  message: string;
  smsContent: string;
  emailSubject: string;
  emailHtml?: string;
  deliveryStatus: 'Delivered' | 'Sent' | 'Failed';
  sentAt: string;
  trackingNumber?: string;
  courier?: string;
}

export interface CarrierCheckpoint {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  completed: boolean;
  stage: number;
}

export interface CarrierTrackingData {
  trackingId: string;
  trackingNumber: string;
  carrier: string;
  carrierCode: string;
  carrierLogo?: string;
  serviceType: string;
  status: string;
  statusCategory: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  currentLocation: string;
  originCity: string;
  destinationCity: string;
  destinationPincode?: string;
  estimatedDelivery: string;
  lastUpdated: string;
  checkpoints: CarrierCheckpoint[];
  deliveryAssociate?: DeliveryExecutive;
  pod?: ProofOfDelivery;
  trackingUrl?: string;
  isLive: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  address?: ShippingAddress;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  city: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  avatarUrl?: string;
  fitFeedback?: 'Runs Small' | 'True to Size' | 'Runs Large';
  helpfulCount?: number;
  orderId?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercent: number;
  discountPercentage?: number;
  discountType?: 'percent' | 'flat';
  discountAmount?: number;
  minOrderValue: number;
  minPurchaseAmount?: number;
  maxDiscount?: number;
  description?: string;
  expiresAt?: string;
  isActive: boolean;
  tag?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactPerson: string;
  phone: string;
  whatsAppNumber: string;
  whatsAppLink: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instagramUrl: string;
  facebookUrl: string;
  googleMapsEmbedUrl: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  // Automated Notification Settings
  autoEmailOnStatusUpdate?: boolean;
  autoSmsOnStatusUpdate?: boolean;
  smsSenderId?: string;
  webhookUrl?: string;
  notifyOnConfirmed?: boolean;
  notifyOnProcessing?: boolean;
  notifyOnShipped?: boolean;
  notifyOnDelivered?: boolean;
  notifyOnCancelled?: boolean;
}
