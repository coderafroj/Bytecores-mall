import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, Loader2, Phone, CheckCircle } from 'lucide-react';
import logo from '../assets/bytecoreMall.jpg';
import authService from '../appwrite/auth';
import { login as authLogin } from '../store/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  const user = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match!");
        }
        await authService.createAccount({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        // After account creation, store phone in prefs
        await authService.updatePrefs({ phone: formData.phone });
      } else {
        await authService.login({
          email: formData.email,
          password: formData.password
        });
      }
      const userData = await authService.getCurrentUser();
      if (userData) {
        dispatch(authLogin(userData));
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-12 left-1/2 -translate-x-1/2 glass-dark text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl z-[9999] border border-white/10 animate-reveal flex items-center gap-4';
        toast.innerHTML = `<div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div> ${isLogin ? 'Access Granted! Initializing Matrix...' : 'Account Created! Welcome to the Elite.'}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => {
                toast.remove();
                navigate('/');
            }, 300);
        }, 2000);
      }
    } catch (err) {
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('Invalid credentials')) msg = "Incorrect email or password. Please try again.";
      if (msg.includes('user_already_exists')) msg = "An account with this email already exists.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await authService.loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google Login failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 lg:p-12">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-8">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 flex items-center justify-center shadow-2xl shadow-slate-950/20 group">
                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform" />
              </div>
            </Link>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Bytecore's Mall</h2>
            <p className="text-slate-500 font-bold text-sm">
              {isLogin ? 'Sign in to access your premium account' : 'Create an account to join the elite club'}
            </p>
          </div>

          <div className="flex bg-slate-100/80 p-1.5 rounded-[1.5rem] mb-10 relative">
            <motion.div 
              layoutId="activeTabBg"
              className="absolute inset-y-1.5 bg-white rounded-2xl shadow-sm z-0"
              style={{ width: 'calc(50% - 6px)', left: isLogin ? '6px' : 'calc(50%)' }}
            />
            <button 
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest relative z-10 transition-colors ${isLogin ? 'text-slate-900' : 'text-slate-400'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest relative z-10 transition-colors ${!isLogin ? 'text-slate-900' : 'text-slate-400'}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3 border border-red-100"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4.5 pl-14 font-bold text-slate-900 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm focus:shadow-red-500/10"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4.5 pl-14 font-bold text-slate-900 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm focus:shadow-red-500/10"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4.5 pl-14 font-bold text-slate-900 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm focus:shadow-red-500/10"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                {isLogin && <button type="button" className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Forgot?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4.5 pl-14 font-bold text-slate-900 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm focus:shadow-red-500/10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Confirm Password</label>
                <div className="relative group">
                  <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4.5 pl-14 font-bold text-slate-900 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm focus:shadow-red-500/10"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl hover:shadow-red-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div className="relative my-10 flex items-center">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Secure Login With</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest py-4.5 rounded-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-sm"
          >
            {googleLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            )}
            <span>Google Workspace</span>
          </button>
          
          <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            By continuing, you agree to Bytecore's <br />
            <span className="text-slate-900 hover:text-red-600 cursor-pointer underline">Terms of Service</span> & <span className="text-slate-900 hover:text-red-600 cursor-pointer underline">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
