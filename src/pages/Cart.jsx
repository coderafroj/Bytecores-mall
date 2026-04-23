import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

const Cart = ({ cart, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-50 pt-32 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-8">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Your cart is empty</h2>
          <p className="text-slate-500 font-bold mb-10">Seems like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="inline-block bg-red-500 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all hover:-translate-y-1 active:scale-95">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-24 px-6 lg:px-12"
    >
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter">Shopping <span className="text-red-500">Cart</span></h1>
          <p className="text-xl text-slate-500 font-bold mt-2">You have {cart.length} items in your collection.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12">
          {/* Cart Items List */}
          <div className="space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={item.$id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl transition-all duration-500"
                >
                  <div className="w-full md:w-40 aspect-square bg-slate-50 rounded-3xl overflow-hidden shrink-0">
                    <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-xs font-black text-red-500 uppercase tracking-widest">{item.category}</span>
                    <Link to={`/product/${item.$id}`} className="text-2xl font-black text-slate-900 hover:text-red-500 transition-colors tracking-tight">
                      {item.name}
                    </Link>
                    <span className="text-2xl font-black text-slate-900 mt-2">₹{item.price}</span>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden">
                      <button 
                        className="p-3 hover:bg-white text-slate-900 transition-colors disabled:opacity-30" 
                        onClick={() => updateQuantity(item.$id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={20} strokeWidth={3} />
                      </button>
                      <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                      <button 
                        className="p-3 hover:bg-white text-slate-900 transition-colors" 
                        onClick={() => updateQuantity(item.$id, item.quantity + 1)}
                      >
                        <Plus size={20} strokeWidth={3} />
                      </button>
                    </div>
                    
                    <button 
                      className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      onClick={() => removeFromCart(item.$id)}
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-lg font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold text-slate-500">
                  <span>Shipping Cost</span>
                  <span className={shipping === 0 ? 'text-emerald-500' : 'text-slate-900'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>
              
              <div className="pt-8 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{total}</span>
                </div>
              </div>

              <button 
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-4 active:scale-95"
                onClick={() => navigate('/checkout')}
              >
                Checkout Now
                <ArrowRight size={24} strokeWidth={3} />
              </button>
              
              <div className="flex items-center gap-3 bg-blue-50 p-6 rounded-2xl text-blue-700">
                <Truck size={24} />
                <p className="text-sm font-bold leading-tight">
                  {shipping === 0 
                    ? "Great! Your order qualifies for free delivery." 
                    : `Add items worth ₹${999 - subtotal} more for free delivery.`}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
