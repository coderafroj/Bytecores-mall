import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Search, MapPin
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';


const Navbar = ({ cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'coderafroj@gmail.com';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;
  const textColor = isTransparent ? 'text-white' : 'text-slate-900';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[5000] transition-all duration-500 flex justify-center ${
      isScrolled ? 'pt-4' : isHome ? 'pt-4 lg:pt-6' : 'pt-4'
    }`}>
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? 'w-[95%] lg:w-[800px] xl:w-[1000px]' : 'w-full max-w-[1920px] px-4 lg:px-12'
      }`}>
        <div className={`relative flex items-center justify-between rounded-[2rem] lg:rounded-full px-6 lg:px-10 h-16 lg:h-20 transition-all duration-500 ${
          isScrolled 
            ? 'island-nav' 
            : 'bg-transparent'
        }`}>
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/favicon.png" 
              alt="Bytecore Mall" 
              className="h-10 lg:h-12 w-auto object-contain transform group-hover:scale-105 transition-all duration-300 drop-shadow-xl" 
            />
            <span className={`font-black text-xl tracking-tighter hidden sm:block ${isTransparent ? 'text-white' : 'text-slate-900'}`}>Bytecores<span className="text-red-600">Mall</span></span>
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
            
            {isAdmin && (
                <Link to="/admin" className={`hidden lg:flex items-center justify-center px-4 py-2 rounded-full font-bold text-xs transition-all tracking-widest uppercase shadow-sm ${
                    isTransparent ? 'bg-white text-red-600 hover:bg-white/90' : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                  Admin Console
                </Link>
            )}

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
