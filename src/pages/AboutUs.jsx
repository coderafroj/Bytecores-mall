import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Target, Users, Shield, Award, Zap, Building } from 'lucide-react';

const AboutUs = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-white pt-32 pb-24"
    >
      <Helmet>
        <title>About Bytecores Mall | Premium Tech & Shopping in Bareilly</title>
        <meta name="description" content="Discover the story of Bytecores Mall and ByteCore Computer Centre in Nariyawal, Bareilly. We are committed to providing high-quality tech products and education to the community." />
        <link rel="canonical" href="https://mall.bytecores.in/about-us" />
      </Helmet>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-full font-black text-xs uppercase tracking-widest mb-8"
          >
            <Building size={14} />
            Our Story
          </motion.div>
          <h1 className="text-6xl lg:text-9xl font-black text-slate-900 tracking-tighter mb-8 uppercase leading-[0.9]">
            A Legacy of <br /><span className="text-red-500">Excellence</span>
          </h1>
          <p className="text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed">
            ByteCore Computer Centre, Bareilly, is a premier institution dedicated to technology education and digital empowerment. ByteCore Mall was established to provide our students at Nariyawal and Thiriya campuses, as well as the wider Bareilly tech community, with reliable, high-quality computer hardware, software, and study materials.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { label: "Founded", value: "2018", sub: "Bareilly, UP" },
            { label: "Students Trained", value: "5000+", sub: "In various tech fields" },
            { label: "Products Delivered", value: "10K+", sub: "Across the region" }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 p-12 rounded-[3rem] text-center border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
              <h2 className="text-6xl font-black text-slate-900 mb-2">{stat.value}</h2>
              <p className="text-lg font-bold text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
          <div>
            <h2 className="text-5xl font-black text-slate-900 mb-12 tracking-tight uppercase">Our Mission</h2>
            <div className="space-y-12">
              {[
                { icon: <Target className="text-red-500" />, title: "Empowering People", desc: "Our core goal at ByteCore Computer Centre is to empower individuals with the skills and tools they need to succeed in the digital age." },
                { icon: <Shield className="text-emerald-500" />, title: "Quality Assurance", desc: "Every product at ByteCore Mall undergoes rigorous quality checks to ensure our customers get only the best." },
                { icon: <Users className="text-blue-500" />, title: "Community Driven", desc: "We are more than just a business; we are a part of Bareilly's growing tech ecosystem." }
              ].map((item, i) => (
                <div key={i} className="flex gap-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{item.title}</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden">
               <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000" alt="Tech" className="w-full h-full object-cover grayscale" />
            </div>
            <div className="absolute -bottom-12 -right-12 bg-red-600 p-12 rounded-[3rem] text-white shadow-2xl hidden lg:block">
              <Zap size={48} className="mb-6" />
              <p className="text-2xl font-black uppercase leading-tight">Innovating Since<br />2018</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutUs;
