import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../appwrite/config';
import { ShoppingCart, LogOut, Menu, X, Search, User as UserIcon, ChevronRight } from 'lucide-react';
import logo from '../assets/bytecoreMall.jpg';

const Navbar = ({ user, cartCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const categories = [
    { name: "Electronics", path: "/products/electronics", icon: "🎧" },
    { name: "Fashion", path: "/products/fashion", icon: "👗" },
    { name: "Home & Kitchen", path: "/products/home", icon: "🏠" },
    { name: "Toys & Games", path: "/products/toys", icon: "🧸" },
    { name: "Beauty", path: "/products/beauty", icon: "💄" },
  ];

  return (
    <>
      <style>{`
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .ticker-t{display:flex;animation:ticker 30s linear infinite;white-space:nowrap}
        .ticker-item { display:flex; align-items:center; gap: 8px; font-weight: 700; font-size: 11px; padding-right: 48px; text-transform: uppercase; letter-spacing: 1px; }
        .logo-3d-shadow { box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.4); }
        .category-item:hover { transform: translateZ(20px) scale(1.05); }
      `}</style>
      
      {/* Ticker at the top */}
      <div className="w-full bg-[#cc181e] text-white py-2 overflow-hidden font-['Barlow_Condensed',sans-serif] hidden md:block">
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
      
      {/* Mobile Ticker */}
      <div className="w-full bg-[#cc181e] text-white py-2 overflow-hidden font-['Barlow_Condensed',sans-serif] md:hidden text-center text-[11px] font-black tracking-widest uppercase">
        📦 EVERYTHING ONLY AT ₹99
      </div>

      {/* Main Navbar */}
      <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-[5000] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          
          {/* LEFT: Categories Button (3D Animated) */}
          <div className="hidden lg:flex items-center flex-1 relative z-[5001]">
            <motion.button 
              whileHover={{ scale: 1.05, rotateY: 10 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-slate-300 transition-all group perspective-[1000px]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative">
                {isMobileMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
              </div>
              <span className="hidden lg:block font-black text-[13px] uppercase tracking-wider">Categories</span>
            </motion.button>
          </div>

          {/* CENTER: Logo (Shifts when Search is open) */}
          <motion.div 
            animate={{ 
              x: isSearchOpen ? (isMobile ? -40 : -100) : 0,
              scale: isSearchOpen ? 0.9 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 z-10"
          >
            <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
              {/* 3D Shopping Bag */}
              <div className="relative w-[42px] h-[48px] lg:w-[50px] lg:h-[58px] flex-shrink-0 perspective-[1000px]">
                <motion.div 
                  whileHover={{ rotateY: 20, rotateX: 10 }}
                  className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-br from-red-600 to-red-800 rounded-b-xl rounded-t-sm logo-3d-shadow flex items-center justify-center transform-gpu"
                >
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
                </motion.div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[18px] h-[10px] lg:w-[22px] lg:h-[14px] border-[3px] border-slate-900 border-b-0 rounded-t-full z-[-1]"></div>
                <div className="absolute top-[15%] -right-2 bg-yellow-400 text-black text-[9px] lg:text-[11px] font-black px-1.5 py-0.5 rounded shadow-sm rotate-12 z-10 font-['Barlow_Condensed',sans-serif] border border-black/10">
                  ₹99
                </div>
              </div>
              
              <div className="hidden sm:block">
                <div className="font-['Barlow_Condensed',sans-serif] font-black text-2xl lg:text-3xl leading-none tracking-tight text-slate-900">
                  BYTECORE'S
                </div>
                <div className="text-[10px] lg:text-[12px] tracking-[0.4em] text-red-600 font-black uppercase mt-0.5 flex items-center">
                  <span className="h-[2px] bg-red-600 flex-1 mr-2 opacity-30"></span>
                  MALL
                  <span className="h-[2px] bg-red-600 flex-1 ml-2 opacity-30"></span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* RIGHT: Search & Icons */}
          <div className="flex items-center justify-end gap-3 lg:gap-6 flex-1 z-20">
            
            {/* Search Animated Container */}
            <div className="flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0, x: 20 }}
                    animate={{ width: isMobile ? 180 : 300, opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: 20 }}
                    className="relative overflow-hidden"
                  >
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search items..." 
            <Link to="/cart" className="flex flex-col items-center gap-1 group text-slate-700 hover:text-red-600 transition-all">
              <div className="relative p-2 rounded-full group-hover:bg-red-50 transition-all">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
            </Link>
          </div>
          
          {/* Mobile Right Action (Simplified) */}
          <div className="lg:hidden flex items-center">
             <Link to="/cart" className="relative p-2">
                <ShoppingCart size={24} />
                {cartCount > 0 && <span className="absolute top-0 right-0 bg-red-600 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
             </Link>
          </div>

        </div>

        {/* 3D Category Drawer / Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-[1001]"
              />
              
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full w-[300px] bg-white z-[1002] shadow-2xl overflow-hidden flex flex-col perspective-[1000px]"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                      <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <span className="font-['Barlow_Condensed',sans-serif] font-black text-xl tracking-wider">CATEGORIES</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 py-6">
                  {categories.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -20, rotateY: -20 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link 
                        to={cat.path} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-red-50 hover:shadow-md transition-all group category-item"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="font-black text-slate-800 text-[14px] uppercase tracking-wide group-hover:text-red-600">{cat.name}</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                  
                  <div className="pt-8 space-y-4">
                    <div className="h-[1px] bg-slate-100 w-full" />
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 font-black text-[13px] uppercase tracking-[0.2em] text-slate-400 hover:text-red-600 transition-colors">View All Products</Link>
                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 font-black text-[13px] uppercase tracking-[0.2em] text-slate-400 hover:text-red-600 transition-colors">Contact Support</Link>
                  </div>
                </div>

                {user && (
                  <div className="p-6 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-50 text-red-600 font-black py-4 rounded-2xl uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
