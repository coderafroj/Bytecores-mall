import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Contact = () => {
  const [formState, setFormState] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-white pt-32 pb-24"
    >
      <Helmet>
        <title>Contact Us | Bytecore's Mall Support</title>
        <meta name="description" content="Need help? Contact Bytecore's Mall support team for orders, returns, or any queries. We're here to help you 24/7." />
      </Helmet>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <h1 className="text-5xl lg:text-8xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            Let's <span className="text-red-500 text-stroke-red">Connect</span>
          </h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
            Have a question or just want to say hi? Our team is always ready to help you with your shopping journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-32 items-start">
          {/* Contact Information */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: <Mail />, title: "Email Us", detail: "support@bytecores.com", sub: "Response within 24h" },
                { icon: <Phone />, title: "Call Us", detail: "+91 9999 000 999", sub: "Mon-Sat, 9am-6pm" },
                { icon: <MessageSquare />, title: "Live Chat", detail: "Active Now", sub: "Average wait: 2 mins" },
                { icon: <Clock />, title: "Working Hours", detail: "24/7 Online", sub: "Orders processed daily" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-red-200 transition-all group"
                >
                  <div className="w-14 h-14 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-lg font-bold text-slate-900">{item.detail}</p>
                  <p className="text-sm font-bold text-slate-400">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-3xl font-black mb-6 relative z-10">Our Main Office</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <MapPin className="text-red-500 shrink-0" size={24} />
                  <p className="text-lg font-bold text-slate-400 leading-relaxed">
                    123 Innovation Drive, Tech Park Area,<br />
                    New Delhi, India - 110001
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Globe className="text-red-500" size={24} />
                  <p className="text-lg font-bold text-slate-400">www.bytecores-mall.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl border border-slate-100">
            {formState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <Send size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Message Sent!</h2>
                <p className="text-xl text-slate-500 font-bold mb-10">We've received your query and will get back to you shortly.</p>
                <button 
                  onClick={() => setFormState('idle')}
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black transition-all hover:bg-red-500"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">First Name</label>
                    <input type="text" required placeholder="John" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Last Name</label>
                    <input type="text" required placeholder="Doe" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Email Address</label>
                  <input type="email" required placeholder="john@example.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Subject</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all appearance-none">
                    <option>General Inquiry</option>
                    <option>Order Status</option>
                    <option>Return/Refund</option>
                    <option>Bulk Orders</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Message</label>
                  <textarea rows="5" required placeholder="How can we help you?" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 font-bold focus:border-red-500 outline-none transition-all"></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full bg-red-500 hover:bg-black text-white font-black text-xl py-6 rounded-3xl transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70"
                >
                  {formState === 'submitting' ? "Sending..." : "Send Message"}
                  <Send size={24} strokeWidth={3} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
