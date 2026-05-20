import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Search, MapPin
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/react';

const Navbar = ({ cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;
  const textColor = isTransparent ? 'text-white' : 'text-slate-900';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[5000] transition-all duration-300 ${
      isScrolled ? 'py-2' : isHome ? 'py-4 lg:py-6' : 'py-4'
    }`}>
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12">
        <div className={`relative flex items-center justify-between rounded-full lg:rounded-full px-6 lg:px-10 h-16 lg:h-20 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border border-slate-200' 
            : 'bg-transparent'
        }`}>
          
          {/* Logo Section */}
          <Link to="/" className={`text-2xl lg:text-3xl font-serif italic font-bold tracking-tight ${textColor} transition-colors`}>
            Bytecore's Shop
          </Link>

          {/* Search Bar (Matches Image) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative">
              <input 
                  type="text" 
                  placeholder="Search your tech perks..." 
                  className={`w-full h-12 rounded-full pl-6 pr-12 text-sm outline-none transition-all ${
                      isTransparent 
                          ? 'bg-white/10 text-white placeholder:text-white/60 border border-white/20 focus:bg-white/20' 
                          : 'bg-slate-100 text-slate-900 placeholder:text-slate-500 border border-transparent focus:bg-white focus:border-slate-300'
                  }`} 
              />
              <Search size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isTransparent ? 'text-white/60' : 'text-slate-400'}`} />
          </div>

          {/* Action Icons (Matches Image) */}
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* User Icon / Profile */}
            <div className="relative flex items-center justify-center">
              <SignedIn>
                <div className="scale-110">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={`flex items-center justify-center px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    isTransparent ? 'bg-white text-[#C62828] hover:bg-white/90' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}>
                    Login
                  </button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* Cart Icon (Matches Gift Icon from image) */}
            <Link to="/cart" className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isTransparent ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}>
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className={`absolute top-1 right-1 ${isTransparent ? 'bg-white text-[#C62828]' : 'bg-[#C62828] text-white'} text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Map Pin Icon (Matches image) */}
            <div className={`hidden lg:flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                isTransparent ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}>
                <MapPin size={22} strokeWidth={1.5} />
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
