import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../appwrite/config';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Settings, Search } from 'lucide-react';
import logo from '../assets/firefly1.png';

const Navbar = ({ user, cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl shadow-lg' : 'py-8 bg-transparent'
    }`}>
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 overflow-hidden rounded-xl shadow-md">
            <img src={logo} alt="Bytecore's Mall Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            <span className="text-red-500">Bytecore's</span> Mall
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          <Link to="/" className="text-lg font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-tight">Home</Link>
          <Link to="/products" className="text-lg font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-tight">Shop</Link>
          <Link to="/products/electronics" className="text-lg font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-tight">Electronics</Link>
          <Link to="/products/fashion" className="text-lg font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-tight">Fashion</Link>
          <Link to="/contact" className="text-lg font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-tight">Contact</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 lg:gap-8">
          <button className="hidden sm:flex items-center text-slate-900 hover:text-red-500 transition-colors">
            <Search size={24} strokeWidth={2.5} />
          </button>
          
          <Link to="/cart" className="relative group p-2">
            <ShoppingCart size={28} strokeWidth={2.5} className="text-slate-900 group-hover:text-red-500 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-red-500/30 animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 lg:gap-6 border-l border-slate-200 pl-6 lg:pl-8">
              <Link to={user?.labels?.includes('admin') ? '/admin' : '/profile'} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black group-hover:bg-red-500 transition-colors">
                  {user.name[0]}
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome</p>
                  <p className="text-sm font-black text-slate-900 leading-none">{user.name.split(' ')[0]}</p>
                </div>
              </Link>
              <button onClick={handleLogout} className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <LogOut size={20} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-slate-900 hover:bg-red-500 text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 hover:shadow-red-500/20 active:scale-95">
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-slate-50 p-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              <Link to="/products" className="text-2xl font-black text-slate-900 hover:text-red-500 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
              <Link to="/products/electronics" className="text-2xl font-black text-slate-900 hover:text-red-500 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Electronics</Link>
              <Link to="/products/fashion" className="text-2xl font-black text-slate-900 hover:text-red-500 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Fashion</Link>
              <Link to="/contact" className="text-2xl font-black text-slate-900 hover:text-red-500 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
