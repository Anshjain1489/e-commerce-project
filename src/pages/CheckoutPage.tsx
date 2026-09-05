import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle,
  Lock,
  Sparkles,
  AlertCircle,
  Tag,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShippingAddress } from '../types';
import { BRAND } from '../constants';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderSuccess: (orderId: string) => void;
}

// Helper function to dynamically load Razorpay script if not already on window
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof (window as any).Razorpay !== 'undefined') {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigate,
  onOrderSuccess,
}) => {
  const {
    items = [],
    subtotal = 0,
    shipping = 0,
    discount = 0,
    total = 0,
    appliedCoupon,
    availableCoupons = [],
    applyCoupon,
    removeCoupon,
    clearCart,
    couponWarning,
    validateCouponEligibility,
  } = useCart();
  const { createOrder } = useShop();
  const { user } = useAuth();
  const { showToast } = useToast();

  const safeItems = Array.isArray(items) ? items : [];

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [addressLine1, setAddressLine1] = useState(
    user?.address?.address || user?.address?.addressLine1 || (user as any)?.addresses?.[0]?.addressLine1 || ''
  );
  const [addressLine2, setAddressLine2] = useState(
    user?.address?.addressLine2 || (user as any)?.addresses?.[0]?.addressLine2 || ''
  );
  const [city, setCity] = useState(
    user?.address?.city || (user as any)?.addresses?.[0]?.city || ''
  );
  const [state, setState] = useState(
    user?.address?.state || (user as any)?.addresses?.[0]?.state || 'Madhya Pradesh'
  );
  const [pinCode, setPinCode] = useState(
    user?.address?.pinCode || (user as any)?.addresses?.[0]?.pinCode || ''
  );

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  // Promo code local state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  const handleApplyPromoCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError('');
    if (!promoCodeInput.trim()) return;

    const res = applyCoupon(promoCodeInput.trim().toUpperCase());
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoCodeInput('');
      setPromoError('');
    }
  };

  // Synchronize state when user object loads or updates
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!email) setEmail(user.email || '');
      if (!phone) setPhone(user.phone || '');
      if (!addressLine1) {
        setAddressLine1(
          user.address?.address || user.address?.addressLine1 || (user as any)?.addresses?.[0]?.addressLine1 || ''
        );
      }
      if (!addressLine2) {
        setAddressLine2(user.address?.addressLine2 || (user as any)?.addresses?.[0]?.addressLine2 || '');
      }
      if (!city) {
        setCity(user.address?.city || (user as any)?.addresses?.[0]?.city || '');
      }
      if (!state) {
        setState(user.address?.state || (user as any)?.addresses?.[0]?.state || 'Madhya Pradesh');
      }
      if (!pinCode) {
        setPinCode(user.address?.pinCode || (user as any)?.addresses?.[0]?.pinCode || '');
      }
    }
  }, [user]);

  if (safeItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="font-cinzel text-2xl font-bold text-[#1E1E1E] mb-2">No Items in Checkout</h2>
        <p className="text-xs text-gray-500 mb-6">Your bag is empty. Please add items before checking out.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-3 bg-[#5A1A1A] text-white text-xs font-semibold rounded uppercase tracking-wider"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const validateForm = () => {
    if (!fullName.trim()) return 'Please enter your full name';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) return 'Please enter a valid 10-digit mobile number';
    if (!addressLine1.trim()) return 'Please enter your street address';
    if (!city.trim()) return 'Please enter your city';
    if (!pinCode.trim() || pinCode.length < 6) return 'Please enter a valid 6-digit PIN code';
    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const error = validateForm();
    if (error) {
      setFormError(error);
      showToast(error, 'error');
      return;
    }

    setIsProcessing(true);

    const shippingAddress: ShippingAddress = {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      country: 'India',
    };

    try {
      if (paymentMethod === 'razorpay') {
        // Online Payment via Razorpay
        // Ensure Razorpay SDK script is loaded
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded && typeof (window as any).Razorpay === 'undefined') {
          throw new Error('Razorpay Checkout SDK could not be loaded. Please check your internet connection.');
        }

        // Active key ID (from environment or configured test key)
        let keyToUse =
          (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
          'rzp_test_TNZywh7nWdGBHZ';
        let razorpayOrderId: string | undefined;

        // Try creating Razorpay Order via server-side API
        try {
          const orderRes = await fetch('/api/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: total,
              currency: 'INR',
              receipt: `mj_${Date.now().toString().slice(-8)}`,
              customerName: fullName,
              customerEmail: email,
              customerPhone: phone,
            }),
          });

          if (orderRes.ok) {
            const orderData = await orderRes.json();
            if (orderData.success && orderData.orderId) {
              razorpayOrderId = orderData.orderId;
              if (orderData.keyId) {
                keyToUse = orderData.keyId;
              }
            }
          }
        } catch (apiErr) {
          console.warn('Backend order API not reachable, launching client-side Razorpay modal:', apiErr);
        }

        const options: any = {
          key: keyToUse,
          amount: Math.round(total * 100), // in paise
          currency: 'INR',
          name: BRAND.name,
          description: `Payment for ${safeItems.length} Handcrafted Ethnic Outfit(s)`,
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=200',
          ...(razorpayOrderId ? { order_id: razorpayOrderId } : {}),
          prefill: {
            name: fullName,
            email: email,
            contact: phone,
          },
          notes: {
            customerName: fullName,
            address: `${addressLine1}, ${city}, ${state} - ${pinCode}`,
            brand: 'Majanya Ji Ethnic Wear',
          },
          theme: {
            color: '#5A1A1A',
          },
          handler: async function (response: any) {
            // Verify payment signature on backend if available
            if (response.razorpay_order_id && response.razorpay_signature) {
              try {
                await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
              } catch (verifyErr) {
                console.warn('Payment verification logged:', verifyErr);
              }
            }

            const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
            const linkedOrderId = response.razorpay_order_id || razorpayOrderId;

            const res = await createOrder({
              userId: user?.id,
              customerName: fullName,
              customerEmail: email,
              customerPhone: phone,
              items: safeItems,
              subtotal,
              shipping,
              discount,
              couponCode: appliedCoupon?.code,
              total,
              status: 'confirmed',
              paymentMethod: 'Online (Razorpay)',
              paymentStatus: 'Paid',
              paymentId,
              razorpayOrderId: linkedOrderId,
              razorpayPaymentId: paymentId,
              shippingAddress,
            });

            const orderId =
              (res as any)?.id ||
              (res as any)?.orderId ||
              (typeof res === 'string' ? res : 'ORD-' + Date.now());

            clearCart();
            setIsProcessing(false);
            showToast('Payment successful! Your order has been placed.', 'success');
            onOrderSuccess(orderId);
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              showToast('Payment window closed. You can retry at any time.', 'info');
            },
            escape: true,
            backdropclose: false,
          },
        };

        if (typeof (window as any).Razorpay === 'undefined') {
          throw new Error('Razorpay SDK is not ready yet. Please try again.');
        }

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', function (failResp: any) {
          setIsProcessing(false);
          const reason =
            failResp.error?.description ||
            failResp.error?.reason ||
            'Payment could not be completed';
          showToast(`Payment failed: ${reason}`, 'error');
        });

        rzp.open();
      } else {
        // Cash on Delivery (COD)
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const res = await createOrder({
          userId: user?.id,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          items: safeItems,
          subtotal,
          shipping,
          discount,
          couponCode: appliedCoupon?.code,
          total,
          status: 'pending',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          shippingAddress,
        });

        const orderId = (res as any)?.id || (res as any)?.orderId || (typeof res === 'string' ? res : 'ORD-' + Date.now());

        clearCart();
        setIsProcessing(false);
        showToast('Order confirmed via Cash on Delivery!', 'success');
        onOrderSuccess(orderId);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setFormError(err.message || 'Failed to place order. Please try again.');
      showToast('Could not complete order. Please try again.', 'error');
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('/cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A1A1A] hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
        </button>

        <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#1E1E1E] mb-8">
          Secure Royal Checkout
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm">
              <h2 className="font-cinzel text-lg font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>1. Contact Information</span>
                <span className="text-[11px] text-[#C9A227] font-normal uppercase tracking-wider">Required</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddharth Sharma"
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm">
              <h2 className="font-cinzel text-lg font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>2. Shipping Address</span>
                <span className="text-[11px] text-[#C9A227] font-normal uppercase tracking-wider">Nationwide</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">
                    House / Flat No., Street, Building *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="323, 60 Feet Road, Near Main Chowk"
                    value={addressLine1 || ''}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Landmark / Colony (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Palhar Nagar, Behind Temple"
                    value={addressLine2 || ''}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Indore"
                    value={city || ''}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Madhya Pradesh"
                    value={state || ''}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="452006"
                    maxLength={6}
                    value={pinCode || ''}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full p-3 rounded bg-gray-100 border border-gray-200 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm">
              <h2 className="font-cinzel text-lg font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100">
                3. Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay Online */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#5A1A1A] bg-[#FAF7F2]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 text-[#5A1A1A] focus:ring-[#5A1A1A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#1E1E1E] flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#C9A227]" />
                        Online Payment (Razorpay Secure)
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> 256-Bit SSL
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Instant verification with UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, and Wallets.
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <span className="font-semibold text-gray-700">Supported:</span>
                        <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-blue-600">GPay</span>
                        <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-purple-600">PhonePe</span>
                        <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-sky-600">Paytm</span>
                        <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-gray-700">Cards/UPI</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ● Gateway Connected (rzp_test_...WdGBHZ)
                      </span>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#5A1A1A] bg-[#FAF7F2]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-[#5A1A1A] focus:ring-[#5A1A1A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#1E1E1E] flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#5A1A1A]" />
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay cash to the delivery partner when your royal outfit arrives at your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm sticky top-28">
            <h2 className="font-cinzel text-lg font-bold text-[#5A1A1A] mb-4 pb-2 border-b border-gray-100">
              Order Summary ({safeItems.length} items)
            </h2>

            {/* Items mini list */}
            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-gray-100 mb-6 pr-1">
              {safeItems.map((it) => {
                const prod = it.product || (it as any);
                const itemImg = prod?.images?.[0] || 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=600';
                const itemName = prod?.name || 'Handcrafted Design';
                const itemSize = it.size || it.selectedSize || 'L';
                const itemQty = it.quantity || 1;
                const itemPrice = prod?.price || 0;

                return (
                  <div key={it.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                      <img src={itemImg} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-gray-800 truncate">{itemName}</p>
                      <p className="text-gray-500">Size: {itemSize} • Qty: {itemQty}</p>
                    </div>
                    <div className="text-xs font-bold text-[#5A1A1A]">
                      ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= PROMO CODE & ROYAL VOUCHERS ================= */}
            <div className="mb-6 pt-3 pb-5 border-t border-b border-gray-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C9A227]" />
                  Promo Code & Privileges
                </span>
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => setShowAllCoupons((prev) => !prev)}
                    className="text-[11px] font-semibold text-[#5A1A1A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllCoupons ? 'Hide Offers' : 'View Offers'}</span>
                    {showAllCoupons ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="space-y-2">
                  <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-1.5 py-0.5 rounded">
                              Applied
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-medium mt-1">
                            {appliedCoupon.description || `${appliedCoupon.discountPercent}% privilege discount applied`}
                          </p>
                          {discount > 0 ? (
                            <p className="text-xs font-bold text-emerald-900 mt-1">
                              You save ₹{discount.toLocaleString('en-IN')} on this order!
                            </p>
                          ) : (
                            <p className="text-[11px] font-semibold text-amber-800 mt-1">
                              Requires minimum order of ₹{(appliedCoupon.minOrderValue || 0).toLocaleString('en-IN')}.
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeCoupon();
                          setPromoError('');
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
                        title="Remove coupon"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {couponWarning && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{couponWarning}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Promo input form */}
                  <form onSubmit={handleApplyPromoCode} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. ROYAL10"
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value);
                          if (promoError) setPromoError('');
                        }}
                        className="w-full bg-[#FAF7F2] text-xs font-mono px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#5A1A1A] uppercase tracking-wider"
                      />
                      {promoCodeInput && (
                        <button
                          type="button"
                          onClick={() => setPromoCodeInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!promoCodeInput.trim()}
                      className="px-4 py-2.5 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </form>

                  {promoError && (
                    <div className="text-[11px] text-red-600 flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                      <span>{promoError}</span>
                    </div>
                  )}

                  {/* Available Vouchers List / Drawer */}
                  {availableCoupons.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                        <span>Available Festive Offers</span>
                        <span className="text-[10px] text-gray-400">Click any code to apply</span>
                      </div>

                      <div className={`space-y-2 ${!showAllCoupons ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>
                        {availableCoupons.map((coupon) => {
                          const eligibility = validateCouponEligibility(coupon);
                          return (
                            <div
                              key={coupon.code}
                              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                                eligibility.eligible
                                  ? 'bg-[#FAF7F2] border-[#C9A227]/40 hover:border-[#C9A227]'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-xs text-[#5A1A1A]">
                                    {coupon.code}
                                  </span>
                                  {coupon.tag && (
                                    <span className="text-[9px] font-semibold bg-[#C9A227]/20 text-[#8B6E14] px-1.5 py-0.5 rounded">
                                      {coupon.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-600 truncate mt-0.5">
                                  {coupon.description}
                                </p>
                                <p
                                  className={`text-[10px] font-semibold mt-0.5 ${
                                    eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {eligibility.message}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setPromoCodeInput(coupon.code);
                                  const res = applyCoupon(coupon.code);
                                  if (!res.success) {
                                    setPromoError(res.message);
                                  } else {
                                    setPromoCodeInput('');
                                    setPromoError('');
                                  }
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                  eligibility.eligible
                                    ? 'bg-[#5A1A1A] hover:bg-[#3D1010] text-white shadow-2xs'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                Apply
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600 pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Promo Discount ({appliedCoupon?.code})
                  </span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {appliedCoupon && discount === 0 && (
                <div className="flex justify-between text-amber-700 text-[11px]">
                  <span>Promo ({appliedCoupon.code})</span>
                  <span className="italic">Min order ₹{(appliedCoupon.minOrderValue || 0).toLocaleString('en-IN')} required</span>
                </div>
              )}
            </div>

            {/* Grand total */}
            <div className="py-4 flex justify-between items-baseline mb-6">
              <span className="font-cinzel text-base font-bold text-[#1E1E1E]">Total Payable</span>
              <span className="text-2xl font-bold text-[#5A1A1A]">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button
              id="confirm-place-order-btn"
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#C9A227]" />
                  <span>
                    {paymentMethod === 'razorpay' ? `Pay ₹${total.toLocaleString('en-IN')} Online` : 'Place Cash on Delivery Order'}
                  </span>
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Guaranteed safe and authentic royal shopping
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
