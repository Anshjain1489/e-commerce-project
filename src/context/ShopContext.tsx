import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  Review,
  Coupon,
  ContactMessage,
  StoreSettings,
  OrderStatus,
  PaymentStatus,
  OrderNotification,
  DeliveryExecutive,
  ProofOfDelivery,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
} from '../data/mockProducts';
import { INITIAL_CATEGORIES, DEFAULT_STORE_SETTINGS } from '../constants';
import { useToast } from './ToastContext';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import {
  dispatchOrderNotification,
  buildOrderStatusNotification,
} from '../utils/notificationSystem';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  contactMessages: ContactMessage[];
  inquiries: ContactMessage[];
  newsletterSubscribers: { email: string; date: string }[];
  newsletters: { id: string; email: string; subscribedAt: string }[];
  settings: StoreSettings;
  notificationsLog: OrderNotification[];
  
  // Product Operations
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkRestockProducts: (productIds: string[], delta: number) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;

  // Category Operations
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Order Operations
  createOrder: (orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, courier?: string, estimatedDelivery?: string) => void;
  updateOrderNotes: (orderId: string, adminNotes: string) => void;
  bulkUpdateOrderStatus: (orderIds: string[], status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];

  // Review Operations
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  deleteReview: (id: string) => void;
  voteHelpfulReview: (id: string) => void;

  // Coupon Operations
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  validateCoupon: (code: string, currentTotal: number) => { valid: boolean; discountPercent: number; message: string };

  // Contact & Newsletter
  addContactMessage: (msg: { name: string; phone: string; email: string; message: string }) => void;
  markMessageAsRead: (id: string) => void;
  subscribeNewsletter: (email: string) => boolean;

  // Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToDefaults: () => void;

  // Automated Notification Operations
  sendCustomOrderNotification: (
    orderId: string,
    channel?: 'email' | 'sms' | 'both',
    customNotes?: string,
    overrideStatus?: OrderStatus
  ) => Promise<boolean>;
  clearNotificationsLog: () => void;

  // Delivery Operations
  dispatchOrderShipment: (
    orderId: string,
    details: {
      courier: string;
      trackingNumber: string;
      estimatedDelivery: string;
      dispatchDate?: string;
      originHub?: string;
      deliveryExecutive?: DeliveryExecutive;
      packageWeightKg?: number;
      deliveryNotes?: string;
      suppressAlert?: boolean;
    }
  ) => Promise<void>;
  markOrderOutForDelivery: (
    orderId: string,
    deliveryExecutive?: DeliveryExecutive,
    notes?: string
  ) => Promise<void>;
  recordOrderDelivered: (
    orderId: string,
    pod: ProofOfDelivery
  ) => Promise<void>;
  rescheduleOrderDelivery: (
    orderId: string,
    reason: string
  ) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'majanyaji_products_v2',
  CATEGORIES: 'majanyaji_categories_v2',
  ORDERS: 'majanyaji_orders_v2',
  REVIEWS: 'majanyaji_reviews_v2',
  COUPONS: 'majanyaji_coupons_v2',
  MESSAGES: 'majanyaji_messages_v2',
  SUBSCRIBERS: 'majanyaji_subscribers_v2',
  SETTINGS: 'majanyaji_settings_v2',
  NOTIFICATIONS: 'majanyaji_notifications_v2',
};

const SAMPLE_ORDERS: Order[] = [
  {
    orderId: 'ORD-92841',
    userId: 'customer-aman',
    customerName: 'Aman Singhal',
    email: 'aman.singhal@example.com',
    phone: '+91 9826012345',
    shippingAddress: {
      fullName: 'Aman Singhal',
      phone: '+91 9826012345',
      email: 'aman.singhal@example.com',
      address: 'Flat 402, Royal Residency, Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
    },
    products: [
      {
        productId: 'nb-1',
        productName: 'Heritage Silk Nehru Jacket & Kurta Set',
        productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
        size: 'L',
        color: 'Ruby Maroon',
        quantity: 1,
        price: 8499,
      },
    ],
    subtotal: 8499,
    shippingCharge: 0,
    discount: 500,
    totalAmount: 7999,
    paymentMethod: 'Online (Razorpay)',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    status: 'shipped',
    courier: 'Blue Dart Express',
    trackingId: 'BLUEDART-92841IN',
    trackingNumber: 'BLUEDART-92841IN',
    razorpayOrderId: 'order_Rx9123019',
    razorpayPaymentId: 'pay_Mkd918231',
    estimatedDelivery: '2 Business Days',
    createdAt: '2026-09-01T10:15:00.000Z',
    updatedAt: '2026-09-02T16:45:00.000Z',
  },
  {
    orderId: 'ORD-73105',
    userId: 'customer-aman',
    customerName: 'Aman Singhal',
    email: 'aman.singhal@example.com',
    phone: '+91 9826012345',
    shippingAddress: {
      fullName: 'Aman Singhal',
      phone: '+91 9826012345',
      email: 'aman.singhal@example.com',
      address: 'Flat 402, Royal Residency, Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
    },
    products: [
      {
        productId: 'js-1',
        productName: 'Royal Embroidered Jacket Set',
        productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
        size: 'XL',
        color: 'Imperial Gold',
        quantity: 1,
        price: 7999,
      },
    ],
    subtotal: 7999,
    shippingCharge: 0,
    discount: 0,
    totalAmount: 7999,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Cash on Delivery',
    orderStatus: 'Out for Delivery',
    status: 'out for delivery',
    courier: 'Blue Dart Express',
    trackingId: 'BLUEDART-73105IN',
    trackingNumber: 'BLUEDART-73105IN',
    estimatedDelivery: 'Arriving Today',
    createdAt: '2026-09-02T11:20:00.000Z',
    updatedAt: '2026-09-04T08:30:00.000Z',
  },
  {
    orderId: 'ORD-58402',
    userId: 'customer-aman',
    customerName: 'Aman Singhal',
    email: 'aman.singhal@example.com',
    phone: '+91 9826012345',
    shippingAddress: {
      fullName: 'Aman Singhal',
      phone: '+91 9826012345',
      email: 'aman.singhal@example.com',
      address: 'Flat 402, Royal Residency, Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
    },
    products: [
      {
        productId: 'sd-1',
        productName: 'Hand-Pleated Festive Dhoti Set',
        productImage: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=600&auto=format&fit=crop',
        size: 'L',
        color: 'Ivory Cream',
        quantity: 1,
        price: 5499,
      },
    ],
    subtotal: 5499,
    shippingCharge: 0,
    discount: 500,
    totalAmount: 4999,
    paymentMethod: 'Online (Razorpay)',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    status: 'processing',
    courier: 'Blue Dart Express',
    trackingId: 'BLUEDART-58402IN',
    trackingNumber: 'BLUEDART-58402IN',
    estimatedDelivery: '3 Business Days',
    createdAt: '2026-09-03T14:00:00.000Z',
    updatedAt: '2026-09-03T15:30:00.000Z',
  },
  {
    orderId: 'ORD-61208',
    userId: 'customer-aman',
    customerName: 'Aman Singhal',
    email: 'aman.singhal@example.com',
    phone: '+91 9826012345',
    shippingAddress: {
      fullName: 'Aman Singhal',
      phone: '+91 9826012345',
      email: 'aman.singhal@example.com',
      address: 'Flat 402, Royal Residency, Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
    },
    products: [
      {
        productId: 'kp-1',
        productName: 'Royal Blue Embroidered Kurta Pajama',
        productImage: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=600&auto=format&fit=crop',
        size: 'L',
        color: 'Royal Blue',
        quantity: 1,
        price: 4999,
      },
    ],
    subtotal: 4999,
    shippingCharge: 0,
    discount: 500,
    totalAmount: 4499,
    paymentMethod: 'Online (Razorpay)',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    status: 'delivered',
    courier: 'Blue Dart Express',
    trackingId: 'BLUEDART-61208IN',
    trackingNumber: 'BLUEDART-61208IN',
    razorpayOrderId: 'order_Nx8294710',
    razorpayPaymentId: 'pay_Kld938210',
    estimatedDelivery: 'Delivered',
    createdAt: '2026-08-25T14:32:00.000Z',
    updatedAt: '2026-08-28T15:10:00.000Z',
  },
];

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!saved) return INITIAL_PRODUCTS;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any newly introduced catalog products (e.g. shirts) if absent
        const existingIds = new Set(parsed.map((p: Product) => p.id));
        const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!saved) return INITIAL_CATEGORIES;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any newly introduced categories (e.g. shirts) if absent
        const existingIds = new Set(parsed.map((c: Category) => c.id || c.slug));
        const missing = INITIAL_CATEGORIES.filter(
          (c) => !existingIds.has(c.id) && !existingIds.has(c.slug)
        );
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!saved) return SAMPLE_ORDERS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : SAMPLE_ORDERS;
    } catch {
      return SAMPLE_ORDERS;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (!saved) return INITIAL_REVIEWS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (!saved) return INITIAL_COUPONS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!saved) {
        return [
          {
            id: 'msg-1',
            name: 'Pooja Verma',
            phone: '+91 9827011223',
            email: 'pooja.verma@example.com',
            message: 'Inquiring about bulk groomsmen matching kurta sets for December wedding.',
            createdAt: '2026-09-02T16:45:00.000Z',
            isRead: false,
          },
        ];
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed
        : [
            {
              id: 'msg-1',
              name: 'Pooja Verma',
              phone: '+91 9827011223',
              email: 'pooja.verma@example.com',
              message: 'Inquiring about bulk groomsmen matching kurta sets for December wedding.',
              createdAt: '2026-09-02T16:45:00.000Z',
              isRead: false,
            },
          ];
    } catch {
      return [
        {
          id: 'msg-1',
          name: 'Pooja Verma',
          phone: '+91 9827011223',
          email: 'pooja.verma@example.com',
          message: 'Inquiring about bulk groomsmen matching kurta sets for December wedding.',
          createdAt: '2026-09-02T16:45:00.000Z',
          isRead: false,
        },
      ];
    }
  });

  const [newsletterSubscribers, setNewsletterSubscribers] = useState<{ email: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      if (!saved) return [{ email: 'fashion.lover@gmail.com', date: '2026-08-28' }];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [{ email: 'fashion.lover@gmail.com', date: '2026-08-28' }];
    } catch {
      return [{ email: 'fashion.lover@gmail.com', date: '2026-08-28' }];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!saved) return DEFAULT_STORE_SETTINGS;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? { ...DEFAULT_STORE_SETTINGS, ...parsed } : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const [notificationsLog, setNotificationsLog] = useState<OrderNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!saved) {
        // Seed initial notifications for sample orders
        const initialList: OrderNotification[] = [];
        SAMPLE_ORDERS.forEach((o) => {
          if (o.orderStatus) {
            initialList.push(buildOrderStatusNotification(o, o.orderStatus));
          }
        });
        return initialList;
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(newsletterSubscribers));
  }, [newsletterSubscribers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsLog));
  }, [notificationsLog]);

  // Product Methods
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const id = 'prod-' + Date.now();
    const newProduct: Product = {
      ...productData,
      id,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" created successfully.`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted.', 'info');
  };

  const bulkRestockProducts = (productIds: string[], delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        productIds.includes(p.id)
          ? { ...p, stock: Math.max(0, p.stock + delta), updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast(`Inventory replenished (+${delta}) for ${productIds.length} garments.`, 'success');
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Category Methods
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const id = catData.slug || 'cat-' + Date.now();
    const newCategory: Category = { ...catData, id };
    setCategories((prev) => [...prev, newCategory]);
    showToast(`Category "${newCategory.name}" added.`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Category updated.', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category removed.', 'info');
  };

  // Order Methods
  const createOrder = (orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${randomNum}`;
    const generatedTracking = `BLUEDART-${randomNum}IN`;
    const now = new Date().toISOString();
    const tempOrder: Order = {
      ...orderData,
      orderId,
      trackingId: orderData.trackingId || orderData.trackingNumber || generatedTracking,
      trackingNumber: orderData.trackingNumber || orderData.trackingId || generatedTracking,
      courier: orderData.courier || 'Blue Dart Express',
      estimatedDelivery: '3 - 5 Business Days',
      createdAt: now,
      updatedAt: now,
    };

    // Auto-generate initial Order Confirmation Alert (Email & SMS)
    const initialNotif = buildOrderStatusNotification(tempOrder, 'Confirmed');
    const newOrder: Order = {
      ...tempOrder,
      notifications: [initialNotif],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setNotificationsLog((prev) => [initialNotif, ...prev]);

    // Asynchronously dispatch automated order confirmation email
    dispatchOrderNotification(newOrder, 'Confirmed', settings).catch((err) => {
      console.warn('Initial order confirmation email trigger error:', err);
    });

    // Sync order to Firestore so Cloud Functions onOrderCreated trigger fires
    if (db) {
      try {
        setDoc(doc(db, 'orders', orderId), {
          ...newOrder,
          emailConfirmationSent: true,
          emailConfirmationSentAt: now,
        }, { merge: true }).catch(() => {});
      } catch {
        // Safe fallback in offline mode
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    options?: { customNotes?: string; overrideChannel?: 'email' | 'sms' | 'both'; suppressAlert?: boolean }
  ) => {
    const targetOrder = orders.find((o) => o.orderId === orderId || o.id === orderId);
    let newNotif: OrderNotification | null = null;

    if (targetOrder && !options?.suppressAlert) {
      try {
        const res = await dispatchOrderNotification(targetOrder, status, settings, {
          customNotes: options?.customNotes,
          overrideChannel: options?.overrideChannel,
        });
        newNotif = res.notification;
      } catch (err) {
        console.error('Failed to dispatch automated order notification:', err);
      }
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId || o.id === orderId) {
          const prevNotifs = Array.isArray(o.notifications) ? o.notifications : [];
          const updatedNotifs = newNotif ? [newNotif, ...prevNotifs] : prevNotifs;
          return {
            ...o,
            orderStatus: status,
            status: status.toLowerCase(),
            notifications: updatedNotifs,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (newNotif) {
      setNotificationsLog((prev) => [newNotif!, ...prev]);
      const recipientContact =
        targetOrder?.shippingAddress?.phone ||
        targetOrder?.customerPhone ||
        targetOrder?.customerEmail ||
        'customer';
      showToast(
        `Order #${orderId} set to ${status}. Automated ✉️ Email & 📱 SMS alert sent to ${recipientContact}!`,
        'success'
      );
    } else {
      showToast(`Order #${orderId} status updated to ${status}.`, 'success');
    }

    if (db) {
      try {
        setDoc(doc(db, 'orders', orderId), {
          orderStatus: status,
          status: status.toLowerCase(),
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      } catch {
        // Fallback
      }
    }
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, paymentStatus: status, updatedAt: new Date().toISOString() } : o))
    );
    showToast(`Order #${orderId} payment updated to ${status}.`, 'success');
  };

  const updateOrderTracking = (orderId: string, trackingNumber: string, courier?: string, estimatedDelivery?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId || o.id === orderId
          ? {
              ...o,
              trackingNumber,
              courier: courier || o.courier || 'Blue Dart Express',
              estimatedDelivery: estimatedDelivery || o.estimatedDelivery,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );
    showToast(`Tracking updated for #${orderId}.`, 'success');
  };

  const updateOrderNotes = (orderId: string, adminNotes: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId || o.id === orderId
          ? { ...o, adminNotes, updatedAt: new Date().toISOString() }
          : o
      )
    );
    showToast(`Internal notes saved for #${orderId}.`, 'success');
  };

  const dispatchOrderShipment = async (
    orderId: string,
    details: {
      courier: string;
      trackingNumber: string;
      estimatedDelivery: string;
      dispatchDate?: string;
      originHub?: string;
      deliveryExecutive?: DeliveryExecutive;
      packageWeightKg?: number;
      deliveryNotes?: string;
      suppressAlert?: boolean;
    }
  ) => {
    const targetOrder = orders.find((o) => o.orderId === orderId || o.id === orderId);
    let newNotif: OrderNotification | null = null;

    if (targetOrder && !details.suppressAlert) {
      try {
        const orderForAlert: Order = {
          ...targetOrder,
          courier: details.courier,
          trackingNumber: details.trackingNumber,
          estimatedDelivery: details.estimatedDelivery,
          orderStatus: 'Shipped',
        };
        const res = await dispatchOrderNotification(orderForAlert, 'Shipped', settings);
        newNotif = res.notification;
      } catch (err) {
        console.error('Failed to dispatch shipping notification:', err);
      }
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId || o.id === orderId) {
          const prevNotifs = Array.isArray(o.notifications) ? o.notifications : [];
          const updatedNotifs = newNotif ? [newNotif, ...prevNotifs] : prevNotifs;
          return {
            ...o,
            orderStatus: 'Shipped',
            status: 'shipped',
            courier: details.courier,
            trackingNumber: details.trackingNumber,
            estimatedDelivery: details.estimatedDelivery,
            dispatchDate: details.dispatchDate || new Date().toISOString(),
            originHub: details.originHub,
            deliveryExecutive: details.deliveryExecutive,
            packageWeightKg: details.packageWeightKg,
            deliveryNotes: details.deliveryNotes,
            notifications: updatedNotifs,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (newNotif) {
      setNotificationsLog((prev) => [newNotif!, ...prev]);
    }
    showToast(
      `Order #${orderId} manifested & dispatched via ${details.courier}! AWB: ${details.trackingNumber}`,
      'success'
    );

    if (db) {
      try {
        setDoc(doc(db, 'orders', orderId), {
          orderStatus: 'Shipped',
          status: 'shipped',
          courier: details.courier,
          trackingNumber: details.trackingNumber,
          estimatedDelivery: details.estimatedDelivery,
          dispatchDate: details.dispatchDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      } catch {
        // Fallback
      }
    }
  };

  const markOrderOutForDelivery = async (
    orderId: string,
    deliveryExecutive?: DeliveryExecutive,
    notes?: string
  ) => {
    const targetOrder = orders.find((o) => o.orderId === orderId || o.id === orderId);
    let newNotif: OrderNotification | null = null;

    if (targetOrder) {
      try {
        const orderForAlert: Order = {
          ...targetOrder,
          deliveryExecutive: deliveryExecutive || targetOrder.deliveryExecutive,
          orderStatus: 'Out for Delivery',
        };
        const res = await dispatchOrderNotification(orderForAlert, 'Out for Delivery', settings);
        newNotif = res.notification;
      } catch (err) {
        console.error('Failed to dispatch out-for-delivery alert:', err);
      }
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId || o.id === orderId) {
          const prevNotifs = Array.isArray(o.notifications) ? o.notifications : [];
          const updatedNotifs = newNotif ? [newNotif, ...prevNotifs] : prevNotifs;
          return {
            ...o,
            orderStatus: 'Out for Delivery',
            status: 'out for delivery',
            deliveryExecutive: deliveryExecutive || o.deliveryExecutive,
            deliveryNotes: notes || o.deliveryNotes,
            notifications: updatedNotifs,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (newNotif) {
      setNotificationsLog((prev) => [newNotif!, ...prev]);
    }
    showToast(
      `Order #${orderId} marked Out for Delivery today! Customer alerted via SMS & Email.`,
      'success'
    );
  };

  const recordOrderDelivered = async (orderId: string, pod: ProofOfDelivery) => {
    const targetOrder = orders.find((o) => o.orderId === orderId || o.id === orderId);
    let newNotif: OrderNotification | null = null;

    if (targetOrder) {
      try {
        const orderForAlert: Order = {
          ...targetOrder,
          orderStatus: 'Delivered',
        };
        const res = await dispatchOrderNotification(orderForAlert, 'Delivered', settings);
        newNotif = res.notification;
      } catch (err) {
        console.error('Failed to dispatch delivery completion alert:', err);
      }
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId || o.id === orderId) {
          const prevNotifs = Array.isArray(o.notifications) ? o.notifications : [];
          const updatedNotifs = newNotif ? [newNotif, ...prevNotifs] : prevNotifs;
          return {
            ...o,
            orderStatus: 'Delivered',
            status: 'delivered',
            deliveredAt: pod.deliveredAt || new Date().toISOString(),
            pod,
            paymentStatus: o.paymentMethod === 'Cash on Delivery' ? 'Paid' : o.paymentStatus,
            notifications: updatedNotifs,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (newNotif) {
      setNotificationsLog((prev) => [newNotif!, ...prev]);
    }
    showToast(
      `Order #${orderId} successfully marked Delivered! Proof of Delivery logged for ${pod.receiverName}.`,
      'success'
    );
  };

  const rescheduleOrderDelivery = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId || o.id === orderId) {
          return {
            ...o,
            rescheduledReason: reason,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
    showToast(`Order #${orderId} delivery rescheduled: ${reason}`, 'info');
  };

  const bulkUpdateOrderStatus = async (orderIds: string[], status: OrderStatus) => {
    const generatedNotifs: OrderNotification[] = [];

    setOrders((prev) =>
      prev.map((o) => {
        const id = o.orderId || o.id || '';
        if (orderIds.includes(id)) {
          const notif = buildOrderStatusNotification(o, status);
          generatedNotifs.push(notif);
          const prevNotifs = Array.isArray(o.notifications) ? o.notifications : [];
          return {
            ...o,
            orderStatus: status,
            status: status.toLowerCase(),
            notifications: [notif, ...prevNotifs],
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    if (generatedNotifs.length > 0) {
      setNotificationsLog((prev) => [...generatedNotifs, ...prev]);
    }

    showToast(
      `Status updated to ${status} for ${orderIds.length} orders. Automated email & SMS alerts sent!`,
      'success'
    );
  };

  const sendCustomOrderNotification = async (
    orderId: string,
    channel: 'email' | 'sms' | 'both' = 'both',
    customNotes?: string,
    overrideStatus?: OrderStatus
  ): Promise<boolean> => {
    const targetOrder = orders.find((o) => o.orderId === orderId || o.id === orderId);
    if (!targetOrder) {
      showToast(`Order #${orderId} not found`, 'error');
      return false;
    }

    const currentStatus = overrideStatus || targetOrder.orderStatus || 'Confirmed';
    const result = await dispatchOrderNotification(targetOrder, currentStatus, settings, {
      customNotes,
      overrideChannel: channel,
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId || o.id === orderId) {
          const prevNotifs = Array.isArray(o.notifications) ? o.notifications : [];
          return {
            ...o,
            notifications: [result.notification, ...prevNotifs],
          };
        }
        return o;
      })
    );

    setNotificationsLog((prev) => [result.notification, ...prev]);
    showToast(`Confirmation alert (${channel.toUpperCase()}) dispatched for Order #${orderId}!`, 'success');
    return true;
  };

  const clearNotificationsLog = () => {
    setNotificationsLog([]);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    showToast('Notification alert logs cleared', 'info');
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.orderId === orderId);
  };

  const getUserOrders = (userId: string) => {
    return orders.filter((o) => o.userId === userId);
  };

  // Review Methods
  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
    setReviews((prev) => [newReview, ...prev]);
    showToast('Thank you for sharing your royal experience!', 'success');
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('Review removed.', 'info');
  };

  const voteHelpfulReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );
    showToast('Thank you for marking this review as helpful!', 'success');
  };

  // Coupon Methods
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [...prev.filter((c) => c.code !== coupon.code), coupon]);
    showToast(`Coupon "${coupon.code}" created.`, 'success');
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(`Coupon "${code}" deleted.`, 'info');
  };

  const validateCoupon = (code: string, currentTotal: number) => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!found) {
      return { valid: false, discountPercent: 0, message: 'Invalid coupon code.' };
    }
    if (currentTotal < found.minOrderValue) {
      return {
        valid: false,
        discountPercent: 0,
        message: `This coupon requires a minimum cart value of ₹${found.minOrderValue.toLocaleString('en-IN')}.`,
      };
    }
    return {
      valid: true,
      discountPercent: found.discountPercent,
      message: `Coupon applied! You get ${found.discountPercent}% OFF.`,
    };
  };

  // Contact Messages & Newsletter
  const addContactMessage = (msg: { name: string; phone: string; email: string; message: string }) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: 'msg-' + Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setContactMessages((prev) => [newMsg, ...prev]);
    showToast('Your message has been sent to Siddhant Jain. We will respond promptly!', 'success');
  };

  const markMessageAsRead = (id: string) => {
    setContactMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
  };

  const subscribeNewsletter = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return false;
    }
    const exists = newsletterSubscribers.some((s) => s.email === trimmed);
    if (exists) {
      showToast('You are already subscribed to Majanya Ji updates!', 'info');
      return true;
    }
    setNewsletterSubscribers((prev) => [{ email: trimmed, date: new Date().toISOString().split('T')[0] }, ...prev]);
    showToast('Subscribed! Welcome to the royal Majanya Ji circle.', 'success');
    return true;
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Store settings updated successfully.', 'success');
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCoupons(INITIAL_COUPONS);
    setReviews(INITIAL_REVIEWS);
    setOrders(SAMPLE_ORDERS);
    setSettings(DEFAULT_STORE_SETTINGS);
    showToast('Reset to demo catalog values.', 'info');
  };

  const safeProducts = Array.isArray(products) ? products : INITIAL_PRODUCTS;
  const safeCategories = Array.isArray(categories) ? categories : INITIAL_CATEGORIES;
  const safeOrders = Array.isArray(orders) ? orders : SAMPLE_ORDERS;
  const safeReviews = Array.isArray(reviews) ? reviews : INITIAL_REVIEWS;
  const safeCoupons = Array.isArray(coupons) ? coupons : INITIAL_COUPONS;
  const safeContactMessages = Array.isArray(contactMessages) ? contactMessages : [];
  const safeNewsletterSubscribers = Array.isArray(newsletterSubscribers) ? newsletterSubscribers : [];
  const newslettersList = safeNewsletterSubscribers.map((s, idx) => ({
    id: `sub-${idx}-${s.email}`,
    email: s.email,
    subscribedAt: s.date || new Date().toISOString(),
  }));

  return (
    <ShopContext.Provider
      value={{
        products: safeProducts,
        categories: safeCategories,
        orders: safeOrders,
        reviews: safeReviews,
        coupons: safeCoupons,
        contactMessages: safeContactMessages,
        inquiries: safeContactMessages,
        newsletterSubscribers: safeNewsletterSubscribers,
        newsletters: newslettersList,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductBySlug,
        getProductById,
        addCategory,
        updateCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        getOrderById,
        getUserOrders,
        addReview,
        deleteReview,
        voteHelpfulReview,
        addCoupon,
        deleteCoupon,
        validateCoupon,
        addContactMessage,
        markMessageAsRead,
        subscribeNewsletter,
        updateSettings,
        resetToDefaults,
        bulkRestockProducts,
        bulkUpdateOrderStatus,
        updateOrderTracking,
        updateOrderNotes,
        notificationsLog: Array.isArray(notificationsLog) ? notificationsLog : [],
        sendCustomOrderNotification,
        clearNotificationsLog,
        dispatchOrderShipment,
        markOrderOutForDelivery,
        recordOrderDelivered,
        rescheduleOrderDelivery,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
