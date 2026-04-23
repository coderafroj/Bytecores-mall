import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { account } from '../appwrite/config';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Settings } from 'lucide-react';

const Navbar = ({ user, cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 overflow-hidden rounded-xl shadow-md">
            <img src="/src/assets/firefly1.png" alt="Bytecore's Mall Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            <span className="text-red-500">Bytecore's</span> Mall
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-slate-600">
          <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-red-500 transition-colors">Products</Link>
          <Link to="/products/electronics" className="hover:text-red-500 transition-colors">Electronics</Link>
          <Link to="/products/fashion" className="hover:text-red-500 transition-colors">Fashion</Link>
          <Link to="/products/home" className="hover:text-red-500 transition-colors">Home & Living</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/cart" className="relative p-2 text-slate-700 hover:text-red-500 transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-slate-100 p-1.5 pr-4 rounded-full">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="flex items-center gap-4">
                  {user.labels?.includes('admin') && (
                    <Link to="/admin" className="text-slate-600 hover:text-red-500 p-1 rounded-full transition-colors">
                      <Settings size={20} />
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-slate-600 hover:text-red-500 p-1 rounded-full transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg active:scale-95">
                Login
              </Link>
            )}
          </div>

          <button 
            className="lg:hidden p-2 text-slate-700 hover:text-red-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col gap-4 font-bold text-slate-700 animate-in slide-in-from-top-4 duration-300">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
          <Link to="/products/electronics" onClick={() => setIsMenuOpen(false)}>Electronics</Link>
          <Link to="/products/fashion" onClick={() => setIsMenuOpen(false)}>Fashion</Link>
          <Link to="/products/home" onClick={() => setIsMenuOpen(false)}>Home & Living</Link>
          {!user && (
            <Link to="/login" className="bg-red-500 text-white py-3 rounded-xl text-center mt-4">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
