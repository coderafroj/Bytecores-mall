import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { account } from './appwrite/config';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    checkUser();
    loadCart();
  }, []);

  const checkUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('bytecore-mall-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.$id === product.$id);
      let newCart;
      
      if (existing) {
        newCart = prevCart.map(item =>
          item.$id === product.$id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity }];
      }
      
      localStorage.setItem('bytecore-mall-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.$id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('bytecore-mall-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.$id !== productId);
      localStorage.setItem('bytecore-mall-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('bytecore-mall-cart');
  };

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
        <Navbar user={user} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/products" element={<Products addToCart={addToCart} />} />
          <Route path="/products/:category" element={<Products addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/cart" element={
            <Cart 
              cart={cart} 
              updateQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
            />
          } />
          <Route path="/checkout" element={
            <Checkout cart={cart} clearCart={clearCart} user={user} />
          } />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/admin" element={
            user?.labels?.includes('admin') ? (
              <AdminPanel user={user} />
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
