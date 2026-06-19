import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const HeroAnimated99 = () => {
  return (
    <div className="min-h-screen w-full bg-[#E5E7EB] font-sans overflow-hidden flex flex-col relative">
      {/* Main Framed Container */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-[#E5E7EB]">
        
        {/* Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-slate-300/50" />
          <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-slate-300/50" />
          <div className="absolute left-0 right-0 bottom-[100px] h-[1px] bg-slate-300/50" />
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 relative flex items-center justify-center pt-24">
          
          {/* Giant Typography */}
          <motion.h1 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-[10%] left-[5%] text-[12vw] font-black text-slate-800 leading-none tracking-tighter z-10"
          >
            BYTECORES
          </motion.h1>
          
          <motion.h1 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-[20%] right-[5%] text-[12vw] font-black text-slate-800 leading-none tracking-tighter z-10"
          >
            99 MALL
          </motion.h1>

          <div className="absolute right-[10%] top-[30%] text-slate-400 font-bold tracking-widest uppercase text-xl z-0">
            Tech Store
          </div>

          {/* Massive 3D Central Object */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [-15, 15, -15] }}
            transition={{ 
              scale: { duration: 1.5, ease: "easeOut" },
              opacity: { duration: 1.5 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative z-30 w-full max-w-2xl lg:max-w-4xl pointer-events-none mt-10"
          >
            <img 
              src="https://pngimg.com/uploads/headphones/headphones_PNG101979.png" 
              alt="Premium Tech" 
              className="w-full h-auto object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.3)] mix-blend-multiply"
            />
          </motion.div>

          {/* Left Column Floating Cards */}
          <div className="absolute left-[5%] top-[40%] flex flex-col gap-6 z-40 w-[240px]">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/40 backdrop-blur-xl border border-white/50 p-3 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
            >
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" alt="Product 1" className="w-full h-40 object-cover rounded-2xl" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-[#7C8B9E]/20 backdrop-blur-2xl border border-white/30 p-6 rounded-3xl shadow-xl flex flex-col gap-4"
            >
              <h3 className="text-3xl font-black text-slate-800">+500</h3>
              <p className="text-slate-600 text-sm font-medium">Premium gadgets added every single day to our store.</p>
              <Link to="/products" className="bg-white text-slate-900 font-bold py-3 px-6 rounded-full text-center text-sm shadow-md hover:scale-105 transition-transform">
                Explore Now
              </Link>
            </motion.div>
          </div>

          {/* Right Column Floating Card */}
          <div className="absolute right-[5%] bottom-[15%] z-40 w-[260px]">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-white/40 backdrop-blur-xl border border-white/50 p-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" alt="Smart Watch" className="w-full h-56 object-cover rounded-2xl" />
              <div className="absolute top-6 right-6 text-right z-20 mix-blend-difference text-white">
                <p className="font-black text-sm uppercase tracking-widest">New Set</p>
                <p className="font-bold opacity-80">(₹599.00)</p>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20 translate-y-10 group-hover:translate-y-0 transition-transform text-white">
                <p className="font-black uppercase tracking-widest text-sm">Smart Watch</p>
                <p className="font-bold">₹599</p>
              </div>
            </motion.div>
          </div>

        </div>

        {/* --- Bottom Footer Row --- */}
        <div className="h-[100px] relative z-50 flex items-center justify-between px-10">
          <div className="w-1/4">
            <p className="text-slate-500 font-medium text-sm">© Bytecores Mall Reserved</p>
          </div>
          
          <div className="w-2/4 flex justify-center gap-4">
            <a href="#" className="px-5 py-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-slate-700 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
              Instagram
            </a>
            <a href="#" className="px-5 py-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-slate-700 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
              Twitter
            </a>
            <a href="#" className="px-5 py-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-slate-700 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
              Facebook
            </a>
          </div>

          <div className="w-1/4 flex justify-end items-center gap-6">
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                <ArrowLeft size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="w-32 h-1 bg-slate-300 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroAnimated99;
