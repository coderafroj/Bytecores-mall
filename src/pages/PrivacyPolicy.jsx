import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-24"
    >
      <Helmet>
        <title>Privacy Policy | Bytecores Mall</title>
        <link rel="canonical" href="https://mall.bytecores.in/privacy-policy" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-12 text-red-500">
            <Shield size={32} />
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Privacy Policy</h1>
          </div>
          
          <div className="space-y-12 text-slate-600">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <FileText size={20} className="text-red-500" />
                1. Introduction
              </h2>
              <p className="text-lg font-bold leading-relaxed mb-4">
                Welcome to ByteCore Mall, a division of ByteCore Computer Centre. Your privacy is critically important to us. It is ByteCore Computer Centre's policy to respect your privacy regarding any information we may collect while operating our website.
              </p>
              <p className="text-lg font-bold leading-relaxed">
                This Privacy Policy applies to <a href="https://mall.bytecores.in" className="text-red-500">mall.bytecores.in</a>. We respect your privacy and are committed to protecting personally identifiable information you may provide us through the Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Lock size={20} className="text-red-500" />
                2. Information We Collect
              </h2>
              <p className="text-lg font-bold leading-relaxed mb-4">
                We collect information from you when you register on our site, place an order, or subscribe to our newsletter. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, or phone number.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Eye size={20} className="text-red-500" />
                3. Use of Information
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                Any of the information we collect from you may be used in one of the following ways:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-lg font-bold">
                <li>To personalize your experience</li>
                <li>To improve our website</li>
                <li>To improve customer service</li>
                <li>To process transactions</li>
                <li>To send periodic emails</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Shield size={20} className="text-red-500" />
                4. Data Protection
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We use state-of-the-art encryption and secure servers to protect your data.
              </p>
            </section>

            <section className="pt-12 border-t border-slate-100">
              <p className="text-slate-400 font-bold">Last Updated: May 2024</p>
              <p className="text-slate-400 font-bold">ByteCore Computer Centre, Nariyawal Campus, Bareilly, UP.</p>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
