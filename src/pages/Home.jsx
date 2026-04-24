import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/firefly1.png';
import HeroSlider from '../components/HeroSlider';
import ProductGrid from '../components/ProductGrid';

const CATS = [
  { name: "Fashion", emoji: "👕", path: "/products/fashion" },
  { name: "Accessories", emoji: "👜", path: "/products/fashion" },
  { name: "Toys", emoji: "🧸", path: "/products" },
  { name: "Books", emoji: "📚", path: "/products" },
  { name: "Gadgets", emoji: "🎧", path: "/products/electronics" },
  { name: "Footwear", emoji: "👟", path: "/products/fashion" },
  { name: "Beauty", emoji: "💄", path: "/products/beauty" },
  { name: "More", emoji: "···", path: "/products" },
];

const TRUST = [
  { icon: "🛡️", t: "100% SECURE PAYMENT" },
  { icon: "🔄", t: "EASY RETURNS", s: "7 Days Return Policy" },
  { icon: "✅", t: "TRUSTED BY", s: "10,000+ Customers" },
  { icon: "🏷️", t: "LOWEST PRICE", s: "Best Value Guarantee" },
  { icon: "🎧", t: "24/7 SUPPORT", s: "We're Here to Help" },
];

const Home = ({ addToCart }) => {
  return (
    <div className="w-full bg-white font-['Segoe_UI',Arial,sans-serif]">
      <Helmet>
        <title>Bytecore's Mall | Best Online Shopping in India</title>
        <meta name="description" content="Welcome to Bytecore's Mall - Your ultimate destination for premium electronics, fashion, and home essentials at unbeatable prices. Shop the latest trends today!" />
        <meta name="keywords" content="online shopping, electronics, fashion, home decor, deals, bytecore's mall" />
        <link rel="canonical" href="https://bytecores-mall.vercel.app/" />
      </Helmet>
      
      {/* 1. Hero Slider Component */}
      <HeroSlider />

      {/* 2. Category Strip */}
      <section className="bg-white border-t border-b border-slate-100 py-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex items-stretch overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {CATS.map((cat, i) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="group flex-shrink-0 lg:flex-1 flex flex-col items-center gap-3 px-4 lg:px-2 py-2 bg-none border-none border-r last:border-r-0 border-slate-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-[56px] h-[56px] lg:w-[66px] lg:h-[66px] rounded-full bg-slate-50 border-[1.5px] border-slate-200 flex items-center justify-center transition-all duration-300 group-hover:border-red-200 group-hover:bg-red-50 group-hover:shadow-lg ${cat.name === 'More' ? 'text-xl lg:text-2xl font-black text-slate-400' : 'text-3xl lg:text-4xl'}`}>
                  {cat.emoji}
                </div>
                <span className="text-[10px] lg:text-[11px] font-black text-slate-700 uppercase tracking-wider group-hover:text-red-500 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products Grid (Admin Functionality retained) */}
      <section className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 font-['Barlow_Condensed',sans-serif]">
              TRENDING <span className="text-red-600">DEALS</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">Discover our handpicked selection of amazing deals at unbeatable prices.</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 transition-colors">
            View All Products
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
        
        <ProductGrid addToCart={addToCart} limit={12} />
      </section>

      {/* 4. Trust Strip (Red Bar) */}
      <section className="bg-red-600 py-6">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-around flex-wrap gap-y-6 gap-x-8">
            {TRUST.map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <span className="text-3xl">{b.icon}</span>
                <div>
                  <div className="font-black text-xs lg:text-sm tracking-widest uppercase">{b.t}</div>
                  {b.s && <div className="text-[11px] opacity-80 font-semibold">{b.s}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section (From old design, modified styling slightly) */}
      <section className="w-full bg-slate-50 border-t border-b border-slate-100 py-20 lg:py-24">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 font-['Barlow_Condensed',sans-serif]">
              GOT <span className="text-red-600">QUESTIONS?</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">Everything you need to know about shopping at Bytecore's Mall.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { q: "What is the delivery time?", a: "Standard delivery takes 3-5 business days across India. Express shipping is available for select cities." },
              { q: "Do you offer Cash on Delivery?", a: "Yes! We offer COD on all orders below ₹5000 to ensure a risk-free shopping experience." },
              { q: "How can I return a product?", a: "We have a no-questions-asked 7-day return policy. Simply head to your profile or contact support." },
              { q: "Are the products genuine?", a: "Absolutely. We source directly from brands and verified distributors to ensure 100% authenticity." }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-red-200 transition-all group"
              >
                <h3 className="text-lg lg:text-xl font-black text-slate-900 mb-3 flex items-center gap-4">
                  <span className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shadow-inner font-black">?</span>
                  {faq.q}
                </h3>
                <p className="text-base lg:text-lg text-slate-500 font-medium pl-14">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer (New Dark Footer) */}
      <footer className="bg-[#0f0f0f] text-white pt-20 pb-10">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand col */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-[42px] h-[42px] bg-red-600 rounded-[10px] flex items-center justify-center font-['Barlow_Condensed',sans-serif] font-black text-[22px] text-white">B</div>
                <div>
                  <div className="font-['Barlow_Condensed',sans-serif] font-black text-[22px] leading-none">
                    <span className="text-white">BYTE</span><span className="text-red-500">CORE'S</span>
                  </div>
                  <div className="text-[9px] tracking-[0.3em] text-slate-400 font-bold mt-1">— MALL —</div>
                </div>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                India's #1 value store. Everything at ₹99 — quality products, fast delivery, guaranteed happiness.
              </p>
              
              {/* Newsletter inside Footer */}
              <div className="flex mb-6 rounded-lg overflow-hidden border border-slate-800 bg-[#1a1a1a] focus-within:border-red-500 transition-colors">
                <input type="email" placeholder="Enter your email..."
                  className="flex-1 bg-transparent border-none text-slate-300 px-4 py-3 text-xs outline-none font-medium placeholder:text-slate-600"
                />
                <button className="bg-gradient-to-r from-red-700 to-red-600 text-white border-none px-5 py-3 font-black text-[11px] tracking-widest uppercase cursor-pointer hover:from-red-600 hover:to-red-500 transition-all">
                  Subscribe
                </button>
              </div>
              
              {/* Socials */}
              <div className="flex gap-3">
                {["📘","📸","🐦","▶️"].map((s, i) => (
                  <button key={i} className="w-[36px] h-[36px] rounded-full bg-[#1a1a1a] border border-slate-800 cursor-pointer text-sm flex items-center justify-center transition-colors hover:bg-red-600 hover:border-red-500">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { h: "Quick Links", l: ["Home","About Us","Contact","Blog","Careers"] },
              { h: "Categories", l: ["Fashion","Gadgets","Toys","Books","Beauty"] },
              { h: "Support", l: ["Help Center","Track Order","Returns","Privacy","Terms"] }
            ].map(col => (
              <div key={col.h}>
                <h4 className="font-black text-xs text-white uppercase tracking-[0.1em] mb-6 pb-3 border-b border-slate-800">
                  {col.h}
                </h4>
                <ul className="list-none space-y-3">
                  {col.l.map(li => (
                    <li key={li}>
                      <button className="bg-none border-none text-slate-400 text-[13px] font-medium cursor-pointer transition-colors hover:text-red-500 p-0 text-left">
                        {li}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-semibold">© 2026 ByteCore's Mall. All rights reserved. Made with ❤️ in India</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold mr-2">Payments:</span>
              {["💳","🏦","📱","💰","🔐"].map((p, i) => (
                <span key={i} className="bg-[#1a1a1a] border border-slate-800 px-2 py-1 rounded text-sm">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
