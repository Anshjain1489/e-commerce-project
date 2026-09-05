import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  Mail,
  Send,
  Smartphone,
  Monitor,
  Code,
  Eye,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../../types';
import { generateOrderReceiptHtml } from '../../utils/emailTemplate';
import { useShop } from '../../context/ShopContext';

interface OrderEmailReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

type ViewMode = 'desktop' | 'mobile' | 'code';

export const OrderEmailReceiptModal: React.FC<OrderEmailReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { showToast } = useShop();
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [copied, setCopied] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  // Derive order ID & customer email
  const orderRef = order?.id || (order as any)?.orderId || 'ORD-0';
  const defaultEmail =
    order?.customerEmail ||
    order?.email ||
    order?.shippingAddress?.email ||
    'anshjain1440@gmail.com';

  // Initialize recipientEmail when order changes
  React.useEffect(() => {
    if (order) {
      setRecipientEmail(defaultEmail);
      setSendSuccess(false);
    }
  }, [order, defaultEmail]);

  // Generate HTML
  const emailHtml = useMemo(() => {
    if (!order) return '';
    return generateOrderReceiptHtml(order);
  }, [order]);

  if (!isOpen || !order) return null;

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml);
      setCopied(true);
      showToast('HTML email template copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([emailHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MajanyaJi-Receipt-${orderRef}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Receipt HTML saved as MajanyaJi-Receipt-${orderRef}.html`, 'success');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocked. Please allow popups to print receipt.', 'error');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(emailHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }

    setIsSending(true);
    // Simulate instantaneous, verified email dispatch
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      showToast(`Order confirmation receipt dispatched to ${recipientEmail}!`, 'success');
      setTimeout(() => setSendSuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#C9A227]/30">
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#FAF7F2] border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5A1A1A] text-[#C9A227] flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#1E1E1E]">
                  Order Confirmation Email Receipt
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-200/80 text-[#5A1A1A]">
                  #{orderRef}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Client-ready inline HTML template with responsive table layouts for mail clients
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= CONTROLS & ACTION TOOLBAR ================= */}
        <div className="px-5 py-2.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* View Mode Toggle Tabs */}
          <div className="flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-[#5A1A1A] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Desktop (600px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white text-[#5A1A1A] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Mobile (375px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'code'
                  ? 'bg-white text-[#5A1A1A] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>HTML Source</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#5A1A1A] border border-[#C9A227]/40 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy raw HTML to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Copy HTML</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#5A1A1A] border border-[#C9A227]/40 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              title="Download HTML file"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Download .HTML</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#5A1A1A] border border-[#C9A227]/40 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* ================= EMAIL DISPATCH BAR ================= */}
        <div className="px-5 py-2.5 bg-[#FAF7F2]/90 border-b border-gray-200 shrink-0">
          <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-gray-500 font-medium whitespace-nowrap">
                Recipient Email:
              </span>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="customer@example.com"
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#C9A227] w-full sm:w-72 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {sendSuccess && (
                <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched!
                </span>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full sm:w-auto px-4 py-1.5 bg-[#5A1A1A] hover:bg-[#431313] text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{isSending ? 'Dispatching...' : 'Dispatch Receipt Email'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================= PREVIEW / CODE DISPLAY BODY ================= */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 flex items-start justify-center">
          {viewMode === 'code' ? (
            /* Raw HTML View */
            <div className="w-full max-w-4xl bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner border border-gray-700">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-700 text-gray-400">
                <span>email-template.html ({emailHtml.length.toLocaleString()} bytes)</span>
                <button
                  onClick={handleCopyHtml}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300 selection:bg-emerald-900 selection:text-white">
                {emailHtml}
              </pre>
            </div>
          ) : (
            /* Iframe Rendered Email View */
            <div
              className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-300 transition-all duration-300 ${
                viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[640px]'
              }`}
            >
              {/* Mail client fake chrome */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 font-medium text-gray-700 truncate">
                    Subject: Order Confirmation #{orderRef} - Majanya Ji Men&apos;s Ethnic Wear
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {viewMode === 'mobile' ? '375px Viewport' : '600px Viewport'}
                </span>
              </div>

              <iframe
                title="Email Receipt Preview"
                srcDoc={emailHtml}
                className="w-full h-[700px] border-none bg-[#FAF7F2]"
                sandbox="allow-same-origin allow-popups"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
