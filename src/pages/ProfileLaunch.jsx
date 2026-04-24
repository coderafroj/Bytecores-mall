import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import logo from '../assets/firefly1.png';

const ProfileLaunch = () => {
  const [phase, setPhase] = useState(0); // 0: Cinematic Intro, 1: Profile Launch, 2: Cinematic Outro
  const [scissorsIn, setScissorsIn] = useState(false);
  const [ribbonCut, setRibbonCut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Sequence 1: Intro -> Profile
    const t1 = setTimeout(() => {
      setPhase(1);
      
      // Bring in realistic scissors
      setTimeout(() => setScissorsIn(true), 600);

      // Snap the scissors closed to cut the ribbon
      setTimeout(() => setRibbonCut(true), 1300);

      // Fade in the profile content beneath
      setTimeout(() => setShowContent(true), 1500);
    }, 3500); // 3.5 seconds of cinematic intro

    // Sequence 2: Profile -> Outro
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 12500); // Trigger Outro after 12.5 seconds total

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Confetti Effect for Phase 1 (Ribbon Cut)
  useEffect(() => {
    if (phase === 1) {
      const duration = 7 * 1000;
      const animationEnd = Date.now() + 1000 + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval = setInterval(function() {
        if (!ribbonCut) return; // Wait for ribbon to actually split
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [phase, ribbonCut]);

  // Massive Golden Burst for Phase 2 (Outro)
  useEffect(() => {
    if (phase === 2) {
      setTimeout(() => {
        confetti({
          particleCount: 400,
          spread: 180,
          origin: { y: 0.5 },
          colors: ['#EF4444', '#F59E0B', '#FFFFFF', '#000000'],
          zIndex: 100000
        });
      }, 300);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* --- PHASE 0: CINEMATIC INTRO --- */}
      <div className={`absolute inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-red-800 via-red-600 to-red-700 transition-all duration-1200 ease-in-out ${phase === 0 ? 'opacity-100 visible' : 'opacity-0 invisible blur-xl scale-110'}`}>
        {/* Subtle background textures for a premium look */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>
        
        <div 
          className="relative animate-[cinematicZoom_4s_ease-out_forwards] flex flex-col items-center justify-center z-10 w-full px-4"
          style={{ perspective: "1000px" }}
        >
          <motion.div 
            initial={{ rotateX: 20, rotateY: -10, opacity: 0 }}
            animate={{ rotateX: 0, rotateY: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="overflow-hidden pb-2">
              <h1 className="text-6xl md:text-9xl font-black text-white tracking-[0.15em] uppercase drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] leading-none text-center animate-[elegantReveal_1.5s_cubic-bezier(0.2,0.8,0.2,1)_0.2s_forwards]">
                A NEW ERA
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-6xl md:text-9xl font-black text-white/95 tracking-[0.15em] uppercase drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] leading-none text-center ml-6 md:ml-16 animate-[elegantReveal_1.5s_cubic-bezier(0.2,0.8,0.2,1)_0.5s_forwards]">
                BEGINS
              </h1>
            </div>
          </motion.div>
          
          {/* Elegant thick white line */}
          <div className="w-24 md:w-40 h-[6px] bg-white rounded-full mt-10 shadow-[0_5px_15px_rgba(0,0,0,0.5)] opacity-0 animate-[scalePop_1.5s_cubic-bezier(0.2,0.8,0.2,1)_0.8s_forwards]"></div>
        </div>
      </div>

      {/* --- PHASE 1: INSTAGRAM PROFILE MOCKUP (RESPONSIVE HEIGHT) --- */}
      {/* Using responsive view heights so it never touches the top/bottom and stays perfectly mobile-proportioned */}
      <div className={`transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-32'} w-[96vw] max-w-[400px] h-[85vh] max-h-[820px] min-h-[500px] bg-white rounded-[35px] md:rounded-[50px] shadow-[0_40px_80px_rgba(0,0,0,0.9),0_0_100px_rgba(239,68,68,0.2)] border-[8px] md:border-[16px] border-[#1a1a1a] relative overflow-hidden flex flex-col mx-auto my-auto z-10`}>
        
        {/* Dynamic Mobile Notch / Dynamic Island Mock */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[110px] h-[30px] bg-[#1a1a1a] rounded-b-[20px] z-50 flex items-center justify-center">
          <div className="w-14 h-1.5 bg-[#0a0a0a] rounded-full"></div>
        </div>

        {/* Ribbon Overlay (Inside Phone Frame) */}
        <div className={`absolute inset-0 z-[60] pointer-events-none flex items-center justify-center transition-opacity duration-1000 delay-700 ${ribbonCut ? 'opacity-0' : 'opacity-100'}`}>
          {/* Left Ribbon */}
          <div className={`absolute left-0 w-[50.5%] h-16 bg-gradient-to-r from-red-700 to-red-600 shadow-2xl border-y-[3px] border-red-800 transition-transform duration-1000 ease-[cubic-bezier(0.8,0,0.2,1)] flex justify-end items-center ${ribbonCut ? '-translate-x-full' : 'translate-x-0'}`}>
             <div className="text-white font-black text-lg tracking-widest mr-[10px] drop-shadow-md">GRA</div>
          </div>
          
          {/* Right Ribbon */}
          <div className={`absolute right-0 w-[50.5%] h-16 bg-gradient-to-l from-red-700 to-red-600 shadow-2xl border-y-[3px] border-red-800 transition-transform duration-1000 ease-[cubic-bezier(0.8,0,0.2,1)] flex justify-start items-center ${ribbonCut ? 'translate-x-full' : 'translate-x-0'}`}>
             <div className="text-white font-black text-lg tracking-widest ml-[10px] drop-shadow-md z-20">ND</div>
          </div>

          {/* Realistic Animated Scissors */}
          <div className={`absolute z-50 flex items-center justify-center transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] 
            ${!scissorsIn ? 'translate-y-40 translate-x-20 scale-50 opacity-0 rotate-45' 
            : ribbonCut ? 'translate-y-20 translate-x-0 scale-100 opacity-0 rotate-0' 
            : 'translate-y-0 translate-x-0 scale-[1.3] opacity-100 rotate-[-10deg]'}`}>
            
            <div className="relative w-24 h-12 drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] flex items-center justify-center">
              {/* Top Blade & Handle */}
              <div className={`absolute w-full h-full flex items-center transition-transform duration-150 ease-in origin-[32px_center] ${ribbonCut ? 'rotate-[3deg]' : 'rotate-[-30deg]'}`}>
                 {/* Golden Handle */}
                 <div className="w-8 h-8 rounded-full border-[5px] border-yellow-500 shadow-inner flex-shrink-0 bg-transparent"></div>
                 {/* Silver Blade */}
                 <div className="w-16 h-2 bg-gradient-to-r from-slate-200 to-white rounded-r-full shadow-md ml-[-8px] border border-slate-300"></div>
              </div>

              {/* Bottom Blade & Handle */}
              <div className={`absolute w-full h-full flex items-center transition-transform duration-150 ease-in origin-[32px_center] ${ribbonCut ? 'rotate-[-3deg]' : 'rotate-[30deg]'}`}>
                 {/* Golden Handle */}
                 <div className="w-8 h-8 rounded-full border-[5px] border-yellow-500 shadow-inner flex-shrink-0 bg-transparent"></div>
                 {/* Silver Blade */}
                 <div className="w-16 h-2 bg-gradient-to-r from-slate-300 to-slate-100 rounded-r-full shadow-md ml-[-8px] border border-slate-400"></div>
              </div>
              
              {/* Center Pivot Screw */}
              <div className="absolute left-[28px] w-2.5 h-2.5 bg-slate-800 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border border-slate-600 z-10"></div>
            </div>
          </div>
        </div>

        {/* Scrollable Profile Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-8 pb-16 relative bg-slate-50">
          
          <div className={`transition-all duration-700 transform ${showContent ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-30`}>
            <h1 className="text-[17px] font-bold tracking-tight">bytecore_mall</h1>
            <div className="flex gap-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-200 transform bg-white pb-2 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="p-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-1.5 rounded-full border-[2.5px] border-dashed border-red-500 animate-[spin_8s_linear_infinite] opacity-80"></div>
                  <div className="absolute -inset-1.5 rounded-full border-[2.5px] border-dotted border-yellow-400 animate-[spin_6s_linear_infinite_reverse] opacity-80"></div>
                  
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[3px] relative z-10 transition-transform duration-700 delay-300 ${showContent ? 'scale-100' : 'scale-0'}`}>
                    <img src={logo} alt="Bytecore Mall" className="w-full h-full rounded-full object-cover border-2 border-white bg-black" />
                  </div>
                </div>
                
                <div className="flex-1 flex justify-around text-center">
                  <div>
                    <div className="font-bold text-lg">0</div>
                    <div className="text-[13px] text-slate-900">posts</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">0</div>
                    <div className="text-[13px] text-slate-900">followers</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">0</div>
                    <div className="text-[13px] text-slate-900">following</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="font-semibold text-[13px] leading-tight text-slate-900">Bytecore's Mall</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Shopping centre</p>
                <p className="text-[13px] text-slate-900 mt-0.5 whitespace-pre-wrap font-medium">Everything is under 99</p>
                <p className="text-[12px] text-blue-800 mt-0.5 leading-tight">NH-24, FARIDPUR ROAD, NARIYAWAL BAREILLY, Bareilly 243123</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-blue-500 font-semibold text-[13px] py-1.5 rounded-lg text-white shadow-sm hover:bg-blue-600 transition">Following</button>
                <button className="flex-1 bg-slate-200 font-semibold text-[13px] py-1.5 rounded-lg text-slate-900 hover:bg-slate-300 transition">Message</button>
                <button className="bg-slate-200 px-3 py-1.5 rounded-lg text-slate-900 hover:bg-slate-300 transition">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                </button>
              </div>
            </div>

            {/* Empty Post State */}
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 border-t border-slate-100">
              <div className="w-16 h-16 rounded-full border-[1.5px] border-slate-300 flex items-center justify-center mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">No Posts Yet</h2>
              <p className="text-xs font-medium">Posts will appear here soon.</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Nav Mock */}
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around py-3 z-40 px-2 pb-5">
          <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div className="w-6 h-6 rounded-full border-[1.5px] border-slate-900 overflow-hidden"><img src={logo} alt="Profile" className="w-full h-full object-cover bg-black" /></div>
        </div>
      </div>

      {/* --- PHASE 2: EPIC OUTRO (AVAILABLE SOON IN NARIYAWAL) --- */}
      {phase === 2 && (
        <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Cinematic Letterbox effect closing in */}
          <div className="absolute top-0 w-full h-[15vh] bg-black shadow-[0_30px_50px_rgba(0,0,0,1)] z-10 animate-[slideDown_1.2s_cubic-bezier(0.8,0,0.2,1)_forwards]"></div>
          <div className="absolute bottom-0 w-full h-[15vh] bg-black shadow-[0_-30px_50px_rgba(0,0,0,1)] z-10 animate-[slideUp_1.2s_cubic-bezier(0.8,0,0.2,1)_forwards]"></div>

          {/* Transparent Red Glass background overlay to match Phase 0 theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/85 via-red-700/85 to-red-800/85 backdrop-blur-xl animate-[fadeInGlass_1s_ease-in_forwards]"></div>
          
          {/* Subtle noise/texture matching Phase 0 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-[fadeInGlass_1s_ease-in_forwards]"></div>
          
          <div className="relative z-20 text-center px-4 flex flex-col items-center w-full max-w-4xl">
            {/* Dramatic Logo Reveal */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white p-1 mb-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] animate-[scalePop_1s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
               <img src={logo} className="w-full h-full rounded-full object-cover bg-black animate-[pulse_2s_ease-in-out_infinite]" />
            </div>

            {/* Cinematic Text Overlay - Matching Coming Soon */}
            <motion.div 
              initial={{ rotateX: -20, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="flex flex-col items-center"
              style={{ perspective: "1000px" }}
            >
              <div className="overflow-hidden pb-2">
                <h2 className="text-6xl md:text-9xl font-black text-white tracking-[0.15em] uppercase drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] leading-none text-center animate-[slideRightFade_1s_cubic-bezier(0.2,0.8,0.2,1)_0.4s_both]">
                  GRAND
                </h2>
              </div>
              
              <div className="overflow-hidden">
                <h2 className="text-6xl md:text-9xl font-black text-white/95 tracking-[0.15em] uppercase drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] leading-none text-center ml-6 md:ml-16 animate-[slideLeftFade_1s_cubic-bezier(0.2,0.8,0.2,1)_0.6s_both]">
                  OPENING
                </h2>
              </div>
            </motion.div>

            {/* In Nariyawal Creative Design */}
            <div className="mt-10 flex items-center gap-6 animate-[fadeUp_1s_ease-out_1.2s_both]">
               <div className="h-[4px] w-12 md:w-24 bg-white rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.3)]"></div>
               <h3 className="text-4xl md:text-6xl font-serif italic font-bold tracking-wider text-yellow-300 drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
                 in Nariyawal
               </h3>
               <div className="h-[4px] w-12 md:w-24 bg-white rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.3)]"></div>
            </div>
            
            <p className="mt-14 text-white uppercase tracking-[0.4em] text-xs md:text-sm animate-[fadeUp_1s_ease-out_1.8s_both] border border-white/30 px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-black">
              LIVE ON MAY 1ST • STAY TUNED
            </p>
          </div>
        </div>
      )}

      {/* Custom Global Animations */}
      <style>{`
        body { background-color: #050505; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes cinematicZoom {
          0% { transform: scale(1); filter: blur(5px); }
          20% { filter: blur(0px); }
          100% { transform: scale(1.1); filter: blur(0px); }
        }
        @keyframes elegantReveal {
          0% { transform: translateY(50px); opacity: 0; filter: blur(10px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }
        @keyframes cinematicScan {
          0% { transform: translateY(-30px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(30px); opacity: 0; }
        }
        @keyframes fadeInGlass {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(16px); }
        }
        @keyframes scalePop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideRightFade {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideLeftFade {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProfileLaunch;
