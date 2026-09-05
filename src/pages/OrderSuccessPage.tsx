import React, { useState } from 'react';
import {
  CheckCircle,
  Truck,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Package,
  Calendar,
  MapPin,
  Mail,
  FileText,
  Download,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BRAND } from '../constants';
import { OrderEmailReceiptModal } from '../components/orders/OrderEmailReceiptModal';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderId,
  onNavigate,
}) => {
  const { orders } = useShop();
  const [emailReceiptOpen, setEmailReceiptOpen] = useState(false);

  const order = orders.find((o) => o.id === orderId || (o as any).orderId === orderId) || orders[0];
  const orderRef = order?.id || (order as any)?.orderId || orderId;

  const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const whatsappNotificationUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
    `Hello Siddhant Ji, I have placed order #${orderRef} on Majanya Ji Ethnic Wear. Please confirm dispatch details.`
  )}`;

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-[#C9A227]/30 shadow-xl overflow-hidden p-6 sm:p-10 text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C9A227] block mb-1">
            Majanya Ji Order Confirmed
          </span>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#1E1E1E] mb-3">
            Order Successfully Placed!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Thank you for trusting Majanya Ji Ethnic Wear. Your handcrafted garments are being prepared at our Indore atelier.
          </p>

          {/* Key order pills */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#C9A227]/20 flex flex-wrap items-center justify-around gap-4 text-xs mb-6">
            <div>
              <span className="text-gray-500 block text-[11px]">Order Reference</span>
              <strong className="text-[#5A1A1A] font-mono text-sm">#{orderId}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Payment Mode</span>
              <strong className="text-gray-800 uppercase">
                {order?.paymentMethod === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Est. Nationwide Delivery</span>
              <strong className="text-emerald-700">{estimatedDelivery}</strong>
            </div>
          </div>

          {/* Email Receipt Confirmation & Preview Card */}
          <div className="bg-gradient-to-r from-[#FAF7F2] to-white border border-[#C9A227]/40 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left mb-6 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#5A1A1A] text-[#C9A227] flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1E1E1E]">
                    Order Confirmation Receipt Ready
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                    HTML Generated
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Formatted for desktop & mobile mail clients with complete line items, pricing, and atelier notes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setEmailReceiptOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#5A1A1A] hover:bg-[#431313] text-[#FAF7F2] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>View &amp; Save Receipt</span>
              </button>
            </div>
          </div>

          {/* WhatsApp connect CTA */}
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left mb-8">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-[#25D366] shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#1E1E1E]">Get Live Updates on WhatsApp</h4>
                <p className="text-[11px] text-gray-600">Connect with Siddhant Jain for live dispatch and tracking updates.</p>
              </div>
            </div>
            <a
              href={whatsappNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg shadow hover:bg-[#20bd5a] transition-colors shrink-0"
            >
              Notify on WhatsApp
            </a>
          </div>

          {/* Items Purchased List */}
          {((order?.items && order.items.length > 0) || (order as any)?.products) && (
            <div className="text-left border-t border-gray-100 pt-6 mb-8">
              <h3 className="font-cinzel text-sm font-bold text-[#5A1A1A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C9A227]" />
                Purchased Creations
              </h3>

              <div className="divide-y divide-gray-100">
                {(order?.items || (order as any)?.products || []).map((item: any, idx: number) => {
                  const prod = item.product || item;
                  const itemImg = prod?.images?.[0] || item.productImage || 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=600';
                  const itemName = prod?.name || item.productName || 'Handcrafted Ethnic Wear';
                  const itemSize = item.size || item.selectedSize || 'L';
                  const qty = item.quantity || 1;
                  const price = prod?.price || item.price || 0;

                  return (
                    <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                          <img src={itemImg} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{itemName}</p>
                          <p className="text-gray-500">Size: {itemSize} • Qty: {qty}</p>
                        </div>
                      </div>
                      <div className="font-bold text-[#5A1A1A]">
                        ₹{(price * qty).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping destination */}
          {order?.shippingAddress && (
            <div className="text-left border-t border-gray-100 pt-6 mb-8 text-xs text-gray-600">
              <h3 className="font-cinzel text-sm font-bold text-[#5A1A1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                Delivery Address
              </h3>
              <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          )}

          {/* Navigation CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => onNavigate('/shop')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227]" />
            </button>

            <button
              onClick={() => setEmailReceiptOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#FAF7F2] border border-[#C9A227] text-[#5A1A1A] hover:bg-[#F3ECE1] font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Mail className="w-4 h-4 text-[#C9A227]" />
              <span>View Email Receipt</span>
            </button>

            <button
              onClick={() => onNavigate('/orders')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>

      {/* Email Receipt Modal */}
      <OrderEmailReceiptModal
        isOpen={emailReceiptOpen}
        onClose={() => setEmailReceiptOpen(false)}
        order={order}
      />
    </div>
  );
};
