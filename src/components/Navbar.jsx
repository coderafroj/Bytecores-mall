import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, User, Search, Menu, X, LogOut, 
  Settings, Package, Shield, ChevronRight, Zap
} from 'lucide-react';
import { logout as authLogout } from '../store/authSlice';
import authService from '../appwrite/auth';
import logo from '../assets/bytecoreMall.png';

const Navbar = ({ cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = useSelector((state) => state.auth.userData);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(authLogout());
    setShowProfileMenu(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Market', path: '/products' },
    { label: 'Hot Deals', path: '/products/electronics' },
    { label: 'Support', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[5000] transition-all duration-500 ${
      isScrolled ? 'py-4' : 'py-6'
    }`}>
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className={`relative flex items-center justify-between bg-white rounded-[2rem] lg:rounded-[3rem] px-8 lg:px-12 h-20 lg:h-24 shadow-2xl transition-all duration-500 border border-white/20 ${
          isScrolled ? 'bg-white/80 backdrop-blur-2xl' : 'bg-white'
        }`}>
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20 group-hover:rotate-12 transition-transform">
                <Zap size={20} fill="white" className="text-white" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tighter uppercase leading-none">Bytecore</h1>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Mall Protocol</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-red-600 ${
                  location.pathname === link.path ? 'text-red-600' : 'text-slate-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/products" className="p-3 lg:p-4 text-slate-400 hover:text-slate-950 transition-all hidden sm:flex">
              <Search size={22} strokeWidth={2.5} />
            </Link>

            <Link to="/cart" className="relative p-3 lg:p-4 text-slate-400 hover:text-slate-950 transition-all group">
              <ShoppingBag size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>

            {/* Profile Logic */}
            <div className="relative">
              {user ? (
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1.5 lg:p-2 bg-slate-50 rounded-2xl lg:rounded-[1.5rem] border border-slate-100 hover:bg-slate-100 transition-all"
                >
                  <div className="w-9 h-9 lg:w-11 lg:h-11 bg-slate-950 text-white rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-sm shadow-xl">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start pr-4">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{user.name.split(' ')[0]}</span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Online</span>
                  </div>
                </button>
              ) : (
                <Link 
                    to="/login" 
                    className="flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-slate-950 text-white rounded-2xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-2xl shadow-slate-950/20"
                >
                  <User size={16} />
                  Login
                </Link>
              )}

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowProfileMenu(false)}
                      className="fixed inset-0 z-[-1]"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute right-0 mt-6 w-72 bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden py-4"
                    >
                      <div className="px-8 py-6 border-b border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Principal</p>
                        <p className="font-black text-slate-900 uppercase truncate">{user.name}</p>
                      </div>

                      <div className="p-3 space-y-1">
                        {[
                          { icon: <User size={18} />, label: 'My Registry', path: '/profile' },
                          { icon: <Package size={18} />, label: 'Orders', path: '/profile' },
                          { icon: <Settings size={18} />, label: 'Settings', path: '/profile' },
                          { icon: <Shield size={18} />, label: 'Admin Panel', path: '/admin', admin: true },
                        ].map((item, i) => (
                          (!item.admin || user?.labels?.includes('admin')) && (
                            <Link 
                                key={i} 
                                to={item.path} 
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-4 p-4 rounded-[1.5rem] text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-red-600 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                {item.label}
                                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          )
                        ))}
                      </div>

                      <div className="px-3 pt-3 border-t border-slate-50">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:shadow-inner transition-all"
                        >
                            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                                <LogOut size={18} />
                            </div>
                            Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
