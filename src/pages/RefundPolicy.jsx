import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { RotateCcw, Package, CreditCard, Clock } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-24"
    >
      <Helmet>
        <title>Refund & Cancellation | ByteCore Computer Centre</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-12 text-emerald-600">
            <RotateCcw size={32} />
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Refund Policy</h1>
          </div>
          
          <div className="space-y-12 text-slate-600">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Clock size={20} className="text-emerald-500" />
                1. Cancellation Policy
              </h2>
              <p className="text-lg font-bold leading-relaxed mb-4">
                Orders can be cancelled within 24 hours of placement or until they are shipped, whichever is earlier. Once the order is shipped, cancellation is not possible.
              </p>
              <p className="text-lg font-bold leading-relaxed">
                To cancel an order, please contact us at <span className="text-emerald-500">bytecore.info@gmail.com</span> with your order ID.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <Package size={20} className="text-emerald-500" />
                2. Return Policy
              </h2>
              <p className="text-lg font-bold leading-relaxed mb-4">
                We offer a 7-day return policy for products that are received in a damaged condition or are different from what was ordered.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg font-bold">
                <li>Item must be unused and in the same condition that you received it.</li>
                <li>It must be in the original packaging.</li>
                <li>Receipt or proof of purchase is required.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <CreditCard size={20} className="text-emerald-500" />
                3. Refund Process
              </h2>
              <p className="text-lg font-bold leading-relaxed">
                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
              </p>
              <p className="text-lg font-bold leading-relaxed mt-4">
                If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 working days.
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

export default RefundPolicy;
