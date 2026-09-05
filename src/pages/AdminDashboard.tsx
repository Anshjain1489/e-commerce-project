import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Eye,
  Search,
  X,
  Star,
  ExternalLink,
  Mail,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Clock,
  Truck,
  PhoneCall,
  Send,
  Bell,
  Smartphone,
  CheckCircle2,
  Radio,
  Zap,
  Lock,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth, SOLE_ADMIN_EMAIL, isAuthorizedAdmin } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Product, Order, Coupon, OrderNotification } from '../types';
import { BRAND } from '../constants';
import { OrderEmailReceiptModal } from '../components/orders/OrderEmailReceiptModal';
import { OrderNotificationModal } from '../components/orders/OrderNotificationModal';
import { AdminNotificationsTab } from '../components/admin/AdminNotificationsTab';
import { AdminDeliveryTab } from '../components/admin/AdminDeliveryTab';
import { ProductImageUploader } from '../components/admin/ProductImageUploader';
import { buildOrderStatusNotification, getWhatsAppAlertUrl } from '../utils/notificationSystem';

export const AdminDashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const {
    products,
    categories,
    orders,
    coupons,
    inquiries,
    newsletters,
    settings,
    notificationsLog,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    addCoupon,
    deleteCoupon,
    updateSettings,
    sendCustomOrderNotification,
    clearNotificationsLog,
    dispatchOrderShipment,
    markOrderOutForDelivery,
    recordOrderDelivered,
    rescheduleOrderDelivery,
  } = useShop();
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();
  const { showToast } = useToast();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeCoupons = Array.isArray(coupons) ? coupons : [];
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const safeNewsletters = Array.isArray(newsletters) ? newsletters : [];
  const safeNotificationsLog = Array.isArray(notificationsLog) ? notificationsLog : [];

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'delivery' | 'notifications' | 'coupons' | 'inquiries' | 'settings'>('overview');
  const [adminReceiptOrder, setAdminReceiptOrder] = useState<Order | null>(null);
  const [adminNotificationModal, setAdminNotificationModal] = useState<OrderNotification | null>(null);
  const [notificationChannelFilter, setNotificationChannelFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [notificationSearchQuery, setNotificationSearchQuery] = useState('');
  const [sendingTestAlert, setSendingTestAlert] = useState(false);
  const [testAlertRecipient, setTestAlertRecipient] = useState({
    name: 'Ansh Jain',
    phone: '+91 7067299101',
    email: 'anshjain1440@gmail.com',
    status: 'Shipped' as any,
  });

  // Search & Filter state for Products & Orders
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Product Add / Edit Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    categoryId: categories[0]?.id || 'kurta-pajama',
    categoryName: categories[0]?.name || 'Kurta Pajama',
    price: 4999,
    originalPrice: 6499,
    discount: 23,
    description: '',
    fabric: 'Pure Silk Jacquard',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Royal Blue', hex: '#1E3A8A' }],
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600'],
    stock: 12,
    bestseller: false,
    featured: true,
  });

  // Coupon Add state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(15);
  const [couponMinAmount, setCouponMinAmount] = useState(2999);
  const [couponDesc, setCouponDesc] = useState('');

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    phone: settings?.phone || '+91 7067299101',
    whatsApp: settings?.whatsAppNumber || (settings as any)?.whatsApp || '+91 7007457920',
    instagramUrl: settings?.instagramUrl || '',
    facebookUrl: settings?.facebookUrl || '',
    freeShippingThreshold: settings?.freeShippingThreshold ?? 4999,
    shippingCharge: settings?.standardShippingFee ?? (settings as any)?.shippingCharge ?? 249,
    autoEmailOnStatusUpdate: settings?.autoEmailOnStatusUpdate !== false,
    autoSmsOnStatusUpdate: settings?.autoSmsOnStatusUpdate !== false,
    smsSenderId: settings?.smsSenderId || 'MJNYAJI',
    webhookUrl: settings?.webhookUrl || '',
    notifyOnConfirmed: settings?.notifyOnConfirmed !== false,
    notifyOnProcessing: settings?.notifyOnProcessing !== false,
    notifyOnShipped: settings?.notifyOnShipped !== false,
    notifyOnDelivered: settings?.notifyOnDelivered !== false,
    notifyOnCancelled: settings?.notifyOnCancelled !== false,
  });

  // Keep settingsForm synced when settings changes
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        phone: settings.phone || '+91 7067299101',
        whatsApp: settings.whatsAppNumber || (settings as any)?.whatsApp || '+91 7007457920',
        instagramUrl: settings.instagramUrl || '',
        facebookUrl: settings.facebookUrl || '',
        freeShippingThreshold: settings.freeShippingThreshold ?? 4999,
        shippingCharge: settings.standardShippingFee ?? (settings as any)?.shippingCharge ?? 249,
        autoEmailOnStatusUpdate: settings.autoEmailOnStatusUpdate !== false,
        autoSmsOnStatusUpdate: settings.autoSmsOnStatusUpdate !== false,
        smsSenderId: settings.smsSenderId || 'MJNYAJI',
        webhookUrl: settings.webhookUrl || '',
        notifyOnConfirmed: settings.notifyOnConfirmed !== false,
        notifyOnProcessing: settings.notifyOnProcessing !== false,
        notifyOnShipped: settings.notifyOnShipped !== false,
        notifyOnDelivered: settings.notifyOnDelivered !== false,
        notifyOnCancelled: settings.notifyOnCancelled !== false,
      });
    }
  }, [settings]);

  // Calculate Metrics
  const totalRevenue = (orders || []).reduce(
    (acc, o) =>
      o?.status !== 'cancelled' && o?.orderStatus !== 'Cancelled'
        ? acc + (o?.total ?? o?.totalAmount ?? 0)
        : acc,
    0
  );
  const pendingOrders = (orders || []).filter(
    (o) =>
      o?.status === 'pending' ||
      o?.status === 'confirmed' ||
      o?.orderStatus === 'Pending' ||
      o?.orderStatus === 'Confirmed'
  ).length;

  const avgOrderValue = safeOrders.length > 0 ? Math.round(totalRevenue / Math.max(1, safeOrders.length)) : 0;
  const lowStockProducts = safeProducts.filter((p) => (p?.stock ?? 0) <= 5);

  const handleQuickStock = (productId: string, delta: number) => {
    const prod = safeProducts.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    updateProduct(productId, { stock: newStock });
    showToast(`${prod.name} stock adjusted to ${newStock} pcs`, 'info');
  };

  const handleCopyCoupon = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCouponId(null), 2500);
  };

  const handleCopyAllEmails = () => {
    const emailList = safeNewsletters.map((n) => n.email).join(', ');
    if (!emailList) return;
    navigator.clipboard.writeText(emailList);
    setCopiedEmails(true);
    showToast(`Copied ${safeNewsletters.length} subscriber emails!`, 'success');
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  // Filtered Products
  const filteredProducts = (products || []).filter((p) => {
    const query = productSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      (p.fabric && p.fabric.toLowerCase().includes(query)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(query));
    const matchesCategory =
      productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Orders
  const filteredOrders = (orders || []).filter((o) => {
    const orderId = (o.id || o.orderId || '').toLowerCase();
    const customer = (o.customerName || '').toLowerCase();
    const phone = o.customerPhone || '';
    const city = (o.shippingAddress?.city || '').toLowerCase();
    const query = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      orderId.includes(query) ||
      customer.includes(query) ||
      phone.includes(query) ||
      city.includes(query);

    const status = (o.status || o.orderStatus || 'pending').toLowerCase();
    const matchesStatus =
      orderStatusFilter === 'all' ||
      status === orderStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || 'kurta-pajama',
      categoryName: categories[0]?.name || 'Kurta Pajama',
      price: 4999,
      originalPrice: 6499,
      discount: 23,
      description: 'Handcrafted royal ensemble tailored in Indore for wedding and festive milestones.',
      fabric: 'Pure Silk Jacquard with Zari embroidery',
      sizes: ['M', 'L', 'XL'],
      colors: [{ name: 'Royal Blue', hex: '#1E3A8A' }],
      images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600'],
      stock: 15,
      bestseller: false,
      featured: true,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || '',
      slug: prod.slug || '',
      categoryId: prod.categoryId || '',
      categoryName: prod.categoryName || '',
      price: prod.price ?? 0,
      originalPrice: prod.originalPrice ?? 0,
      discount: prod.discount ?? 0,
      description: prod.description || '',
      fabric: prod.fabric || '',
      sizes: prod.sizes || ['M', 'L', 'XL'],
      colors: prod.colors || [{ name: 'Royal Blue', hex: '#1E3A8A' }],
      images: prod.images || [],
      stock: prod.stock ?? 0,
      bestseller: prod.bestseller || false,
      featured: prod.featured || false,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) {
      showToast('Please enter a product name', 'error');
      return;
    }

    const generatedSlug = productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const selectedCat = categories.find((c) => c.id === productForm.categoryId);
    const validImages = productForm.images && productForm.images.length > 0
      ? productForm.images
      : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80'];

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        ...productForm,
        images: validImages,
        slug: generatedSlug,
        categoryName: selectedCat ? selectedCat.name : productForm.categoryName,
      });
      showToast('Product updated successfully!', 'success');
    } else {
      await addProduct({
        ...productForm,
        images: validImages,
        slug: generatedSlug,
        categoryName: selectedCat ? selectedCat.name : productForm.categoryName,
        rating: 5.0,
        reviewCount: 1,
        tags: ['ethnic', 'new'],
      });
      showToast('New product added to catalog!', 'success');
    }
    setProductModalOpen(false);
  };

  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    await addCoupon({
      code: couponCode.trim().toUpperCase(),
      discountPercentage: couponDiscount,
      minPurchaseAmount: couponMinAmount,
      description: couponDesc || `Flat ${couponDiscount}% off on orders above ₹${couponMinAmount}`,
      expiresAt: '2026-12-31',
      isActive: true,
    });

    setCouponCode('');
    setCouponDesc('');
    showToast('Festive coupon added!', 'success');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settingsForm,
      phone: settingsForm.phone,
      whatsAppNumber: settingsForm.whatsApp,
      whatsAppLink: `https://wa.me/${settingsForm.whatsApp.replace(/\D/g, '')}`,
      instagramUrl: settingsForm.instagramUrl,
      facebookUrl: settingsForm.facebookUrl,
      freeShippingThreshold: Number(settingsForm.freeShippingThreshold) || 4999,
      standardShippingFee: Number(settingsForm.shippingCharge) || 249,
    });
    showToast('Store settings updated!', 'success');
  };

  // Strict admin guard: only siddhant9745@gmail.com can open or view the admin portal
  const isAuthorized = isAdmin && isAuthorizedAdmin(user?.email);

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FAF7F2]">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-[#5A1A1A]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227]">
              Restricted Access
            </span>
            <h1 className="text-xl font-serif font-bold text-[#1E1E1E] mt-1">
              Admin Portal Restricted
            </h1>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              This administrative portal is exclusively accessible to the designated Store Administrator:{' '}
              <strong className="text-gray-900 font-mono font-semibold">{SOLE_ADMIN_EMAIL}</strong>.
            </p>
          </div>

          {user ? (
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 text-left space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Current Active Session:
              </p>
              <p className="font-semibold text-gray-900 truncate">
                {user.name} ({user.email})
              </p>
              <p className="text-[11px] text-gray-500">
                Account role:{' '}
                <span className="inline-block px-1.5 py-0.2 text-[10px] font-medium bg-gray-200 text-gray-800 rounded">
                  Customer
                </span>{' '}
                — Administrative actions are disabled for this account.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
              You are currently signed out. Please log in with the administrator account to continue.
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              id="admin-guard-return-store-btn"
              onClick={() => onNavigate('/')}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
            >
              Return to Store
            </button>
            <button
              type="button"
              id="admin-guard-login-admin-btn"
              onClick={() => {
                loginAsDemoAdmin();
                showToast('Signed in as Store Administrator (Siddhant Jain)', 'success');
              }}
              className="flex-1 py-2.5 px-4 bg-[#5A1A1A] hover:bg-[#3D1010] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Admin Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#5A1A1A]" />
              Store Administration Suite
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              Majanya Ji Master Portal
            </h1>
            <p className="text-xs text-gray-500">
              Manage inventory, live customer dispatches, promotional coupons, and Indore boutique details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/shop')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A1A1A] border border-[#5A1A1A] hover:bg-white rounded"
            >
              Preview Store
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#5A1A1A] text-white hover:bg-[#3D1010] rounded flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-[#C9A227]" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Admin Session Status Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-[#C9A227]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A1A1A] text-[#C9A227] flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {isAdmin ? 'Master Administrator Session' : 'Store Preview Mode (Guest / Staff)'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isAdmin ? 'Authenticated' : 'Read & Demo'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.email || 'siddhant9745@gmail.com'} • Master Craftsman Siddhant Jain Atelier (Indore)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  loginAsDemoAdmin();
                  showToast('Signed in as Siddhant Jain (Store Admin)', 'success');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#5A1A1A] text-white hover:bg-[#3D1010] rounded transition-colors shadow-2xs"
              >
                Sign in as Admin (Siddhant)
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-black border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Customer Home
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Navigation */}
        <div className="flex overflow-x-auto gap-2 border-b border-gray-200 mb-8 pb-1 scrollbar-none text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Overview
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <Package className="w-4 h-4" /> Products ({safeProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Orders ({safeOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'delivery'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <Truck className="w-4 h-4 text-[#C9A227]" />
            <span>Delivery & Logistics</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#C9A227]/20 text-[#5A1A1A] font-mono">
              {safeOrders.filter((o) => (o.orderStatus || o.status || '').toLowerCase() !== 'delivered').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <Bell className="w-4 h-4 text-[#C9A227]" />
            <span>Alerts & SMS Logs</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#C9A227]/20 text-[#5A1A1A] font-mono">
              {safeNotificationsLog.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'coupons'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <Tag className="w-4 h-4" /> Coupons ({safeCoupons.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" /> Inquiries ({safeInquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#5A1A1A] text-[#FAF7F2]'
                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Store Settings
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#C9A227]/30 shadow-sm hover:border-[#C9A227] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Gross Revenue
                  </span>
                  <DollarSign className="w-5 h-5 text-[#C9A227]" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#5A1A1A]">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                  Live verified store payments
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#C9A227]/30 shadow-sm hover:border-[#C9A227] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Total Orders
                  </span>
                  <ShoppingBag className="w-5 h-5 text-[#5A1A1A]" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
                  {safeOrders.length}
                </p>
                <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
                  {pendingOrders} active in fulfillment
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#C9A227]/30 shadow-sm hover:border-[#C9A227] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Avg Order Value (AOV)
                  </span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
                  ₹{avgOrderValue.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-gray-500 mt-1 inline-block">
                  Per customer transaction
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#C9A227]/30 shadow-sm hover:border-[#C9A227] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                    Garment Catalog
                  </span>
                  <Package className="w-5 h-5 text-[#C9A227]" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
                  {safeProducts.length}
                </p>
                <span className={`text-[11px] font-semibold mt-1 inline-block ${
                  lowStockProducts.length > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {lowStockProducts.length > 0
                    ? `⚠️ ${lowStockProducts.length} low in inventory`
                    : '✓ Healthy inventory'}
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quick Actions:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3 py-1.5 bg-[#5A1A1A] text-white hover:bg-[#3D1010] rounded flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Add Garment</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded flex items-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#5A1A1A]" />
                  <span>Process Orders ({pendingOrders})</span>
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className="px-3 py-1.5 bg-[#FAF7F2] border border-[#C9A227]/40 hover:bg-[#FAF7F2]/80 text-[#5A1A1A] rounded flex items-center gap-1.5 transition-colors font-bold"
                >
                  <Truck className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Delivery Hub</span>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded flex items-center gap-1.5 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Create Coupon</span>
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Leads ({safeInquiries.length})</span>
                </button>
              </div>
            </div>

            {/* Low Stock Alert Section */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        Atelier Stock Replenishment Alert ({lowStockProducts.length} outfits low)
                      </h4>
                      <p className="text-xs text-amber-700">
                        The following royal outfits have 5 or fewer pieces remaining in the Indore warehouse.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-amber-900 hover:underline hidden sm:block"
                  >
                    Manage All Catalog →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600'}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded bg-gray-100 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-red-600 font-bold">Only {p.stock} pcs left</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickStock(p.id, 5)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded shrink-0 transition-colors"
                        title="Add 5 pieces to stock"
                      >
                        +5 Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#5A1A1A]">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-gray-500">
                    Latest client purchases from Indore, Mumbai, Delhi, and worldwide
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[#5A1A1A] hover:underline"
                >
                  View All Orders ({safeOrders.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {safeOrders.slice(0, 5).map((o) => {
                      const orderItems = Array.isArray(o?.items)
                        ? o.items
                        : Array.isArray((o as any)?.products)
                        ? (o as any).products
                        : [];
                      const orderTotal = o.total ?? o.totalAmount ?? 0;
                      const orderKey = o.id || o.orderId || Math.random();
                      const orderStatus = o.status || o.orderStatus || 'pending';

                      return (
                        <tr key={orderKey} className="hover:bg-gray-50">
                          <td className="py-3 font-mono font-bold text-[#5A1A1A]">#{o.id || o.orderId}</td>
                          <td className="py-3">
                            <p className="font-medium text-gray-800">{o.customerName}</p>
                            <p className="text-[10px] text-gray-400">{o.customerPhone}</p>
                          </td>
                          <td className="py-3 text-gray-500">{orderItems.length} items</td>
                          <td className="py-3 font-bold text-gray-900">₹{orderTotal.toLocaleString('en-IN')}</td>
                          <td className="py-3 uppercase text-[10px] font-bold text-gray-600">
                            {o.paymentMethod} ({o.paymentStatus})
                          </td>
                          <td className="py-3">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                              {orderStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setAdminReceiptOrder(o)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#5A1A1A] border border-[#C9A227]/40 rounded hover:bg-[#FAF7F2] transition-colors"
                              title="Generate Email Receipt"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#C9A227]" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#5A1A1A]">
                  Product Inventory ({safeProducts.length} Garments)
                </h3>
                <p className="text-xs text-gray-500">
                  Update inventory levels, adjust pricing, and toggle bestseller flags.
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 bg-[#5A1A1A] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-[#C9A227]" /> Add Garment
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by outfit name, fabric, category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                />
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#5A1A1A]"
                >
                  <option value="all">All Categories ({safeProducts.length})</option>
                  {safeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {(productSearchQuery || productCategoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setProductSearchQuery('');
                      setProductCategoryFilter('all');
                    }}
                    className="text-xs text-[#5A1A1A] font-semibold underline px-2 py-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase">
                    <th className="pb-3">Outfit</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock Units</th>
                    <th className="pb-3">Badges</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No garments match the current search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-11 h-14 rounded object-cover shrink-0 bg-gray-100 shadow-2xs"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-xs">{p.fabric}</p>
                            <span className="text-[9px] text-gray-400 font-mono">/{p.slug}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 font-medium">{p.categoryName}</td>
                        <td className="py-3">
                          <span className="font-bold text-[#5A1A1A] block">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickStock(p.id, -1)}
                              className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span
                              className={`font-semibold px-1.5 py-0.5 rounded text-xs min-w-[28px] text-center ${
                                p.stock < 5
                                  ? 'bg-red-50 text-red-700 font-bold'
                                  : 'text-gray-800'
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(p.id, 1)}
                              className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                          {p.stock < 5 && (
                            <span className="text-[9px] text-red-600 font-semibold block mt-0.5">
                              Low stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 space-x-1">
                          {p.bestseller && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase">
                              Bestseller
                            </span>
                          )}
                          {p.featured && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded uppercase">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/product/${p.slug}`)}
                            className="p-1.5 text-gray-400 hover:text-[#5A1A1A] hover:bg-gray-100 rounded"
                            title="Preview on Store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-gray-400 hover:text-[#5A1A1A] hover:bg-gray-100 rounded"
                            title="Edit Garment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                deleteProduct(p.id);
                                showToast('Product removed', 'info');
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#5A1A1A]">
                  Customer Orders & Fulfillment ({safeOrders.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Update delivery stages, view destination addresses, and generate customer email receipts.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar for Orders */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer name, phone, or destination city..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#5A1A1A] capitalize"
                >
                  <option value="all">All Statuses ({safeOrders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out for delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {(orderSearchQuery || orderStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setOrderSearchQuery('');
                      setOrderStatusFilter('all');
                    }}
                    className="text-xs text-[#5A1A1A] font-semibold underline px-2 py-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No orders match the current search or status filter.
                </div>
              ) : (
                filteredOrders.map((o) => {
                  const orderItems = Array.isArray(o?.items)
                    ? o.items
                    : Array.isArray((o as any)?.products)
                    ? (o as any).products
                    : [];
                  const orderId = o.id || o.orderId || 'ORD-0';
                  const orderTotal = o.total ?? o.totalAmount ?? 0;
                  const orderStatus = (o.status || o.orderStatus || 'pending').toLowerCase();

                  return (
                    <div
                      key={orderId}
                      className="p-5 rounded-2xl border border-gray-200 bg-[#FAF7F2]/40 hover:bg-[#FAF7F2]/70 transition-colors text-xs space-y-4"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#5A1A1A]/10 text-[#5A1A1A] flex items-center justify-center font-bold">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-sm text-[#5A1A1A]">
                              #{orderId}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              Placed on {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px]">Customer</span>
                          <span className="font-semibold text-gray-900">{o.customerName}</span>
                          <span className="text-gray-500 block text-[10px]">{o.customerPhone}</span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px]">Order Value</span>
                          <span className="font-bold text-sm text-[#5A1A1A]">
                            ₹{orderTotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px]">Payment</span>
                          <span className="font-semibold uppercase text-gray-800">
                            {o.paymentMethod || 'Online'} ({o.paymentStatus || 'Paid'})
                          </span>
                          {(o.razorpayPaymentId || o.paymentId) && (
                            <span className="block font-mono text-[9px] text-[#5A1A1A] truncate max-w-[130px]" title={o.razorpayPaymentId || o.paymentId}>
                              ID: {o.razorpayPaymentId || o.paymentId}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const notif =
                                o.notifications && o.notifications.length > 0
                                  ? o.notifications[0]
                                  : buildOrderStatusNotification(o, o.orderStatus || 'Confirmed');
                              setAdminNotificationModal(notif);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C9A227]/50 hover:bg-[#FAF7F2] text-[#5A1A1A] font-semibold rounded text-xs transition-colors shadow-2xs"
                            title="View sent SMS & Email alerts for this order"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span>Alert / SMS</span>
                            {o.notifications && o.notifications.length > 0 && (
                              <span className="w-4 h-4 bg-[#5A1A1A] text-white rounded-full text-[10px] flex items-center justify-center font-mono">
                                {o.notifications.length}
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdminReceiptOrder(o)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-[#FAF7F2] text-gray-700 font-semibold rounded text-xs transition-colors shadow-2xs"
                            title="Generate HTML Email Receipt"
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <span>Receipt</span>
                          </button>

                          <div className="flex items-center gap-1.5 bg-white border border-[#C9A227]/40 rounded px-2.5 py-1 shadow-2xs">
                            <span className="text-[10px] text-[#5A1A1A] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Bell className="w-3 h-3 text-[#C9A227]" /> Stage:
                            </span>
                            <select
                              value={orderStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                updateOrderStatus(orderId, newStatus);
                                showToast(`Order #${orderId} moved to ${newStatus} • Customer notified via SMS & Email`, 'success');
                              }}
                              className="text-xs font-bold text-[#5A1A1A] bg-transparent focus:outline-none capitalize cursor-pointer font-sans"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="out for delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Items & Shipping row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-[11px] text-gray-600">
                        <div className="md:col-span-7">
                          <span className="font-semibold text-gray-700 block mb-1.5">
                            Garments Ordered ({orderItems.length}):
                          </span>
                          <div className="space-y-1.5">
                            {orderItems.map((it: any, idx: number) => {
                              const pName = it.product?.name || it.productName || 'Garment';
                              const pImg = it.product?.images?.[0] || it.productImage || null;
                              return (
                                <div key={idx} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-gray-100">
                                  {pImg && (
                                    <img
                                      src={pImg}
                                      alt=""
                                      referrerPolicy="no-referrer"
                                      className="w-8 h-10 object-cover rounded bg-gray-100 shrink-0"
                                    />
                                  )}
                                  <div className="truncate">
                                    <span className="font-medium text-gray-900">{pName}</span>
                                    <span className="text-gray-400 text-[10px] ml-1.5">
                                      Size: {it.size || 'Free'} • Qty: {it.quantity || 1} • ₹{(it.price || it.unitPrice || 0).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="md:col-span-5 bg-white/70 p-3 rounded-xl border border-gray-100 space-y-1">
                          <span className="font-semibold text-gray-700 block text-[11px]">
                            Shipping & Courier Details:
                          </span>
                          {o.shippingAddress ? (
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                              {o.shippingAddress.street && `${o.shippingAddress.street}, `}
                              {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pinCode}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-[11px]">Store Atelier Pickup / Direct Dispatch</p>
                          )}
                          <div className="pt-1.5 flex items-center justify-between gap-2 text-[10px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-[#5A1A1A]" />
                              <span>
                                {o.courier || 'Blue Dart Express'} {o.trackingNumber ? `(AWB: ${o.trackingNumber})` : ''}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('delivery')}
                              className="text-[#5A1A1A] font-bold hover:underline"
                            >
                              Open Delivery Hub →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3A: DELIVERY & LOGISTICS OPERATIONS ================= */}
        {activeTab === 'delivery' && (
          <AdminDeliveryTab
            orders={safeOrders}
            onDispatchShipment={dispatchOrderShipment}
            onMarkOutForDelivery={markOrderOutForDelivery}
            onRecordDelivered={recordOrderDelivered}
            onRescheduleDelivery={rescheduleOrderDelivery}
          />
        )}

        {/* ================= TAB 3B: CUSTOMER ALERTS & SMS LOGS ================= */}
        {activeTab === 'notifications' && (
          <AdminNotificationsTab
            orders={safeOrders}
            notifications={safeNotificationsLog}
            onOpenModal={(notif) => setAdminNotificationModal(notif)}
            onResend={(orderId, channel) => sendCustomOrderNotification(orderId, channel)}
            onClearLog={clearNotificationsLog}
          />
        )}

        {/* ================= TAB 4: COUPONS ================= */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#C9A227]/30 shadow-sm text-xs">
              <h3 className="font-cinzel text-base font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100">
                Create Festive Coupon
              </h3>
              <form onSubmit={handleAddCouponSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI25"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300 uppercase font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Discount (%) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="90"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(Number(e.target.value))}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      value={couponMinAmount}
                      onChange={(e) => setCouponMinAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% off on Wedding Sets"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#5A1A1A] text-white rounded font-semibold uppercase tracking-wider"
                >
                  Publish Coupon
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#C9A227]/30 shadow-sm text-xs">
              <h3 className="font-cinzel text-base font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100">
                Active Coupons ({safeCoupons.length})
              </h3>
              <div className="space-y-3">
                {safeCoupons.map((c) => (
                  <div key={c.id || c.code} className="p-3 bg-[#FAF7F2] rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#5A1A1A]">{c.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(c.code, c.id || c.code)}
                          className="p-1 text-gray-400 hover:text-[#5A1A1A] hover:bg-white rounded transition-colors"
                          title="Copy Coupon Code"
                        >
                          {copiedCouponId === (c.id || c.code) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-500">{c.description || `${c.discountPercentage || c.discountPercent || 10}% off orders`}</p>
                      <p className="text-[10px] text-gray-400">Min. Purchase: ₹{(c.minPurchaseAmount ?? c.minOrderValue ?? 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-emerald-700">{c.discountPercentage || c.discountPercent || 10}% OFF</span>
                      <button
                        onClick={() => {
                          deleteCoupon(c.id || c.code);
                          showToast(`Coupon ${c.code} deleted`, 'info');
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: INQUIRIES & NEWSLETTER ================= */}
        {activeTab === 'inquiries' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#C9A227]/30 shadow-sm text-xs">
              <h3 className="font-cinzel text-base font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100">
                Customer Inquiries ({safeInquiries.length})
              </h3>
              <div className="space-y-4">
                {safeInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-xl border border-gray-200 bg-[#FAF7F2]/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#1E1E1E] text-sm">{inq.name}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="text-gray-500 text-[11px] mb-2">
                      Email: {inq.email} {inq.phone && `• Phone: ${inq.phone}`}
                    </div>
                    <p className="text-gray-700 font-serif italic mb-3">&ldquo;{inq.message}&rdquo;</p>
                    {inq.phone && (
                      <a
                        href={`https://wa.me/91${String(inq.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${inq.name}, Siddhant Jain here from Majanya Ji Ethnic Wear regarding your inquiry.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] text-white rounded text-[11px] font-bold"
                      >
                        Reply on WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#C9A227]/30 shadow-sm text-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="font-cinzel text-base font-bold text-[#5A1A1A]">
                  Newsletter List ({safeNewsletters.length})
                </h3>
                {safeNewsletters.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyAllEmails}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#FAF7F2] border border-[#C9A227]/40 hover:bg-[#C9A227]/20 text-[#5A1A1A] rounded transition-colors"
                    title="Copy all subscriber emails"
                  >
                    {copiedEmails ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#C9A227]" />
                    )}
                    <span>{copiedEmails ? 'Copied' : 'Copy All'}</span>
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {safeNewsletters.map((n) => (
                  <div key={n.id} className="p-2.5 rounded bg-gray-50 border border-gray-200 flex justify-between">
                    <span className="font-mono text-gray-800">{n.email}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.subscribedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm max-w-2xl text-xs">
            <h3 className="font-cinzel text-base font-bold text-[#5A1A1A] mb-6 pb-2 border-b border-gray-100">
              Boutique & Brand Configurations
            </h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Direct Calling Phone</label>
                  <input
                    type="text"
                    value={settingsForm.phone || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">WhatsApp Sizing Phone</label>
                  <input
                    type="text"
                    value={settingsForm.whatsApp || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsApp: e.target.value })}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Instagram Profile URL</label>
                <input
                  type="text"
                  value={settingsForm.instagramUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Facebook Page URL</label>
                <input
                  type="text"
                  value={settingsForm.facebookUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                  className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Free Shipping Above (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold ?? 4999}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Flat Standard Shipping (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.shippingCharge ?? 249}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingCharge: Number(e.target.value) })}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>
              </div>

              {/* Automated Customer Notification & SMS Gateway Settings */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#C9A227]" />
                  <h4 className="font-bold text-[#5A1A1A] text-sm">
                    Automated Order Status Alerts & SMS Dispatch Settings
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500">
                  Configure automatic SMS and Email delivery whenever order milestones are updated in the dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-gray-200 cursor-pointer hover:border-[#C9A227]/60">
                    <input
                      type="checkbox"
                      checked={settingsForm.autoEmailOnStatusUpdate}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, autoEmailOnStatusUpdate: e.target.checked })
                      }
                      className="mt-0.5 rounded text-[#5A1A1A] focus:ring-[#5A1A1A]"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">Automated Email Receipts & Alerts</span>
                      <span className="text-[10px] text-gray-500">
                        Sends royal responsive HTML email templates with order items, addresses, and live tracking buttons.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-gray-200 cursor-pointer hover:border-[#C9A227]/60">
                    <input
                      type="checkbox"
                      checked={settingsForm.autoSmsOnStatusUpdate}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, autoSmsOnStatusUpdate: e.target.checked })
                      }
                      className="mt-0.5 rounded text-[#5A1A1A] focus:ring-[#5A1A1A]"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">Automated Mobile SMS Alerts</span>
                      <span className="text-[10px] text-gray-500">
                        Dispatches instant 160-char transactional SMS with Blue Dart tracking links directly to customer mobile.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">DLT SMS Sender Header ID</label>
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="MJNYAJI"
                      value={settingsForm.smsSenderId || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smsSenderId: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300 uppercase font-mono"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Approved 6-char TRAI Telecom sender code</span>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Webhook Dispatch URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={settingsForm.webhookUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, webhookUrl: e.target.value })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300 font-mono text-[11px]"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Forward alerts to Twilio, Gupshup, or Slack</span>
                  </div>
                </div>

                <div>
                  <span className="block text-gray-700 font-semibold mb-2">Trigger Automatic Alerts on Milestones:</span>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: 'notifyOnConfirmed', label: 'Order Confirmed' },
                      { key: 'notifyOnProcessing', label: 'Tailoring & Processing' },
                      { key: 'notifyOnShipped', label: 'Dispatched / In Transit' },
                      { key: 'notifyOnDelivered', label: 'Delivered' },
                      { key: 'notifyOnCancelled', label: 'Cancelled' },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={(settingsForm as any)[key] !== false}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, [key]: e.target.checked })
                          }
                          className="rounded text-[#5A1A1A] focus:ring-[#5A1A1A]"
                        />
                        <span className="font-medium text-gray-800">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#5A1A1A] text-white rounded font-semibold uppercase tracking-wider mt-4"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* ================= PRODUCT ADD/EDIT MODAL ================= */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-[#C9A227]/40 shadow-2xl relative text-xs">
              <button
                onClick={() => setProductModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-cinzel text-lg font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100">
                {editingProduct ? 'Edit Royal Garment' : 'Add New Ethnic Wear'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Outfit Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Imperial Emerald Green Silk Kurta Pajama"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <select
                      value={productForm.categoryId || ''}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300 font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Fabric Details</label>
                    <input
                      type="text"
                      value={productForm.fabric || ''}
                      onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price ?? 0}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">MRP Price (₹)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice ?? 0}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Stock (pcs)</label>
                    <input
                      type="number"
                      value={productForm.stock ?? 0}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] border border-gray-300"
                  />
                </div>

                <div className="pt-1">
                  <ProductImageUploader
                    images={productForm.images || []}
                    onChange={(newImages) => setProductForm({ ...productForm, images: newImages })}
                  />
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={productForm.bestseller}
                      onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                      className="rounded text-[#5A1A1A]"
                    />
                    <span>Mark as Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="rounded text-[#5A1A1A]"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#5A1A1A] text-white rounded font-semibold uppercase tracking-wider"
                  >
                    {editingProduct ? 'Save Edits' : 'Create Garment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Admin Order Email Receipt Modal */}
      <OrderEmailReceiptModal
        isOpen={!!adminReceiptOrder}
        onClose={() => setAdminReceiptOrder(null)}
        order={adminReceiptOrder}
      />

      {/* Admin Order Notification Preview & Resend Modal */}
      <OrderNotificationModal
        isOpen={!!adminNotificationModal}
        onClose={() => setAdminNotificationModal(null)}
        notification={adminNotificationModal}
        onResend={(channel) => {
          if (adminNotificationModal?.orderId) {
            sendCustomOrderNotification(adminNotificationModal.orderId, channel);
          }
        }}
      />
    </div>
  );
};
