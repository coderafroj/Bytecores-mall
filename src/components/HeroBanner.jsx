import { Link } from 'react-router-dom';
import logo from '../assets/bytecoreMall.jpg';
import { ShieldCheck, Truck, Gift, Award, ChevronRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#fff0f0] via-white to-white py-12 lg:py-24 font-['Segoe_UI',Arial,sans-serif]">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-red-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-red-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* LEFT SIDE: Text and CTA */}
          <div className="flex-1 w-full text-center lg:text-left mt-8 lg:mt-0">
            <h1 className="text-5xl md:text-6xl lg:text-[80px] font-black text-slate-900 leading-[1.1] mb-2 tracking-tight">
              EVERYTHING<br />
              <span className="text-slate-900">ONLY AT </span>
              <span className="text-red-600 font-['Barlow_Condensed',sans-serif] tracking-tighter text-[110px] align-middle inline-block ml-2 -mb-4">₹99</span>
            </h1>
            
            {/* Trust Badges (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-12 mb-10 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <Award size={28} className="text-slate-800" strokeWidth={2.5} />
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900 uppercase">BEST QUALITY</div>
                  <div className="text-[10px] font-semibold text-slate-500">Guaranteed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={28} className="text-slate-800" strokeWidth={2.5} />
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900 uppercase">SAFE SHOPPING</div>
                  <div className="text-[10px] font-semibold text-slate-500">Secure & Easy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Gift size={28} className="text-slate-800" strokeWidth={2.5} />
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900 uppercase">GREAT OFFERS</div>
                  <div className="text-[10px] font-semibold text-slate-500">Daily Deals</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={28} className="text-slate-800" strokeWidth={2.5} />
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900 uppercase">FAST DELIVERY</div>
                  <div className="text-[10px] font-semibold text-slate-500">On Time</div>
                </div>
              </div>
            </div>

            <Link to="/products" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-lg shadow-[0_8px_20px_rgba(220,38,38,0.3)] transition-transform hover:-translate-y-1">
              SHOP NOW <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>

          {/* RIGHT SIDE: Product Composition Image */}
          <div className="flex-1 w-full relative flex justify-center items-center">
            {/* Huge Red Circle Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] bg-red-600 rounded-full z-0"></div>
            
            {/* The Main Image */}
              src={logo} 
              alt="Premium Products at ₹99" 
              className="relative z-10 w-full max-w-[650px] object-contain drop-shadow-2xl"
            />
            
            {/* Floating Tag "ONLY AT ₹99" */}
            <div className="absolute top-[10%] right-[5%] lg:-right-4 z-20 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl shadow-xl p-4 flex flex-col items-center rotate-[8deg] animate-[badgeBounce_3s_ease-in-out_infinite] border border-red-400/50">
              <style>{`@keyframes badgeBounce { 0%, 100% { transform: rotate(8deg) translateY(0); } 50% { transform: rotate(10deg) translateY(-10px); } }`}</style>
              <div className="text-[10px] font-black tracking-widest uppercase mb-1">ONLY AT</div>
              <div className="font-['Barlow_Condensed',sans-serif] font-black text-5xl leading-none">₹99</div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
