import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ShieldCheck, RotateCcw, Shield, Tag, HeadphonesIcon, ShoppingCart, Truck, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D';
import ProductGrid from '../components/ProductGrid';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

const CATS = [
  { name: "FASHION", emoji: "👕", path: "/products/fashion", active: false },
  { name: "GADGETS", emoji: "🎧", path: "/products/electronics", active: true },
  { name: "DECOR", emoji: "🏠", path: "/products/home", active: false },
  { name: "BEAUTY", emoji: "💄", path: "/products/beauty", active: false },
  { name: "BOOKS", emoji: "📚", path: "/products/books", active: false },
  { name: "TOYS", emoji: "🧸", path: "/products/toys", active: false },
];

const TRUST = [
  { icon: <ShieldCheck size={24} />, t: "100% SECURE", s: "Payment" },
  { icon: <RotateCcw size={24} />, t: "EASY RETURNS", s: "7 Days" },
  { icon: <Truck size={24} />, t: "FREE DELIVERY", s: "Over ₹999" },
  { icon: <HeadphonesIcon size={24} />, t: "24/7 SUPPORT", s: "Help" },
];

const Home = () => {
  const dispatch = useDispatch();
  
  return (
    <div className="w-full bg-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-red-500/10 selection:text-red-600">
      <Helmet>
        <title>Bytecore's Mall | India's #1 Value Store</title>
        <meta name="description" content="Shop the latest fashion, electronics and home decor at unbeatable prices. Everything under ₹99!" />
      </Helmet>
      
      {/* Premium Hero */}
      <Hero3D />

      {/* Floating Trust Bar - Mobile Optimization */}
      <section className="relative z-30 -mt-8 lg:-mt-12 px-4 lg:px-12 max-w-[1400px] mx-auto">
        <div className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 lg:p-10 border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-x-0 lg:divide-x divide-slate-100">
            {TRUST.map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        {item.icon}
                    </div>
                    <div>
                        <p className="text-[10px] lg:text-xs font-black text-slate-900 tracking-widest leading-none mb-1">{item.t}</p>
                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.s}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Categories Grid - Pro Mobile Experience */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
            <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Discover Matrix</span>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-10">
            {CATS.map((cat, i) => (
                <Link 
                    key={i} 
                    to={cat.path}
                    className="flex flex-col items-center gap-4 group"
                >
                    <div className="w-full aspect-square rounded-[2rem] lg:rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:-translate-y-2 relative overflow-hidden">
                        <span className="text-4xl lg:text-6xl z-10 transition-transform duration-500 group-hover:scale-125">{cat.emoji}</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] lg:text-xs font-black text-slate-400 group-hover:text-red-600 transition-colors tracking-[0.2em] uppercase">{cat.name}</span>
                </Link>
            ))}
        </div>
      </section>

      {/* Flash Sale Banner - Mobile Masterpiece */}
      <section className="px-4 lg:px-12 py-12">
        <div className="max-w-[1600px] mx-auto bg-slate-950 rounded-[3rem] lg:rounded-[5rem] p-10 lg:p-24 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full bg-gradient-to-l from-red-600/20 to-transparent z-0" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="inline-flex items-center gap-3 bg-red-600 px-5 py-2 rounded-full mb-8 shadow-xl shadow-red-600/20">
                    <Zap size={16} fill="white" className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mega Flash Sale</span>
                </div>
                <h2 className="text-5xl lg:text-9xl font-black tracking-tighter leading-[0.9] uppercase mb-8">
                    Everything <br/>
                    <span className="text-red-500 italic underline decoration-white/20 underline-offset-8">Under ₹99</span>
                </h2>
                <p className="text-slate-400 font-bold text-lg lg:text-2xl max-w-xl mb-12">Limited time only. Grab the best deals before they disappear into the matrix.</p>
                
                <div className="flex gap-6">
                    <div className="flex flex-col">
                        <span className="text-3xl lg:text-5xl font-black text-white">08</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Hours</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-3xl lg:text-5xl font-black text-white">45</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Mins</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-3xl lg:text-5xl font-black text-white">12</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Secs</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <div className="w-64 h-64 lg:w-96 lg:h-96 rounded-[4rem] lg:rounded-[6rem] bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-2xl relative group cursor-pointer hover:scale-105 transition-transform duration-700">
                    <div className="absolute inset-0 bg-red-600/10 rounded-[4rem] lg:rounded-[6rem] blur-3xl group-hover:scale-125 transition-transform" />
                    <span className="text-9xl lg:text-[12rem] filter drop-shadow-2xl">⚡</span>
                    <div className="absolute -bottom-6 -right-6 bg-white text-slate-950 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Starting At</p>
                        <p className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-none">₹49</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Selection Matrix</span>
                    <h2 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">Trending Now</h2>
                </div>
                <Link to="/products" className="group flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:bg-slate-950 hover:text-white transition-all active:scale-95">
                    View Entire Registry
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <div className="-mx-6 lg:-mx-12">
                <ProductGrid limit={12} />
            </div>
        </div>
      </section>

      {/* Experience Section - Mobile First */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {[
                { title: "Pure Logistics", desc: "Express delivery across India for every order.", icon: <Truck size={32} />, color: "bg-blue-600" },
                { title: "Secure Protocol", desc: "Encryption standards for all transactions.", icon: <ShieldCheck size={32} />, color: "bg-emerald-600" },
                { title: "Quality Matrix", desc: "Each item verified for maximum quality.", icon: <Sparkles size={32} />, color: "bg-amber-500" }
            ].map((item, i) => (
                <div key={i} className="group p-12 rounded-[3.5rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700 hover:-translate-y-3">
                    <div className={`w-20 h-20 rounded-[2rem] ${item.color} text-white flex items-center justify-center mb-8 shadow-2xl group-hover:rotate-12 transition-all`}>
                        {item.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">{item.title}</h3>
                    <p className="text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12 rounded-t-[4rem] lg:rounded-t-[6rem]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-1">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl">B</div>
                    <h2 className="font-black text-2xl tracking-tighter uppercase">Bytecore Mall</h2>
                </div>
                <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                    Providing high-quality products at the lowest prices in the matrix. Discover your vibe today.
                </p>
                <div className="flex gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" />)}
                </div>
            </div>
            {['Quick Links', 'Categories', 'Support'].map((title, i) => (
                <div key={i}>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">{title}</h4>
                    <ul className="space-y-4">
                        {[1,2,3,4,5].map(j => <li key={j} className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer">Matrix Link {j}</li>)}
                    </ul>
                </div>
            ))}
        </div>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 Bytecore Mall. All rights reserved.</p>
            <div className="flex gap-4">
                {['UPI', 'VISA', 'MASTERCARD', 'COD'].map(p => <span key={p} className="px-3 py-1 rounded bg-white/5 text-[8px] font-black text-slate-500 tracking-widest">{p}</span>)}
            </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
