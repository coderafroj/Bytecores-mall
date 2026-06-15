import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FileText, Scale, AlertCircle, Info } from 'lucide-react';

const TermsConditions = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-24"
    >
      <Helmet>
        <title>Terms & Conditions | ByteCore Computer Centre</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-12 text-blue-600">
            <Scale size={32} />
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Terms of Service</h1>
          </div>
          
          <div className="space-y-12 text-slate-600">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Info size={20} className="text-blue-500" />
                1. Acceptance of Terms
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                By accessing the student resource portal at <a href="https://mall.bytecores.in" className="text-blue-500">mall.bytecores.in</a>, you are agreeing to be bound by these terms of service, all applicable laws and regulations. This platform is strictly an internal resource portal for enrolled students of ByteCore Computer Centre to procure educational materials and hardware.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <FileText size={20} className="text-blue-500" />
                2. Use License
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                Permission is granted to temporarily download one copy of the materials (information or software) on ByteCore Computer Centre's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <AlertCircle size={20} className="text-blue-500" />
                3. Disclaimer
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                The materials on ByteCore Computer Centre's website are provided on an 'as is' basis. ByteCore Computer Centre makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Scale size={20} className="text-blue-500" />
                4. Limitations
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                In no event shall ByteCore Computer Centre or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ByteCore Computer Centre's website.
              </p>
            </section>

            <section className="pt-12 border-t border-slate-100">
              <p className="text-slate-400 font-bold">Last Updated: May 2024</p>
              <p className="text-slate-400 font-bold">ByteCore Computer Centre, Bareilly, UP.</p>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsConditions;
