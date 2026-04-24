import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../appwrite/config';
import { ShoppingCart, LogOut, Menu, X, Search, User as UserIcon } from 'lucide-react';

const Navbar = ({ user, cartCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <style>{`
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .ticker-t{display:flex;animation:ticker 30s linear infinite;white-space:nowrap}
        .ticker-item { display:flex; align-items:center; gap: 8px; font-weight: 500; font-size: 11px; padding-right: 48px; }
      `}</style>
      
      {/* Ticker at the top */}
      <div className="w-full bg-[#111] text-white py-1.5 overflow-hidden font-['Segoe_UI',Arial,sans-serif] hidden md:block">
        <div className="ticker-t">
          {[0,1,2,3].map(k => (
            <div key={k} className="flex items-center">
              <span className="ticker-item"><span>📦</span> FREE DELIVERY on orders above ₹499</span>
              <span className="ticker-item"><span>⏱️</span> Everything Only at ₹99</span>
              <span className="ticker-item"><span>🎧</span> 24/7 Customer Support</span>
              <span className="ticker-item"><span>📱</span> Download App</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile Ticker (simplified) */}
      <div className="w-full bg-[#111] text-white py-1.5 overflow-hidden font-['Segoe_UI',Arial,sans-serif] md:hidden text-center text-[10px] font-medium tracking-wide">
        📦 FREE DELIVERY on orders above ₹499
      </div>

      {/* Main Navbar */}
      <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm font-['Segoe_UI',Arial,sans-serif]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-between">
          
          {/* LEFT: Categories / Hamburger */}
          <div className="flex items-center flex-1">
            <button 
              className="flex items-center gap-2 bg-none border-none cursor-pointer text-slate-800 hover:text-red-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} strokeWidth={2.5} />
              <span className="hidden lg:block font-bold text-[15px]">Categories</span>
            </button>
          </div>

          {/* CENTER: Logo Component matching Image 2 */}
          <Link to="/" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 flex-shrink-0 cursor-pointer group">
            {/* 3D Shopping Bag CSS Art */}
            <div className="relative w-[48px] h-[54px] lg:w-[60px] lg:h-[68px] flex-shrink-0">
              <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-br from-red-500 to-red-800 rounded-b-lg rounded-t-sm shadow-md flex items-center justify-center transform group-hover:-translate-y-1 transition-transform">
                <span className="font-['Barlow_Condensed',sans-serif] font-black text-3xl lg:text-[40px] text-white leading-none -ml-1">B</span>
              </div>
              {/* Bag Handles */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[12px] lg:w-[26px] lg:h-[16px] border-[3px] lg:border-[4px] border-slate-800 border-b-0 rounded-t-full z-[-1]"></div>
              {/* Price Tag */}
              <div className="absolute top-[20%] -right-3 bg-white text-red-600 text-[10px] lg:text-[12px] font-black px-1.5 py-0.5 rounded shadow-md border border-red-200 rotate-12 z-10 font-['Barlow_Condensed',sans-serif]">
                ₹99
              </div>
            </div>
            
            {/* Logo Text */}
            <div className="text-center sm:text-left mt-1 sm:mt-0">
              <div className="font-['Barlow_Condensed',sans-serif] font-black text-2xl lg:text-4xl leading-none tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                BYTECORE'S
              </div>
              <div className="flex items-center justify-center sm:justify-between w-full mt-0.5">
                <div className="h-[2px] bg-red-600 w-full hidden sm:block mr-2"></div>
                <div className="text-[12px] lg:text-[14px] tracking-[0.4em] text-red-600 font-bold uppercase whitespace-nowrap">MALL</div>
                <div className="h-[2px] bg-red-600 w-full hidden sm:block ml-2"></div>
              </div>
            </div>
          </Link>

          {/* RIGHT: Icons */}
          <div className="flex items-center justify-end gap-5 lg:gap-8 flex-1">
            {/* Search */}
            <button className="flex flex-col items-center gap-1 cursor-pointer text-slate-700 hover:text-red-600 transition-colors">
              <Search size={24} strokeWidth={2} />
              <span className="text-[11px] font-semibold hidden sm:block">Search</span>
            </button>

            {/* Account */}
            {user ? (
              <Link to={user?.labels?.includes('admin') ? '/admin' : '/profile'} className="flex flex-col items-center gap-1 cursor-pointer text-slate-700 hover:text-red-600 transition-colors">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-red-600 text-white">
                  {user.name[0]}
                </div>
                <span className="text-[11px] font-semibold hidden sm:block">Profile</span>
              </Link>
            ) : (
              <Link to="/login" className="flex flex-col items-center gap-1 cursor-pointer text-slate-700 hover:text-red-600 transition-colors">
                <UserIcon size={24} strokeWidth={2} />
                <span className="text-[11px] font-semibold hidden sm:block">Account</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="flex flex-col items-center gap-1 cursor-pointer text-slate-700 hover:text-red-600 transition-colors relative">
              <div className="relative">
                <ShoppingCart size={24} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold hidden sm:block">Cart</span>
            </Link>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-white border-t border-gray-100 overflow-hidden lg:hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                <form className="flex w-full mb-2">
                  <input type="text" placeholder="Search ₹99 products..." className="flex-1 bg-slate-100 border border-slate-200 rounded-l-md px-4 py-3 text-sm outline-none focus:border-red-500" />
                  <button className="bg-red-600 text-white px-4 rounded-r-md font-bold text-sm">Search</button>
                </form>
                <Link to="/products" className="font-bold text-slate-800 py-2 border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
                <Link to="/products/electronics" className="font-bold text-slate-800 py-2 border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Electronics</Link>
                <Link to="/products/fashion" className="font-bold text-slate-800 py-2 border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>Fashion</Link>
                <Link to="/contact" className="font-bold text-slate-800 py-2" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                {user && (
                  <button onClick={handleLogout} className="font-bold text-red-600 py-2 text-left w-full border-t border-slate-100 mt-2">Logout</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
