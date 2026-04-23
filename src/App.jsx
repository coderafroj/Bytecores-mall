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
import './App.css';

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
    const savedCart = localStorage.getItem('99mall-cart');
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
      
      localStorage.setItem('99mall-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.$id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('99mall-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.$id !== productId);
      localStorage.setItem('99mall-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('99mall-cart');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
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
