import React, { useState, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  MapPin,
  ChevronDown,
  PhoneCall,
} from 'lucide-react';
import { BRAND } from '../../constants';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { AnnouncementBar } from './AnnouncementBar';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Kurta Pajama', path: '/category/kurta-pajama' },
    { name: 'Jacket Set', path: '/category/jacket-set' },
    { name: 'Indo Western', path: '/category/indo-western' },
    { name: 'Open Jodhpuri', path: '/category/open-jodhpuri' },
    { name: 'Shirts', path: '/category/shirts' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      <AnnouncementBar />

      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#E5E5E3] py-3'
            : 'bg-white border-b border-[#E5E5E3] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                id="mobile-menu-trigger"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#1A1A1A] hover:text-[#8A8A88] transition-colors focus:outline-none"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                id="mobile-search-btn"
                onClick={onOpenSearch}
                className="p-2 ml-1 text-[#1A1A1A] hover:text-[#8A8A88] transition-colors"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <button
                id="brand-logo-btn"
                onClick={() => handleLinkClick('/')}
                className="inline-flex flex-col items-center lg:items-start group text-left cursor-pointer"
              >
                <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.15em] text-[#1A1A1A] group-hover:opacity-80 transition-opacity">
                  {BRAND.name}
                </span>
                <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#8A8A88] font-medium uppercase -mt-0.5">
                  {BRAND.subtitle}
                </span>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.name}
                    id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleLinkClick(link.path)}
                    className={`relative py-1 text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#1A1A1A] font-semibold'
                        : 'text-[#8A8A88] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#1A1A1A]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              {/* Desktop Search */}
              <button
                id="desktop-search-trigger"
                onClick={onOpenSearch}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] text-xs text-[#8A8A88] hover:border-[#D1D1CF] hover:text-[#1A1A1A] transition-colors"
                aria-label="Search products"
              >
                <Search className="w-3.5 h-3.5 text-[#1A1A1A]" />
                <span className="hidden xl:inline">Search ethnic wear...</span>
              </button>

              {/* Wishlist Icon */}
              <button
                id="navbar-wishlist-btn"
                onClick={() => handleLinkClick('/wishlist')}
                className="relative p-2 text-[#1A1A1A] hover:text-[#8A8A88] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-medium bg-[#1A1A1A] text-white rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                id="navbar-cart-btn"
                onClick={() => handleLinkClick('/cart')}
                className="relative p-2 text-[#1A1A1A] hover:text-[#8A8A88] transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-medium bg-[#1A1A1A] text-white rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile Dropdown */}
              <div className="relative">
                <button
                  id="navbar-user-btn"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 p-2 text-[#1A1A1A] hover:text-[#8A8A88] transition-colors rounded-full hover:bg-[#F0F0EE]"
                  aria-label="User Account"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-3 h-3 text-[#8A8A88]" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E5E5E3] py-2 z-50 animate-in fade-in"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#E5E5E3] bg-[#F9F9F8]">
                          <p className="text-[11px] text-[#8A8A88]">Signed in as</p>
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{user.name}</p>
                          <p className="text-xs text-[#8A8A88] truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 bg-[#F0F0EE] text-[#1A1A1A] rounded-full border border-[#E5E5E3]">
                              Store Admin
                            </span>
                          )}
                        </div>

                        <button
                          id="dropdown-profile-link"
                          onClick={() => handleLinkClick('/profile')}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#F0F0EE] flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-[#8A8A88]" />
                          My Profile
                        </button>

                        <button
                          id="dropdown-orders-link"
                          onClick={() => handleLinkClick('/orders')}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#F0F0EE] flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#8A8A88]" />
                          My Orders
                        </button>

                        {isAdmin && (
                          <button
                            id="dropdown-admin-link"
                            onClick={() => handleLinkClick('/admin')}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#1A1A1A] bg-[#F0F0EE] hover:bg-[#E5E5E3] flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#1A1A1A]" />
                            Admin Dashboard
                          </button>
                        )}

                        <div className="border-t border-[#E5E5E3] my-1"></div>

                        <button
                          id="dropdown-logout-btn"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <div className="p-3 text-center">
                        <p className="text-xs text-[#8A8A88] mb-2.5 font-medium">Welcome to Majanya Ji</p>
                        <div className="flex gap-2">
                          <button
                            id="dropdown-login-btn"
                            onClick={() => handleLinkClick('/login')}
                            className="flex-1 py-1.5 px-3 text-xs font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-black transition-colors"
                          >
                            Sign In
                          </button>
                          <button
                            id="dropdown-register-btn"
                            onClick={() => handleLinkClick('/register')}
                            className="flex-1 py-1.5 px-3 text-xs font-medium border border-[#E5E5E3] text-[#1A1A1A] rounded-md hover:bg-[#F0F0EE] transition-colors"
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-In Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-0 mr-auto w-4/5 max-w-sm h-full bg-white shadow-xl flex flex-col z-10 border-r border-[#E5E5E3] overflow-y-auto">
            <div className="p-5 border-b border-[#E5E5E3] flex items-center justify-between bg-white text-[#1A1A1A]">
              <div>
                <span className="text-base font-semibold tracking-wider">
                  {BRAND.name}
                </span>
                <p className="text-[10px] text-[#8A8A88] tracking-[0.2em] font-medium uppercase">
                  {BRAND.subtitle}
                </p>
              </div>
              <button
                id="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#8A8A88] hover:text-[#1A1A1A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 py-4 px-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleLinkClick(link.path)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[#F0F0EE] text-[#1A1A1A] font-semibold'
                        : 'text-[#8A8A88] hover:bg-[#F9F9F8] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-[#E5E5E3] mt-4 space-y-2">
                <button
                  onClick={() => handleLinkClick('/store-location')}
                  className="w-full text-left px-4 py-2 text-xs text-[#1A1A1A] font-medium flex items-center gap-2 hover:bg-[#F0F0EE] rounded"
                >
                  <MapPin className="w-4 h-4 text-[#8A8A88]" />
                  Visit Indore Retail Store
                </button>

                <a
                  href={BRAND.phoneLink}
                  className="w-full text-left px-4 py-2 text-xs text-[#8A8A88] hover:text-[#1A1A1A] font-medium flex items-center gap-2 hover:bg-[#F0F0EE] rounded"
                >
                  <PhoneCall className="w-4 h-4 text-[#8A8A88]" />
                  Call Siddhant Jain (+91 7067299101)
                </a>

                {isAdmin && (
                  <button
                    onClick={() => handleLinkClick('/admin')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-white bg-[#1A1A1A] rounded flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    Admin Dashboard
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Footer Auth */}
            <div className="p-4 border-t border-[#E5E5E3] bg-[#F9F9F8]">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#1A1A1A]">{user.name}</p>
                    <p className="text-[10px] text-[#8A8A88]">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-600 font-medium hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLinkClick('/login')}
                    className="w-full py-2 text-xs font-medium text-center bg-[#1A1A1A] text-white rounded"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="w-full py-2 text-xs font-medium text-center border border-[#E5E5E3] text-[#1A1A1A] rounded bg-white"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
