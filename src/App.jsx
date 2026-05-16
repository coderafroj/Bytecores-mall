import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import authService from './appwrite/auth';
import { login, logout } from './store/authSlice';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import OrderSuccess from './pages/OrderSuccess';
import Contact from './pages/Contact';
import ProfileLaunch from './pages/ProfileLaunch';
import Profile from './pages/Profile';

const LayoutNavbar = ({ user, cartCount }) => {
  const location = useLocation();
  if (location.pathname === '/profile-launch') return null;
  return <Navbar user={user} cartCount={cartCount} />;
};

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login(userData));
          // Provide feedback if just logged in
          if (!localStorage.getItem('welcome_toast')) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-24 right-6 bg-slate-900 text-white px-6 py-4 rounded-3xl font-black shadow-2xl z-[9999] flex items-center gap-3 border border-white/10 animate-float';
            toast.innerHTML = `<div class="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center font-black">✓</div> Welcome back, ${userData.name.split(' ')[0]}!`;
            document.body.appendChild(toast);
            localStorage.setItem('welcome_toast', 'shown');
            setTimeout(() => {
              toast.style.opacity = '0';
              setTimeout(() => toast.remove(), 500);
            }, 3000);
          }
        } else {
          dispatch(logout());
          localStorage.removeItem('welcome_toast');
        }
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 border-[6px] border-slate-100 border-t-red-500 rounded-full mb-6" 
        />
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Bytecore Mall</h2>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 animate-pulse">Initializing Matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <LayoutNavbar user={user} cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            user?.labels?.includes('admin') ? (
              <AdminPanel user={user} />
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="/profile-launch" element={<ProfileLaunch />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
        <BottomNav cartCount={cartCount} />
        <div className="lg:hidden h-20" />
      </div>
    </Router>
  );
}

export default App;
