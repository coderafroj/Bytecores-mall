import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowRight, Heart } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-6 lg:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-blue-500/20 blur-[150px] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden text-center p-12 lg:p-20"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner"
        >
          <Check size={64} strokeWidth={4} />
        </motion.div>
        
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
          Order <span className="text-emerald-500">Confirmed!</span>
        </h1>
        
        <p className="text-xl text-slate-500 font-bold mb-12 max-w-md mx-auto">
          Thank you for choosing Bytecore's Mall! Your order has been placed successfully and is being prepared for shipment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/products" className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95">
            Continue Shopping
            <ShoppingBag size={20} />
          </Link>
          
          <Link to="/" className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 px-10 py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3">
            Back to Home
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-slate-400 font-bold">
          <Heart size={16} className="text-red-400 fill-red-400" />
          <span>Made with love by Bytecore's Mall</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
