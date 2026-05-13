import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
        } else {
          dispatch(logout());
        }
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase animate-pulse">Bytecore's Mall</h2>
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
        </Routes>
        <BottomNav cartCount={cartCount} />
        <div className="lg:hidden h-20" />
      </div>
    </Router>
  );
}

export default App;
