import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Zap } from 'lucide-react';
import logo from '../assets/bytecoreMall.png';
const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl shadow-red-600/20 group-hover:rotate-12 transition-transform p-1">
                <img src={logo} alt="ByteCore Mall" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">ByteCore Mall</h2>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Premium Retail Division</span>
              </div>
            </Link>
            <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-md">
              ByteCore Mall is the official tech retail and student supply division of ByteCore Computer Centre, serving our Nariyawal and Thiriya campuses.
            </p>
            <div className="flex gap-4">
              <a href="mailto:bytecore.mall@gmail.com" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">
                <Mail size={20} />
              </a>
              <a href="tel:+916396835709" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">
                <Phone size={20} />
              </a>
              <a href="https://instagram.com/bytecore_mall" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://maps.google.com/?q=Nariyawal+Campus+Bareilly" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">
                <MapPin size={20} />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Shop</h3>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">Laptops</Link></li>
              <li><Link to="/products" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">PC Parts</Link></li>
              <li><Link to="/products" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">Student Kits</Link></li>
              <li><Link to="/products" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">Tech Accessories</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/privacy-policy" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">Refund & Return</Link></li>
              <li><Link to="/about-us" className="text-lg font-bold text-slate-400 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-4 space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Contact Support</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Main Office</p>
                  <p className="text-slate-400 font-bold">Nariyawal Campus, Bareilly, UP, 243123</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Call Us</p>
                  <p className="text-slate-400 font-bold">+91 63968 35709</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Email Us</p>
                  <p className="text-slate-400 font-bold">bytecore.mall@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-slate-500 font-bold text-center md:text-left mb-2">
              © 2024 ByteCore Computer Centre. All Rights Reserved. ByteCore Mall is a unit of ByteCore.
            </p>
            <p className="text-red-500 text-sm font-black tracking-widest uppercase flex items-center gap-2">
              Developed by coderafroj <Zap size={14} className="fill-current" />
            </p>
          </div>
          <div className="flex items-center gap-8">
            <img src="https://razorpay.com/assets/razorpay-logo-white.svg" alt="Razorpay" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <div className="flex gap-4">
              <span className="w-12 h-8 bg-white/5 rounded flex items-center justify-center text-[8px] font-black tracking-widest">VISA</span>
              <span className="w-12 h-8 bg-white/5 rounded flex items-center justify-center text-[8px] font-black tracking-widest">UPI</span>
              <span className="w-12 h-8 bg-white/5 rounded flex items-center justify-center text-[8px] font-black tracking-widest">MC</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
