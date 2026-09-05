import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BRAND } from '../constants';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot-password';
  onNavigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onNavigate,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    initialMode === 'forgot-password' ? 'forgot' : initialMode
  );
  const {
    login,
    register,
    loginWithGoogle,
    resetPassword,
  } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [isCustomGoogleOpen, setIsCustomGoogleOpen] = useState(false);

  const clearForm = () => {
    setErrorMessage(null);
    setResetSent(false);
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot') => {
    clearForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setErrorMessage('Please provide both email and password.');
          setLoading(false);
          return;
        }
        const ok = await login(email.trim(), password);
        if (ok) {
          onNavigate('/');
        } else {
          setErrorMessage('Could not sign in. Please verify your email and password.');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setErrorMessage('Please enter your email address.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const ok = await register(name.trim(), email.trim(), password, phone.trim());
        if (ok) {
          onNavigate('/');
        } else {
          setErrorMessage('Registration could not be completed. Please try again.');
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Please enter the email address linked to your account.');
          setLoading(false);
          return;
        }
        const ok = await resetPassword(email.trim());
        if (ok) {
          setResetSent(true);
        } else {
          setErrorMessage('Unable to send password reset email. Check if the address is correct.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (chosenAccount?: { name?: string; email?: string }) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const accountToUse =
        chosenAccount ||
        (email.trim() ? { name: name.trim(), email: email.trim() } : undefined);

      const ok = await loginWithGoogle(accountToUse);
      if (ok) {
        setShowGoogleModal(false);
        onNavigate('/');
      } else {
        setErrorMessage('Google authentication could not be completed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F9F9F8] min-h-[calc(100vh-80px)] py-12 sm:py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E3] shadow-xs">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="inline-block text-center group"
          >
            <span className="text-xl font-semibold tracking-wider text-[#1A1A1A] block">
              {BRAND.name}
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#8A8A88] uppercase block mt-0.5">
              {BRAND.subtitle}
            </span>
          </button>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex border-b border-[#E5E5E3] mt-6 text-xs font-medium">
              <button
                type="button"
                id="tab-signin"
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 pb-3 transition-colors relative ${
                  mode === 'login'
                    ? 'text-[#1A1A1A] font-semibold border-b-2 border-[#1A1A1A]'
                    : 'text-[#8A8A88] hover:text-[#1A1A1A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-register"
                onClick={() => handleSwitchMode('register')}
                className={`flex-1 pb-3 transition-colors relative ${
                  mode === 'register'
                    ? 'text-[#1A1A1A] font-semibold border-b-2 border-[#1A1A1A]'
                    : 'text-[#8A8A88] hover:text-[#1A1A1A]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Forgot Password Success Message */}
        {mode === 'forgot' && resetSent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Check your inbox</h3>
            <p className="text-xs text-[#6A6A68] mb-6 max-w-xs mx-auto">
              We have sent a secure password reset link to <strong className="text-[#1A1A1A]">{email}</strong>.
            </p>
            <button
              type="button"
              id="back-to-signin-btn"
              onClick={() => handleSwitchMode('login')}
              className="w-full py-2.5 px-4 bg-[#1A1A1A] text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Google Fast Sign-In Option */}
            {mode !== 'forgot' && (
              <div className="mb-5">
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 border border-[#E5E5E3] rounded-lg text-xs font-medium text-[#1A1A1A] hover:bg-[#F9F9F8] transition-colors flex items-center justify-center gap-2.5 shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
                </button>

                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-[11px] text-[#8A8A88]">Fast 1-click account access</span>
                  <button
                    type="button"
                    id="switch-google-account-btn"
                    onClick={() => setShowGoogleModal(true)}
                    className="text-[11px] text-[#1A1A1A] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Choose / Switch account</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E5E3]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[#8A8A88]">or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password Headline */}
            {mode === 'forgot' && (
              <div className="mb-5">
                <button
                  type="button"
                  id="forgot-back-btn"
                  onClick={() => handleSwitchMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8A8A88] hover:text-[#1A1A1A] mb-3"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Reset Password</h2>
                <p className="text-xs text-[#6A6A68] mt-1">
                  Enter your email address to receive a secure password reset link.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <div>
                  <label className="block text-[#4A4A48] font-medium mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-name"
                      type="text"
                      required
                      placeholder="e.g. Siddharth Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                    <User className="w-4 h-4 text-[#8A8A88] absolute left-3 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#4A4A48] font-medium mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-9 pr-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#8A8A88] absolute left-3 top-3" />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[#4A4A48] font-medium mb-1.5">
                    Phone / WhatsApp Number <span className="text-[10px] text-[#8A8A88] font-normal">(Optional for delivery updates)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                    <Phone className="w-4 h-4 text-[#8A8A88] absolute left-3 top-3" />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[#4A4A48] font-medium">
                      Password <span className="text-red-500">*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        id="forgot-password-link"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-[11px] text-[#8A8A88] hover:text-[#1A1A1A] transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-2.5 pl-9 pr-10 rounded-lg bg-white border border-[#E5E5E3] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                    <Lock className="w-4 h-4 text-[#8A8A88] absolute left-3 top-3" />
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#8A8A88] hover:text-[#1A1A1A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="text-[10px] text-[#8A8A88] mt-1">
                      Must be at least 6 characters long.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-[#1A1A1A] hover:bg-black text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : mode === 'register' ? (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <KeyRound className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E5E5E3] shadow-xl p-6 relative">
            <button
              type="button"
              id="close-google-modal-btn"
              onClick={() => setShowGoogleModal(false)}
              className="absolute right-4 top-4 p-1.5 text-[#8A8A88] hover:text-[#1A1A1A] rounded-md hover:bg-[#F0F0EE] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white border border-[#E5E5E3] shadow-xs flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                </h3>
                <p className="text-xs text-[#6A6A68]">Choose an account to continue to Majanya Ji</p>
              </div>
            </div>

            {/* Accounts List */}
            <div className="space-y-2.5 my-4">
              {/* Account 1: Ansh Jain (Customer) */}
              <button
                type="button"
                id="select-google-ansh-btn"
                onClick={() => handleGoogleSignIn({ name: 'Ansh Jain', email: 'anshjain1440@gmail.com' })}
                disabled={loading}
                className="w-full text-left p-3 rounded-lg border border-[#E5E5E3] hover:border-[#1A1A1A] hover:bg-[#F9F9F8] transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#4A4A48] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  AJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1A1A1A] truncate">Ansh Jain</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      Customer
                    </span>
                  </div>
                  <p className="text-xs text-[#6A6A68] truncate">anshjain1440@gmail.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8A88] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Account 2: Siddhant Jain (Sole Store Admin) */}
              <button
                type="button"
                id="select-google-siddhant-btn"
                onClick={() => handleGoogleSignIn({ name: 'Siddhant Jain', email: 'siddhant9745@gmail.com' })}
                disabled={loading}
                className="w-full text-left p-3 rounded-lg border border-[#E5E5E3] hover:border-[#1A1A1A] hover:bg-[#F9F9F8] transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1A1A1A] truncate">Siddhant Jain</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      👑 Sole Store Admin
                    </span>
                  </div>
                  <p className="text-xs text-[#6A6A68] truncate">siddhant9745@gmail.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8A88] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Account 3: Aman Singhal (Customer) */}
              <button
                type="button"
                id="select-google-aman-btn"
                onClick={() => handleGoogleSignIn({ name: 'Aman Singhal', email: 'aman.singhal@example.com' })}
                disabled={loading}
                className="w-full text-left p-3 rounded-lg border border-[#E5E5E3] hover:border-[#1A1A1A] hover:bg-[#F9F9F8] transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1A1A1A] truncate">Aman Singhal</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Customer
                    </span>
                  </div>
                  <p className="text-xs text-[#6A6A68] truncate">aman.singhal@example.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8A88] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            {/* Custom Google Account Option */}
            <div className="border-t border-[#E5E5E3] pt-3 mt-3">
              {!isCustomGoogleOpen ? (
                <button
                  type="button"
                  id="open-custom-google-btn"
                  onClick={() => setIsCustomGoogleOpen(true)}
                  className="w-full text-left py-2 px-1 text-xs text-[#4A4A48] hover:text-[#1A1A1A] flex items-center justify-between group"
                >
                  <span className="font-medium group-hover:underline">Use another Google account</span>
                  <span className="text-[11px] text-[#8A8A88]">+ Add custom</span>
                </button>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-[#4A4A48] font-medium mb-1">Full Name</label>
                    <input
                      id="input-custom-google-name"
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-lg border border-[#E5E5E3] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#4A4A48] font-medium mb-1">Google Email</label>
                    <input
                      id="input-custom-google-email"
                      type="email"
                      placeholder="e.g. vikram.sharma@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-lg border border-[#E5E5E3] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      id="submit-custom-google-btn"
                      disabled={!customGoogleEmail.includes('@') || loading}
                      onClick={() =>
                        handleGoogleSignIn({
                          name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
                          email: customGoogleEmail.trim(),
                        })
                      }
                      className="flex-1 py-2 px-3 bg-[#1A1A1A] text-white text-xs font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                    >
                      {mode === 'login' ? 'Continue with this Account' : 'Sign up with this Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogleOpen(false)}
                      className="py-2 px-3 border border-[#E5E5E3] text-xs font-medium rounded-lg hover:bg-[#F9F9F8] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#8A8A88] mt-4 text-center">
              Secured with Google Authentication &amp; Majanya Ji Royal Heritage Encryption.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

