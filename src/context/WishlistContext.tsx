import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'majanyaji_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.isArray(wishlist) ? wishlist : []));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    const list = Array.isArray(wishlist) ? wishlist : [];
    return list.some((item) => item?.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (!product || !product.id) return;
    if (isInWishlist(product.id)) {
      setWishlist((prev) => (Array.isArray(prev) ? prev.filter((item) => item?.id !== product.id) : []));
      showToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      setWishlist((prev) => [...(Array.isArray(prev) ? prev : []), product]);
      showToast(`Added "${product.name}" to wishlist`, 'success');
    }
  };

  const moveToCart = (product: Product) => {
    if (!product) return;
    const defaultSize = product.sizes?.[0] || 'L';
    const defaultColor = product.colors?.[0] || { name: 'Standard', hex: '#5A1A1A' };
    addToCart(product, defaultSize, defaultColor, 1);
    setWishlist((prev) => (Array.isArray(prev) ? prev.filter((item) => item?.id !== product.id) : []));
    showToast(`Moved "${product.name}" to cart`, 'success');
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  return (
    <WishlistContext.Provider
      value={{
        wishlist: safeWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
