import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { clearCart } from '../store/cartSlice';
import { CreditCard, Truck, ShoppingBag, CheckCircle, Loader2, ArrowLeft, MapPin, Phone, Mail, User } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import databaseService from '../appwrite/db';
import { Helmet } from 'react-helmet-async';
import ReactGALib from 'react-ga4';
import ReactPixelLib from 'react-facebook-pixel';

const ReactGA = ReactGALib.default || ReactGALib;
const ReactPixel = ReactPixelLib.default || ReactPixelLib;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const { user } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: user?.unsafeMetadata?.phone || '',
    address: user?.unsafeMetadata?.address || '',
    city: user?.unsafeMetadata?.city || '',
    zipCode: user?.unsafeMetadata?.pincode || '',
    state: ''
  });

  if (cart.length === 0) {
    return <Navigate to="/cart" />;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    let geoLoc = "";
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        geoLoc = ` [GEO: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}]`;
      } catch (err) {
        console.warn("Geolocation permission denied or timeout", err);
      }
    }

    const orderData = {
      userId: user?.id || 'guest',
      userName: formData.name,
      userEmail: formData.email,
      address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode} | Phone: ${formData.phone}${geoLoc}`,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode} | Phone: ${formData.phone}${geoLoc}`,
      items: JSON.stringify(cart.map(item => ({
        id: item.$id,
        cartId: item.cartId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize || null,
        color: item.selectedColor || null
      }))),
      subtotal,
      shipping,
      total,
      paymentMethod,
      status: 'pending'
    };

    if (paymentMethod === 'online') {
      try {
        const { loadScript } = await import('../utils/loadScript');
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          toast.error('Payment Gateway Configuration Missing! Please use Cash on Delivery for now.');
          setLoading(false);
          return;
        }

        const options = {
          key: razorpayKey,
          amount: total * 100, // in paise
          currency: 'INR',
          name: "Bytecore's Mall",
          description: "Premium Purchase",
          image: "https://mall.bytecores.in/logo.png",
          handler: async function (response) {
            try {
              const finalOrderData = {
                ...orderData,
                paymentId: response.razorpay_payment_id,
                paymentStatus: 'paid'
              };
              await databaseService.createOrder(finalOrderData);
              
              try {
                  ReactGA.event("purchase", {
                      transaction_id: response.razorpay_payment_id,
                      value: total,
                      currency: "INR",
                      items: cart.map(item => ({ item_id: item.$id, item_name: item.name, price: item.price, quantity: item.quantity }))
                  });
                  ReactPixel.track('Purchase', {
                      content_ids: cart.map(item => item.$id),
                      content_type: 'product',
                      value: total,
                      currency: 'INR'
                  });
              } catch(e) {}

              dispatch(clearCart());
              navigate('/order-success');
            } catch (err) {
              console.error('Error saving order after payment:', err);
              toast.error(`Order saving failed. Payment ID: ${response.razorpay_payment_id}. Contact support.`);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          notes: {
            address: formData.address
          },
          theme: {
            color: "#ff4757"
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setLoading(false);
      } catch (error) {
        console.error('Razorpay Error:', error);
        toast.error('Could not initialize Razorpay. Please try again.');
        setLoading(false);
      }
    } else {
      // Cash on Delivery
      try {
        await databaseService.createOrder({
          ...orderData,
          paymentStatus: 'pending'
        });
        
        try {
            ReactGA.event("purchase", {
                transaction_id: "COD_" + Date.now(),
                value: total,
                currency: "INR",
                items: cart.map(item => ({ item_id: item.$id, item_name: item.name, price: item.price, quantity: item.quantity }))
            });
                  ReactPixel.track('Purchase', {
                      content_ids: cart.map(item => item.$id),
                      content_type: 'product',
                      value: total,
                      currency: 'INR'
                  });
        } catch(e) {}

        dispatch(clearCart());
        navigate('/order-success');
      } catch (error) {
        console.error('Error placing order:', error);
        toast.error('Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-24 px-6 lg:px-12"
    >
      <Helmet>
        <title>Secure Checkout | Bytecores Mall</title>
        <meta name="description" content="Securely complete your purchase at Bytecores Mall. Fast checkout and order tracking." />
      </Helmet>
      <div className="max-w-[1920px] mx-auto">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold mb-12 transition-colors">
          <ArrowLeft size={20} /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Shipping Info Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                <Truck className="text-red-500" /> Shipping Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <User size={14} className="text-red-500" /> Full Name
                  </label>
                  <input type="text" name="name" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all" value={formData.name} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <Mail size={14} className="text-red-500" /> Email
                  </label>
                  <input type="email" name="email" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all" value={formData.email} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <Phone size={14} className="text-red-500" /> Phone
                  </label>
                  <input type="tel" name="phone" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all" value={formData.phone} onChange={handleInputChange} />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <MapPin size={14} className="text-red-500" /> Full Address
                  </label>
                  <textarea name="address" required rows="3" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all" value={formData.address} onChange={handleInputChange}></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">City</label>
                  <input type="text" name="city" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all" value={formData.city} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">State</label>
                  <input type="text" name="state" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all" value={formData.state} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                <CreditCard className="text-red-500" /> Payment Method
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: <Truck size={24} /> },
                  { id: 'online', label: 'Online Payment', desc: 'Securely pay via UPI/Card', icon: <CreditCard size={24} /> }
                ].map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id 
                      ? 'border-red-500 bg-red-50 ring-4 ring-red-500/10' 
                      : 'border-slate-100 bg-slate-50 hover:border-red-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      paymentMethod === method.id ? 'bg-red-500 text-white' : 'bg-white text-slate-400'
                    }`}>
                      {method.icon}
                    </div>
                    <h4 className="font-black text-slate-900 mb-1">{method.label}</h4>
                    <p className="text-sm font-bold text-slate-500">{method.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Sidebar Summary */}
          <aside className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Summary</h2>
              
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                {cart.map(item => (
                  <div key={item.cartId} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                      <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-sm truncate">{item.name}</h4>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-[10px] font-black text-slate-400 mt-0.5">
                          {item.selectedSize && `Size: ${item.selectedSize}`} {item.selectedSize && item.selectedColor && '| '} {item.selectedColor && `Color: ${item.selectedColor}`}
                        </p>
                      )}
                      <p className="text-xs font-bold text-slate-400 mt-1">{item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-8 border-t-2 border-dashed border-slate-100 space-y-4">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-500' : 'text-slate-900'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="pt-4 flex justify-between items-end">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{total}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                <span>Place Order Now</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
