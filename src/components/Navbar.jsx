import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Menu, X, ShoppingCart } from 'lucide-react';
import logo from '../assets/bytecoreMall.png';

const Navbar = ({ cartCount, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Top Bar - Desktop Only */}
      <div className="hidden lg:block w-full bg-slate-900 text-white py-2 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Free Shipping Over ₹999</span>
            <span>Easy Returns & Exchange</span>
          </div>
          <div className="flex gap-6 opacity-70">
            <span>Track Order</span>
            <span>Support</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`w-full bg-white border-b border-slate-100 sticky top-0 z-[5000] shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3 lg:py-4'}`}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between">
          
          {/* LEFT: Categories Button (Desktop Only) */}
          <div className="hidden lg:flex items-center flex-1 relative z-[5001]">
            <motion.button 
              whileHover={{ scale: 1.05, rotateY: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:shadow-red-500/20 transition-all group"
            >
              <Menu size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-black text-xs uppercase tracking-widest">Explore Shop</span>
            </motion.button>
          </div>

          {/* CENTER: Logo (Responsive) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 z-[5001]"
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="relative w-[45px] h-[45px] lg:w-[55px] lg:h-[55px] flex items-center justify-center">
                <motion.div 
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

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end gap-3 lg:gap-6 flex-1 z-[5001]">
            
            {/* Desktop Only Icons */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/login" className="flex flex-col items-center gap-1 group text-slate-700 hover:text-red-600 transition-all">
                <div className="relative p-2 rounded-full group-hover:bg-red-50 transition-all">
                  <User size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
              </Link>
              
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
            
            {/* Mobile Only Logo (Simplified) */}
            <div className="lg:hidden flex items-center">
               <Link to="/cart" className="relative p-2">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {cartCount}
                    </span>
                  )}
               </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[6000]"
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[6001] shadow-2xl overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-12">
                   <div className="font-black text-2xl tracking-tighter">CATEGORIES</div>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   {['ELECTRONICS', 'FASHION', 'HOME & DECOR', 'KITCHEN', 'BEST SELLERS', 'UNDER ₹99'].map((item) => (
                     <Link 
                       key={item} 
                       to="/products" 
                       onClick={() => setIsMobileMenuOpen(false)}
                       className="block text-2xl font-black text-slate-900 hover:text-red-600 transition-all tracking-tighter"
                     >
                       {item}
                     </Link>
                   ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100">
                   <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <User size={20} />
                      </div>
                      <div className="font-black text-sm">LOGIN / SIGNUP</div>
                   </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
