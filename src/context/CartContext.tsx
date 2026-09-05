import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { useToast } from './ToastContext';
import { useShop } from './ShopContext';

export type { CartItem };

export interface AppliedCouponInfo {
  code: string;
  discountPercent: number;
  discountType?: 'percent' | 'flat';
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  description?: string;
  tag?: string;
}

export interface ApplyCouponResult {
  success: boolean;
  message: string;
  discountAmount?: number;
  coupon?: AppliedCouponInfo;
}

export interface CouponEligibility {
  eligible: boolean;
  message: string;
  shortfall: number;
  potentialDiscount: number;
}

export const DEFAULT_PROMO_COUPONS: Coupon[] = [
  {
    code: 'ROYAL10',
    discountPercent: 10,
    minOrderValue: 2999,
    maxDiscount: 1500,
    description: '10% privilege discount on royal handcrafted attire',
    isActive: true,
    tag: 'Most Popular',
  },
  {
    code: 'MAJANYAJI15',
    discountPercent: 15,
    minOrderValue: 5999,
    maxDiscount: 3000,
    description: '15% celebration discount on majestic wedding sets above ₹5,999',
    isActive: true,
    tag: 'Festive Special',
  },
  {
    code: 'WELCOME20',
    discountPercent: 20,
    minOrderValue: 8999,
    maxDiscount: 5000,
    description: '20% inaugural discount for royal patrons on orders above ₹8,999',
    isActive: true,
    tag: 'First Order',
  },
  {
    code: 'FESTIVE25',
    discountPercent: 25,
    minOrderValue: 14999,
    maxDiscount: 8000,
    description: '25% grand celebration discount on bespoke outfits above ₹14,999',
    isActive: true,
    tag: 'Grand Wedding',
  },
  {
    code: 'INDORE1000',
    discountPercent: 0,
    discountType: 'flat',
    discountAmount: 1000,
    minOrderValue: 7499,
    description: 'Flat ₹1,000 privilege savings from our Indore atelier on orders above ₹7,499',
    isActive: true,
    tag: 'Atelier Privilege',
  },
];

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (product: Product, size: string, color: { name: string; hex: string }, qty?: number) => void;
  removeFromCart: (itemIdOrProductId: string, size?: string, colorName?: string) => void;
  updateQuantity: (
    itemIdOrProductId: string,
    quantityOrSize: number | string,
    colorName?: string,
    quantity?: number
  ) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingCharge: number;
  shipping: number;
  discount: number;
  appliedCoupon: AppliedCouponInfo | null;
  availableCoupons: Coupon[];
  applyCoupon: (code: string, discountPercent?: number) => ApplyCouponResult;
  removeCoupon: (suppressToast?: boolean) => void;
  total: number;
  freeShippingThreshold: number;
  couponRequirementMet: boolean;
  couponShortfall: number;
  couponWarning?: string;
  validateCouponEligibility: (coupon: Coupon) => CouponEligibility;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'majanyaji_cart';
const APPLIED_COUPON_STORAGE_KEY = 'majanyaji_applied_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { coupons: shopCoupons = [] } = useShop();
  const { showToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => {
        const prod = item.product || item;
        const sSize = item.selectedSize || item.size || 'L';
        const sColor = item.selectedColor || item.color || { name: 'Standard', hex: '#5A1A1A' };
        return {
          id: item.id || `${prod?.id || 'prod'}-${sSize}-${sColor?.name || 'default'}`,
          product: prod,
          selectedSize: sSize,
          size: sSize,
          selectedColor: sColor,
          color: sColor,
          quantity: item.quantity || 1,
        };
      });
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(() => {
    try {
      const saved = localStorage.getItem(APPLIED_COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Persist applied coupon
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(APPLIED_COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save applied coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  // Merge default coupons with ShopContext coupons
  const availableCoupons = useMemo<Coupon[]>(() => {
    const map = new Map<string, Coupon>();
    DEFAULT_PROMO_COUPONS.forEach((c) => map.set(c.code.toUpperCase(), c));

    if (Array.isArray(shopCoupons)) {
      shopCoupons.forEach((c) => {
        if (c && c.code) {
          const codeUpper = c.code.toUpperCase();
          const existing = map.get(codeUpper);
          map.set(codeUpper, {
            ...existing,
            ...c,
            code: codeUpper,
            discountPercent: c.discountPercent ?? (c as any).discountPercentage ?? existing?.discountPercent ?? 10,
            minOrderValue: c.minOrderValue ?? (c as any).minPurchaseAmount ?? existing?.minOrderValue ?? 0,
            description: c.description || existing?.description || `${c.discountPercent || 10}% off your order`,
            isActive: c.isActive !== false,
          });
        }
      });
    }

    return Array.from(map.values()).filter((c) => c.isActive !== false);
  }, [shopCoupons]);

  const itemCount = (cart || []).reduce((acc, item) => acc + (item.quantity || 0), 0);
  const subtotal = (cart || []).reduce(
    (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  const freeShippingThreshold = 4999;
  const shippingCharge = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 249;

  // Check if applied coupon minimum order requirement is satisfied
  const couponShortfall = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.minOrderValue) return 0;
    return Math.max(0, appliedCoupon.minOrderValue - subtotal);
  }, [appliedCoupon, subtotal]);

  const couponRequirementMet = couponShortfall === 0;

  const couponWarning = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return undefined;
    if (couponShortfall > 0) {
      return `Add ₹${couponShortfall.toLocaleString('en-IN')} more to your bag to reactivate promo code "${appliedCoupon.code}"!`;
    }
    return undefined;
  }, [appliedCoupon, subtotal, couponShortfall]);

  // Calculate actual discount
  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0 || !couponRequirementMet) return 0;

    if (appliedCoupon.discountType === 'flat' && appliedCoupon.discountAmount) {
      return Math.min(appliedCoupon.discountAmount, subtotal);
    }

    let calculated = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    if (appliedCoupon.maxDiscount && calculated > appliedCoupon.maxDiscount) {
      calculated = appliedCoupon.maxDiscount;
    }
    return Math.min(calculated, subtotal);
  }, [appliedCoupon, subtotal, couponRequirementMet]);

  const total = Math.max(0, subtotal - discount + shippingCharge);

  const addToCart = (
    product: Product,
    size: string,
    color: { name: string; hex: string },
    qty: number = 1
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product?.id === product.id &&
          (item.selectedSize === size || item.size === size) &&
          (item.selectedColor?.name === color.name || item.color?.name === color.name)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${size}-${color.name}`,
          product,
          selectedSize: size,
          size,
          selectedColor: color,
          color,
          quantity: qty,
        };
        return [...prevCart, newItem];
      }
    });

    showToast(`Added "${product.name}" (${size}) to your bag`, 'success');
  };

  const removeFromCart = (itemIdOrProductId: string, size?: string, colorName?: string) => {
    let removedName = '';
    setCart((prev) =>
      prev.filter((item) => {
        const matchesDirectId = item.id === itemIdOrProductId;
        const matchesCompound =
          size !== undefined &&
          colorName !== undefined &&
          item.product?.id === itemIdOrProductId &&
          (item.selectedSize === size || item.size === size) &&
          (item.selectedColor?.name === colorName || item.color?.name === colorName);

        if (matchesDirectId || matchesCompound) {
          removedName = item.product?.name || 'Item';
          return false;
        }
        return true;
      })
    );

    if (removedName) {
      showToast(`Removed "${removedName}" from bag`, 'info');
    }
  };

  const updateQuantity = (
    itemIdOrProductId: string,
    quantityOrSize: number | string,
    colorName?: string,
    quantity?: number
  ) => {
    if (typeof quantityOrSize === 'number') {
      const newQty = quantityOrSize;
      if (newQty <= 0) {
        removeFromCart(itemIdOrProductId);
        return;
      }
      setCart((prev) =>
        prev.map((item) => (item.id === itemIdOrProductId ? { ...item, quantity: newQty } : item))
      );
      return;
    }

    const targetSize = quantityOrSize;
    const finalQty = quantity ?? 1;
    if (finalQty <= 0) {
      removeFromCart(itemIdOrProductId, targetSize, colorName);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product?.id === itemIdOrProductId &&
          (item.selectedSize === targetSize || item.size === targetSize) &&
          (item.selectedColor?.name === colorName || item.color?.name === colorName)
        ) {
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
    } catch {}
  };

  const validateCouponEligibility = (coupon: Coupon): CouponEligibility => {
    const minRequired = coupon.minOrderValue ?? (coupon as any).minPurchaseAmount ?? 0;
    const eligible = subtotal >= minRequired;
    const shortfall = Math.max(0, minRequired - subtotal);

    let potentialDiscount = 0;
    if (coupon.discountType === 'flat' && coupon.discountAmount) {
      potentialDiscount = Math.min(coupon.discountAmount, subtotal);
    } else {
      const pct = coupon.discountPercent ?? (coupon as any).discountPercentage ?? 0;
      potentialDiscount = Math.round((subtotal * pct) / 100);
      if (coupon.maxDiscount && potentialDiscount > coupon.maxDiscount) {
        potentialDiscount = coupon.maxDiscount;
      }
    }

    return {
      eligible,
      message: eligible
        ? `Saves ₹${potentialDiscount.toLocaleString('en-IN')}`
        : `Add ₹${shortfall.toLocaleString('en-IN')} more to unlock`,
      shortfall,
      potentialDiscount,
    };
  };

  const applyCoupon = (code: string, customPercent?: number): ApplyCouponResult => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      const res: ApplyCouponResult = { success: false, message: 'Please enter a coupon code.' };
      return res;
    }

    // Match against known coupons
    const match = availableCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive !== false
    );

    if (!match && customPercent === undefined) {
      const msg = `Promo code "${cleanCode}" is invalid or expired. Try ROYAL10 or WELCOME20.`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    const effectiveMin = match
      ? match.minOrderValue ?? (match as any).minPurchaseAmount ?? 0
      : 0;

    if (subtotal < effectiveMin) {
      const diff = effectiveMin - subtotal;
      const msg = `Coupon "${cleanCode}" requires a minimum order of ₹${effectiveMin.toLocaleString('en-IN')}. Add ₹${diff.toLocaleString('en-IN')} more to apply!`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    const discountPercent =
      customPercent !== undefined
        ? customPercent
        : match?.discountPercent ?? (match as any)?.discountPercentage ?? 10;
    const discountType = match?.discountType || 'percent';
    const discountAmount = match?.discountAmount;
    const maxDiscount = match?.maxDiscount;
    const description = match?.description || `${discountPercent}% off your order`;

    const couponInfo: AppliedCouponInfo = {
      code: cleanCode,
      discountPercent,
      discountType,
      discountAmount,
      minOrderValue: effectiveMin,
      maxDiscount,
      description,
      tag: match?.tag,
    };

    setAppliedCoupon(couponInfo);

    let savedAmount = 0;
    if (discountType === 'flat' && discountAmount) {
      savedAmount = Math.min(discountAmount, subtotal);
    } else {
      savedAmount = Math.round((subtotal * discountPercent) / 100);
      if (maxDiscount && savedAmount > maxDiscount) {
        savedAmount = maxDiscount;
      }
    }

    const successMsg = `Promo code "${cleanCode}" applied! You saved ₹${savedAmount.toLocaleString('en-IN')}.`;
    showToast(successMsg, 'success');

    return {
      success: true,
      message: successMsg,
      discountAmount: savedAmount,
      coupon: couponInfo,
    };
  };

  const removeCoupon = (suppressToast?: boolean) => {
    const prevCode = appliedCoupon?.code;
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
    } catch {}
    if (!suppressToast && prevCode) {
      showToast(`Coupon "${prevCode}" removed`, 'info');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingCharge,
        shipping: shippingCharge,
        discount,
        appliedCoupon,
        availableCoupons,
        applyCoupon,
        removeCoupon,
        total,
        freeShippingThreshold,
        couponRequirementMet,
        couponShortfall,
        couponWarning,
        validateCouponEligibility,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

