import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../assets/bytecoreMall.jpg';
import { account } from '../appwrite/config';
import { ID } from 'appwrite';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
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
        await account.create(ID.unique(), formData.email, formData.password, formData.name);
      }
      await account.createEmailPasswordSession(formData.email, formData.password);
      const user = await account.get();
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
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
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
