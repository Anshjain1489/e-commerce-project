import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { SearchModal } from './components/common/SearchModal';
import { QuickViewModal } from './components/product/QuickViewModal';
import { SizeGuideModal } from './components/common/SizeGuideModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { StoreLocationPage } from './pages/StoreLocationPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPages } from './pages/AuthPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { Product } from './types';

function MainApp() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideCategory, setSizeGuideCategory] = useState<string>('kurta-pajama');

  // Navigate handler that updates state and history
  const navigate = useCallback((path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPath]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut to open search (Press '/' or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global event listener for opening Size Guide
  useEffect(() => {
    const handleOpenSizeGuide = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string }>;
      if (customEvent.detail?.category) {
        setSizeGuideCategory(customEvent.detail.category);
      }
      setSizeGuideOpen(true);
    };
    window.addEventListener('open-size-guide', handleOpenSizeGuide);
    return () => window.removeEventListener('open-size-guide', handleOpenSizeGuide);
  }, []);

  // Render routing
  const renderCurrentPage = () => {
    const path = currentPath;

    // Category route: /category/:categoryId
    if (path.startsWith('/category/')) {
      const categoryId = path.replace('/category/', '').split('/')[0];
      return (
        <CategoryPage
          categoryId={categoryId}
          onNavigate={navigate}
          onQuickView={(p) => setQuickViewProduct(p)}
        />
      );
    }

    // Product details route: /product/:slug
    if (path.startsWith('/product/')) {
      const slug = path.replace('/product/', '').split('/')[0];
      return (
        <ProductDetailsPage
          productSlug={slug}
          onNavigate={navigate}
          onQuickView={(p) => setQuickViewProduct(p)}
        />
      );
    }

    // Order Success route: /order-success/:orderId
    if (path.startsWith('/order-success/')) {
      const orderId = path.replace('/order-success/', '').split('/')[0];
      return <OrderSuccessPage orderId={orderId} onNavigate={navigate} />;
    }

    // Static Routes
    switch (path) {
      case '/shop':
        return <ShopPage onNavigate={navigate} onQuickView={(p) => setQuickViewProduct(p)} />;
      case '/cart':
        return <CartPage onNavigate={navigate} />;
      case '/wishlist':
        return <WishlistPage onNavigate={navigate} onQuickView={(p) => setQuickViewProduct(p)} />;
      case '/checkout':
        return (
          <CheckoutPage
            onNavigate={navigate}
            onOrderSuccess={(orderId) => navigate(`/order-success/${orderId}`)}
          />
        );
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage />;
      case '/store-location':
        return <StoreLocationPage onNavigate={navigate} />;
      case '/shipping-policy':
        return <ShippingPolicyPage onNavigate={navigate} />;
      case '/returns-exchanges':
        return <ReturnPolicyPage onNavigate={navigate} />;
      case '/privacy-policy':
        return <PrivacyPolicyPage onNavigate={navigate} />;
      case '/terms':
        return <TermsPage onNavigate={navigate} />;
      case '/orders':
        return <OrdersPage onNavigate={navigate} />;
      case '/profile':
        return <ProfilePage onNavigate={navigate} />;
      case '/login':
        return <AuthPages initialMode="login" onNavigate={navigate} />;
      case '/register':
      case '/signup':
        return <AuthPages initialMode="register" onNavigate={navigate} />;
      case '/admin':
        return <AdminDashboard onNavigate={navigate} />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} onQuickView={(p) => setQuickViewProduct(p)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F8] text-[#1A1A1A]">
      {/* Primary Navigation Bar (includes Top Announcement Bar) */}
      <Navbar
        onNavigate={navigate}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigate} onOpenSizeGuide={() => setSizeGuideOpen(true)} />

      {/* Floating WhatsApp Concierge Button */}
      <WhatsAppButton />

      {/* Instant Search Overlay Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={navigate}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
      />

      {/* Global Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        defaultCategory={sizeGuideCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <WishlistProvider>
              <MainApp />
            </WishlistProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
