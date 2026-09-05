import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, LogOut, Package, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.address?.address || user?.address?.addressLine1 || '');
  const [city, setCity] = useState(user?.address?.city || 'Indore');
  const [state, setState] = useState(user?.address?.state || 'Madhya Pradesh');
  const [pinCode, setPinCode] = useState(user?.address?.pinCode || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddressLine1(user.address?.address || user.address?.addressLine1 || '');
      setCity(user.address?.city || 'Indore');
      setState(user.address?.state || 'Madhya Pradesh');
      setPinCode(user.address?.pinCode || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Account Required</h2>
        <p className="text-xs text-[#8A8A88] mb-6">Please sign in to view and manage your profile details.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      address: {
        fullName: name,
        phone,
        email: user.email,
        address: addressLine1,
        addressLine1,
        city,
        state,
        pinCode,
        country: 'India',
        isDefault: true,
      },
    });
    setIsSaved(true);
    showToast('Profile updated successfully!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full bg-[#F9F9F8] min-h-[calc(100vh-80px)] py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E3] shadow-xs">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E3] mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-lg font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#1A1A1A]">
                  {user.name}
                </h1>
                <p className="text-xs text-[#8A8A88]">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-[#F0F0EE] text-[#1A1A1A] border border-[#E5E5E3] rounded-md">
                    👑 Store Administrator
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/orders')}
                className="px-3.5 py-2 border border-[#E5E5E3] text-[#1A1A1A] hover:bg-[#F9F9F8] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Package className="w-4 h-4 text-[#8A8A88]" />
                <span>My Orders</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className="px-3.5 py-2 bg-[#1A1A1A] text-white hover:bg-black rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#4A4A48] font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#4A4A48] font-medium mb-1.5">Mobile / WhatsApp Number</label>
                <input
                  type="tel"
                  value={phone || ''}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E3]">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                Default Delivery Address
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[#4A4A48] font-medium mb-1.5">Address Line</label>
                  <input
                    type="text"
                    placeholder="House/Street/Area"
                    value={addressLine1 || ''}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#4A4A48] font-medium mb-1.5">City</label>
                    <input
                      type="text"
                      value={city || ''}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A4A48] font-medium mb-1.5">State</label>
                    <input
                      type="text"
                      value={state || ''}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4A4A48] font-medium mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      value={pinCode || ''}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E5E3] flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-medium rounded-lg text-xs transition-colors shadow-2xs"
              >
                {isSaved ? 'Changes Saved ✓' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onNavigate('/');
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

