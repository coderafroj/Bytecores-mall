import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShoppingBag, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE_ITEMS = [
  "https://pngimg.com/uploads/laptop/laptop_PNG59177.png",
  "https://pngimg.com/uploads/headphones/headphones_PNG101979.png",
  "https://pngimg.com/uploads/gamepad/gamepad_PNG74.png",
  "https://pngimg.com/uploads/macbook/macbook_PNG8.png",
  "https://pngimg.com/uploads/smartphone/smartphone_PNG8520.png",
  "https://pngimg.com/uploads/watch/watch_PNG98436.png",
];

// Create 30 items for a dense background effect
const HERO_ITEMS = [...BASE_ITEMS, ...BASE_ITEMS, ...BASE_ITEMS, ...BASE_ITEMS, ...BASE_ITEMS];

const HeroAnimated99 = () => {
  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-slate-950 flex items-center justify-center">
      
      {/* 1. Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-40 scale-105"
        >
          {/* A cool dark abstract/tech looping video */}
          <source src="https://cdn.pixabay.com/video/2016/09/21/5398-183786400_large.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlays for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950/80 hidden lg:block" />
        <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay" />
      </div>

      {/* 2. Floating 99-Store Items (Desktop & Mobile) - Dense Particle Field */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden perspective-[2000px]">
        {HERO_ITEMS.map((item, i) => {
          const isFar = i % 3 === 0;
          const isClose = i % 3 === 1;
          const blurAmount = isFar ? 8 : (isClose ? 0 : 3);
          const opacityMax = isFar ? 0.3 : (isClose ? 0.9 : 0.6);
          const sizeBase = isFar ? 50 : (isClose ? 200 : 120);

          return (
            <motion.img
              key={i}
              src={item}
              alt="Product"
              className="absolute object-contain drop-shadow-[0_20px_30px_rgba(255,0,0,0.15)]"
              initial={{ 
                opacity: 0, 
                scale: 0.1,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)
              }}
              animate={{ 
                opacity: [0, opacityMax, 0],
                scale: [0.5, 1.2, 0.5],
                x: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920), 
                  (Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)) + (i % 2 === 0 ? 400 : -400),
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)
                ],
                y: [
                  (typeof window !== 'undefined' ? window.innerHeight : 1080) + 200, 
                  (typeof window !== 'undefined' ? window.innerHeight : 1080) / 2, 
                  -300
                ],
                rotate: [0, 180, 360],
                rotateY: [0, i % 2 === 0 ? 180 : -180, 0] // Adds 3D rotation
              }}
              transition={{
                duration: 25 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.8
              }}
              style={{
                width: `${sizeBase + Math.random() * 50}px`,
                filter: `blur(${blurAmount}px)`,
                zIndex: isClose ? 15 : (isFar ? 5 : 10)
              }}
            />
          );
        })}
      </div>

      {/* 3. Main Glassmorphic UI Content */}
      <div className="relative z-20 w-full max-w-[1920px] mx-auto px-6 lg:px-12 h-full flex flex-col justify-center">
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="col-span-7 pl-10"
          >
            <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/20 backdrop-blur-md px-5 py-2.5 rounded-full mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-red-400 font-bold tracking-widest uppercase text-sm">Mega Sale Is Live</span>
            </div>
            
            <h1 className="text-[120px] font-black text-white leading-[0.85] tracking-tighter mb-8 drop-shadow-2xl">
              THE 99 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-500">
                STORE.
              </span>
            </h1>
            
            <p className="text-slate-300 text-2xl font-medium mb-12 max-w-2xl leading-relaxed border-l-4 border-red-500 pl-6">
              Premium tech, gadgets, and accessories. Experience the absolute best prices starting at just <strong className="text-white">₹99</strong>. Unbeatable quality, undeniable value.
            </p>
            
            <div className="flex items-center gap-6">
              <Link to="/products" className="group relative inline-flex items-center justify-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white via-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Shop Everything</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              
              <Link to="/products" className="inline-flex items-center justify-center gap-3 text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10 transition-all duration-300">
                <Tag size={24} className="text-red-500" />
                View Offers
              </Link>
            </div>
          </motion.div>
          
          {/* Right side massive floating product (No Box) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="col-span-5 relative flex items-center justify-center pointer-events-none"
          >
            {/* Huge Glow Behind the Object */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
            
            {/* Massive Floating Text Behind Product */}
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-0 text-[200px] font-black text-white/5 whitespace-nowrap tracking-tighter"
            >
              PRO
            </motion.div>

            {/* The 3D Object Itself */}
            <motion.div
               animate={{ y: [-20, 20, -20], rotateY: [-10, 10, -10], rotateZ: [-5, 5, -5] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10 w-full"
            >
              <img 
                src="https://pngimg.com/uploads/headphones/headphones_PNG101979.png"
                alt="Featured Product"
                className="w-full h-[500px] object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
            
            {/* Floating Price Tag */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
              transition={{ 
                duration: 0.8, 
                delay: 1,
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute bottom-10 -right-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            >
              <p className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-1">Wireless Audio</p>
              <p className="text-white font-black text-4xl">₹599</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="flex lg:hidden flex-col items-center justify-center text-center h-full pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-bold tracking-widest uppercase text-[10px]">Mega Sale</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[70px] sm:text-[90px] font-black text-white leading-[0.9] tracking-tighter mb-6 drop-shadow-2xl"
          >
            THE 99 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              STORE.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg font-medium mb-10 px-4 leading-relaxed max-w-sm"
          >
            Premium tech essentials and gadgets starting at just <strong className="text-white">₹99</strong>. Unbeatable value.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row w-full max-w-sm gap-4 px-6"
          >
            <Link to="/products" className="w-full bg-white text-slate-950 px-8 py-4 rounded-full font-black text-base hover:scale-105 transition-transform flex items-center justify-center gap-2">
              <ShoppingBag size={20} /> Shop Now
            </Link>
            <Link to="/products" className="w-full bg-white/10 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-full font-bold text-base hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              <Tag size={20} /> Offers
            </Link>
          </motion.div>

          {/* Mobile floating product */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 w-full max-w-[280px] relative"
          >
             <div className="absolute inset-0 bg-red-500/20 rounded-full blur-[60px] animate-pulse" />
             <motion.img 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                src="https://pngimg.com/uploads/headphones/headphones_PNG101979.png"
                alt="Mobile Featured"
                className="w-full h-[200px] object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] relative z-10"
              />
          </motion.div>
        </div>

      </div>

      {/* Decorative Bottom Fade to seamlessly blend with the next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent z-20 pointer-events-none" />
    </div>
  );
};

export default HeroAnimated99;
