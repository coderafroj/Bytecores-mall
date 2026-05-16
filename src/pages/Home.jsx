import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ShieldCheck, RotateCcw, Shield, Tag, HeadphonesIcon, ShoppingCart, Truck, Zap, Sparkles, TrendingUp, ArrowRight, UserPlus } from 'lucide-react';
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
        <title>Bytecores Mall | India's #1 Value Store | Nariyawal Bareilly</title>
        <meta name="description" content="Bytecores Mall is the premier shopping destination in Nariyawal, Bareilly. We offer fashion, gadgets, home decor, and more starting at ₹49. Visit us or order online for fast delivery." />
        <link rel="canonical" href="https://mall.bytecores.in/" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Bytecores Mall",
              "image": "https://mall.bytecores.in/favicon.png",
              "@id": "https://mall.bytecores.in",
              "url": "https://mall.bytecores.in",
              "telephone": "+91-XXXXXXXXXX",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Nariyawal",
                "addressLocality": "Bareilly",
                "postalCode": "243123",
                "addressRegion": "UP",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.34,
                "longitude": 79.41
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "09:00",
                "closes": "21:00"
              },
              "sameAs": [
                "https://facebook.com/bytecoresmall",
                "https://instagram.com/bytecoresmall"
              ]
            }
          `}
        </script>
      </Helmet>
      
      {/* Trending Matrix Ticker */}
      <div className="bg-slate-950 py-3 border-y border-white/5 overflow-hidden whitespace-nowrap relative z-40">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-flex gap-16"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Sparkles size={14} className="text-red-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Bytecores Mall Exclusive • New Drop at Nariyawal • Everything Under ₹99 • Matrix Logistics Enabled</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Premium Hero */}
      <Hero3D />

      {/* Floating Trust Bar */}
      <section className="relative z-30 -mt-16 lg:-mt-24 px-4 lg:px-12 max-w-[1400px] mx-auto animate-reveal">
        <div className="glass rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-x-0 lg:divide-x divide-slate-100">
            {TRUST.map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center group-hover:bg-red-600 transition-all duration-500 shadow-2xl shadow-slate-900/20 group-hover:-rotate-12">
                        {item.icon}
                    </div>
                    <div>
                        <p className="text-[10px] lg:text-xs font-black text-slate-900 tracking-widest leading-none mb-1.5 uppercase">{item.t}</p>
                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.s}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Featured Collections - NEW SECTION */}
      <section className="py-24 px-6 lg:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
                whileHover={{ scale: 0.98 }}
                className="group relative h-[400px] lg:h-[600px] rounded-[4rem] overflow-hidden bg-slate-950"
            >
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000" alt="Tech" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 glass-dark p-10 rounded-[3rem] border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={16} className="text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Trending Now</span>
                    </div>
                    <h3 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">Gadget <br/>Matrix 2026</h3>
                    <Link to="/products/electronics" className="inline-flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all group-hover:translate-x-2">
                        Initialize View <ArrowRight size={14} />
                    </Link>
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 0.98 }}
                className="group relative h-[400px] lg:h-[600px] rounded-[4rem] overflow-hidden bg-slate-100"
            >
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000" alt="Fashion" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 glass p-10 rounded-[3rem]">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles size={16} className="text-red-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">New Protocol</span>
                    </div>
                    <h3 className="text-3xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-6 leading-tight">Fashion <br/>Protocol V1</h3>
                    <Link to="/products/fashion" className="inline-flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all group-hover:translate-x-2">
                        Explore Wearables <ArrowRight size={14} />
                    </Link>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
            <span className="text-red-500 font-black text-[11px] uppercase tracking-[0.5em] mb-4">Discovery Engine</span>
            <h2 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sector Maps</h2>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-10">
            {CATS.map((cat, i) => (
                <Link 
                    key={i} 
                    to={cat.path}
                    className="flex flex-col items-center gap-6 group"
                >
                    <div className="w-full aspect-square rounded-[2.5rem] lg:rounded-[4rem] bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-700 group-hover:bg-slate-950 group-hover:shadow-2xl group-hover:shadow-slate-900/20 group-hover:-translate-y-4 relative overflow-hidden">
                        <span className="text-4xl lg:text-7xl z-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">{cat.emoji}</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] lg:text-xs font-black text-slate-400 group-hover:text-red-600 transition-colors tracking-[0.3em] uppercase">{cat.name}</span>
                </Link>
            ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 px-6 lg:px-12 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <div className="max-w-[1600px] mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
                <div>
                    <span className="text-red-500 font-black text-[11px] uppercase tracking-[0.5em] mb-4 block">Terminal Registry</span>
                    <h2 className="text-4xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none">Global <br/>Trends</h2>
                </div>
                <Link to="/products" className="group flex items-center gap-5 bg-white text-slate-950 px-10 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95">
                    View Complete Data
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
            
            <div className="-mx-6 lg:-mx-12 dark-products">
                <ProductGrid limit={12} />
            </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-20">
            {[
                { title: "Quantum Logistics", desc: "Express delivery across India for every order.", icon: <Truck size={32} />, color: "bg-blue-600" },
                { title: "Terminal Protocol", desc: "Encryption standards for all transactions.", icon: <ShieldCheck size={32} />, color: "bg-red-600" },
                { title: "Premium Index", desc: "Each item verified for maximum quality.", icon: <Sparkles size={32} />, color: "bg-emerald-600" }
            ].map((item, i) => (
                <div key={i} className="group p-16 rounded-[4rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-5">
                    <div className={`w-24 h-24 rounded-[2.5rem] ${item.color} text-white flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                        {item.icon}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-6">{item.title}</h3>
                    <p className="text-slate-500 font-bold text-lg leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 lg:px-12 pb-32">
        <div className="max-w-[1600px] mx-auto glass rounded-[5rem] p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 max-w-2xl text-center lg:text-left">
                <h2 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] mb-8">Ready to <br/>Join the Elite?</h2>
                <p className="text-xl text-slate-500 font-bold mb-12">Access exclusive drops and premium logistics starting today. No subscription required.</p>
                <Link to="/login" className="inline-flex items-center gap-4 bg-slate-950 text-white px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl">
                    Initialize Account <UserPlus size={18} />
                </Link>
            </div>
            <div className="relative z-10">
                <div className="w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-slate-950 flex items-center justify-center text-8xl lg:text-9xl animate-pulse-glow shadow-2xl">
                    💎
                </div>
            </div>
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
                    India's #1 Value Store located in Nariyawal, Bareilly. We provide high-quality products at the lowest prices in the matrix. Shop in-store or order online for fast home delivery.
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
