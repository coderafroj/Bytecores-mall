import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShoppingBag, CheckCircle, Loader2, ArrowLeft, MapPin, Phone, Mail, User } from 'lucide-react';
import { databases, DATABASE_ID, ORDERS_COLLECTION_ID } from '../appwrite/config';
import { ID } from 'appwrite';

const Checkout = ({ cart, clearCart, user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
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

    try {
      const orderData = {
        userId: user?.$id || 'guest',
        userName: formData.name,
        userEmail: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`,
        items: JSON.stringify(cart.map(item => ({
          id: item.$id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))),
        subtotal,
        shipping,
        total,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await databases.createDocument(DATABASE_ID, ORDERS_COLLECTION_ID, ID.unique(), orderData);
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-24 px-6 lg:px-12"
    >
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
                  <div key={item.$id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                      <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-400">{item.quantity} × ₹{item.price}</p>
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
