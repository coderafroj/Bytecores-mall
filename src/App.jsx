import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import TrackingProvider from './components/TrackingProvider';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminPanel from './pages/AdminPanel';
import OrderSuccess from './pages/OrderSuccess';
import Contact from './pages/Contact';
import ProfileLaunch from './pages/ProfileLaunch';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import Footer from './components/Footer';

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);
  return null;
};

const LayoutNavbar = ({ cartCount }) => {
  const location = useLocation();
  if (location.pathname === '/profile-launch' || location.pathname.startsWith('/admin')) return null;
  return <Navbar cartCount={cartCount} />;
};

const LayoutFooter = () => {
  const location = useLocation();
  if (location.pathname === '/profile-launch' || location.pathname.startsWith('/admin')) return null;
  return <Footer />;
};

const LayoutBottomNav = ({ cartCount }) => {
  const location = useLocation();
  if (location.pathname === '/profile-launch' || location.pathname.startsWith('/admin')) return null;
  return (
    <>
      <BottomNav cartCount={cartCount} />
      <div className="lg:hidden h-20" />
    </>
  );
};

// Protected Route Wrapper for Clerk
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { isLoaded, user } = useUser();
  if (!isLoaded) return <div className="h-screen bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div></div>;
  if (!user) return <RedirectToSignIn />;
  
  const isAdmin = user.primaryEmailAddress?.emailAddress === 'coderafroj@gmail.com';
  
  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-950 text-white">
        <h1 className="text-5xl font-black text-red-600 mb-4 tracking-tighter uppercase">Access Denied</h1>
        <p className="text-slate-400 font-bold max-w-md mx-auto">This sector is classified. You do not have administrator privileges to view this console.</p>
      </div>
    );
  }
  
  return children;
};

function App() {
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;
    if (TRACKING_ID) {
      ReactGA.initialize(TRACKING_ID);
    }
  }, []);

  return (
    <Router>
      <TrackingProvider>
        <RouteTracker />
        <div className="app">
          <LayoutNavbar cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* We remove the standalone login route because Clerk handles it in a modal via Navbar SignInButton, or redirects to their hosted UI */}
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          
          <Route path="/profile-launch" element={<ProfileLaunch />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
        <LayoutFooter />
        <LayoutBottomNav cartCount={cartCount} />
        </div>
      </TrackingProvider>
    </Router>
  );
}

export default App;
