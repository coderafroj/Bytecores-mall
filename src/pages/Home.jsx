import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, RotateCcw, Shield, Tag, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ProductGrid from '../components/ProductGrid';

// Fallback high quality emojis to simulate the 3D icons from the mockup
const CATS = [
  { name: "FASHION", emoji: "👕", path: "/products/fashion", active: false },
  { name: "ACCESSORIES", emoji: "👜", path: "/products/fashion", active: false },
  { name: "TOYS", emoji: "🧸", path: "/products", active: false },
  { name: "BOOKS", emoji: "📚", path: "/products", active: false },
  { name: "GADGETS", emoji: "🎧", path: "/products/electronics", active: true },
  { name: "FOOTWEAR", emoji: "👟", path: "/products/fashion", active: false },
  { name: "BEAUTY", emoji: "💄", path: "/products/beauty", active: false },
  { name: "MORE", emoji: "•••", path: "/products", active: false },
];

const TRUST = [
  { icon: <ShieldCheck size={28} />, t: "100% SECURE", t2: "PAYMENT" },
  { icon: <RotateCcw size={28} />, t: "EASY RETURNS", s: "7 Days Return Policy" },
  { icon: <Shield size={28} />, t: "TRUSTED BY", s: "10,000+ Customers" },
  { icon: <Tag size={28} />, t: "LOWEST PRICE", s: "Best Value Guarantee" },
  { icon: <HeadphonesIcon size={28} />, t: "24/7 SUPPORT", s: "We're Here to Help" },
];

const Home = ({ addToCart }) => {
  return (
    <div className="w-full bg-[#f8f9fa] font-['Segoe_UI',Arial,sans-serif]">
      <Helmet>
        <title>Bytecore's Mall | Best Online Shopping in India</title>
        <meta name="description" content="Welcome to Bytecore's Mall - Your ultimate destination for premium electronics, fashion, and home essentials at unbeatable prices. Shop the latest trends today!" />
        <meta name="keywords" content="online shopping, electronics, fashion, home decor, deals, bytecore's mall" />
        <link rel="canonical" href="https://bytecores-mall.vercel.app/" />
      </Helmet>
      
      {/* Hero Section */}
      <HeroBanner />

      {/* Categories Strip */}
      <section className="relative z-20 max-w-[1400px] mx-auto px-4 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-6 px-4 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 pb-2">
            {CATS.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="flex flex-col items-center gap-3 min-w-[80px] lg:min-w-[100px] group cursor-pointer"
              >
                <div className={`w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  cat.active 
                    ? 'bg-red-50 border-2 border-red-200 shadow-sm' 
                    : 'bg-[#f4f6f8] border border-transparent group-hover:bg-red-50 group-hover:border-red-100'
                }`}>
                  <span className={`text-3xl lg:text-4xl ${cat.name === 'MORE' ? 'text-slate-400 font-bold -mt-2' : ''}`}>
                    {cat.emoji}
                  </span>
                </div>
                <span className={`text-[10px] lg:text-[11px] font-black tracking-wide ${cat.active ? 'text-red-600' : 'text-slate-600 group-hover:text-red-600'}`}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip (Solid Red Bar) */}
      <section className="w-full bg-[#cc181e] text-white py-6 shadow-inner">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-y-6 gap-x-4">
            {TRUST.map((b, i) => (
              <div key={i} className="flex items-center gap-3 w-full sm:w-[45%] lg:w-auto">
                <div className="flex-shrink-0">{b.icon}</div>
                <div className="flex flex-col">
                  <div className="font-black text-[12px] lg:text-[13px] tracking-wide leading-tight">{b.t}</div>
                  {b.t2 && <div className="font-black text-[12px] lg:text-[13px] tracking-wide leading-tight">{b.t2}</div>}
                  {b.s && <div className="text-[10px] lg:text-[11px] font-medium opacity-90">{b.s}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Deals Grid (Admin Functionality retained) */}
      <section className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-16 lg:py-20 bg-[#f8f9fa]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2 font-['Barlow_Condensed',sans-serif]">
              TRENDING <span className="text-[#cc181e]">DEALS</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-500 font-medium">Discover our handpicked selection of amazing deals at unbeatable prices.</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest hover:text-[#cc181e] transition-colors">
            View All Products
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:bg-[#cc181e] group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
        
        <ProductGrid addToCart={addToCart} limit={12} />
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand col */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-[42px] h-[42px] bg-[#cc181e] rounded-lg flex items-center justify-center font-['Barlow_Condensed',sans-serif] font-black text-[22px] text-white">B</div>
                <div>
                  <div className="font-['Barlow_Condensed',sans-serif] font-black text-[22px] leading-none">
                    <span className="text-white">BYTE</span><span className="text-[#cc181e]">CORE'S</span>
                  </div>
                  <div className="text-[9px] tracking-[0.3em] text-slate-400 font-bold mt-1 uppercase">— MALL —</div>
                </div>
              </div>
              <p className="text-[12px] lg:text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                India's #1 value store. Everything at ₹99 — quality products, fast delivery, guaranteed happiness.
              </p>
              
              <div className="flex mb-6 rounded bg-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#cc181e] transition-all">
                <input type="email" placeholder="Enter email..." className="flex-1 bg-transparent border-none text-white px-4 py-2.5 text-xs outline-none" />
                <button className="bg-[#cc181e] text-white px-4 py-2.5 font-black text-[10px] tracking-wider uppercase hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Links */}
            {[
              { h: "Quick Links", l: ["Home","About Us","Contact","Blog","Careers"] },
              { h: "Categories", l: ["Fashion","Gadgets","Toys","Books","Beauty"] },
              { h: "Support", l: ["Help Center","Track Order","Returns","Privacy","Terms"] }
            ].map(col => (
              <div key={col.h}>
                <h4 className="font-black text-[11px] text-white uppercase tracking-widest mb-5 opacity-90">
                  {col.h}
                </h4>
                <ul className="list-none space-y-3">
                  {col.l.map(li => (
                    <li key={li}>
                      <button className="bg-none border-none text-slate-400 text-[12px] font-medium hover:text-[#cc181e] transition-colors p-0">
                        {li}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500 font-semibold">© 2026 ByteCore's Mall. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold mr-2">Payments:</span>
              {["💳","🏦","📱","💰","🔐"].map((p, i) => (
                <span key={i} className="bg-[#1a1a1a] border border-slate-800 px-2 py-1 rounded text-xs">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
