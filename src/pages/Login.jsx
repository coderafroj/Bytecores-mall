import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
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
    name: ''
  });

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
        await authService.createAccount(formData);
      } else {
        await authService.login(formData);
      }
      const userData = await authService.getCurrentUser();
      if (userData) {
        dispatch(authLogin(userData));
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
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
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-6 lg:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-blue-500/20 blur-[150px] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-12 lg:p-16">
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-[2rem] overflow-hidden shadow-xl border-4 border-slate-50">
               <img src={logo} alt="Bytecore's Mall Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">BYTECORE'S MALL</h2>
            <p className="text-lg font-bold text-slate-500">
              {isLogin ? 'Welcome back! Enter details to login.' : 'Join the club and get amazing deals!'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-2 rounded-[1.5rem] mb-10">
            <button 
              className={`flex-1 py-4 rounded-2xl font-black transition-all ${isLogin ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-red-500'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-4 rounded-2xl font-black transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-red-500'}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl font-bold flex items-center gap-3 border border-red-100">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn /> : <UserPlus />)}
              <span>{isLogin ? 'Login' : 'Create Account'}</span>
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative px-4 bg-white text-xs font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-900 font-black text-lg py-5 rounded-3xl transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {googleLoading ? <Loader2 className="animate-spin" /> : (
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            )}
            <span>Google Login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
