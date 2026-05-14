import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Package, Settings, LogOut, ChevronRight, 
  ShoppingBag, CreditCard, MapPin, Bell, Shield,
  ExternalLink, Clock, CheckCircle, ArrowLeft
} from 'lucide-react';
import authService from '../appwrite/auth';
import { logout as authLogout } from '../store/authSlice';
import databaseService from '../appwrite/db';
import { Query } from 'appwrite';

const Profile = () => {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserOrders();
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const res = await databaseService.databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
        [
          Query.equal('userEmail', user.email),
          Query.orderDesc('$createdAt'),
          Query.limit(5)
        ]
      );
      if (res) setOrders(res.documents);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    dispatch(authLogout());
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-12">
      {/* Premium Header */}
      <div className="bg-slate-900 pt-12 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-red-500 to-red-600 p-1 shadow-2xl"
          >
            <div className="w-full h-full rounded-[2.3rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
              {user.name?.[0].toUpperCase()}
            </div>
          </motion.div>
          
          <div className="text-center md:text-left">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase"
            >
              {user.name}
            </motion.h1>
            <p className="text-slate-400 font-bold mt-2 flex items-center justify-center md:justify-start gap-2">
              <Shield size={16} className="text-emerald-500" />
              Verified Account • {user.email}
            </p>
          </div>
          
          <div className="md:ml-auto flex gap-4">
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all backdrop-blur-md border border-white/5">
                <Settings size={24} />
            </button>
            <button 
                onClick={handleLogout}
                className="p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all border border-red-500/20"
            >
                <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Account Management</h3>
                <nav className="space-y-2">
                    {[
                        { icon: <User size={20} />, label: 'Profile Details', active: true },
                        { icon: <CreditCard size={20} />, label: 'Payment Methods' },
                        { icon: <MapPin size={20} />, label: 'Addresses' },
                        { icon: <Bell size={20} />, label: 'Notifications' },
                        { icon: <Shield size={20} />, label: 'Privacy & Security' }
                    ].map((item, i) => (
                        <button key={i} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${item.active ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-600 hover:bg-slate-50'}`}>
                            {item.icon}
                            {item.label}
                            {item.active && <ChevronRight size={16} className="ml-auto" />}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h4 className="font-black text-xl mb-2">Bytecore Prime</h4>
                    <p className="text-slate-400 text-sm font-bold mb-6">Enjoy free delivery and early access to deals.</p>
                    <button className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs uppercase tracking-widest">Upgrade Now</button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl -mr-16 -mt-16" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Recent Orders</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Order history & tracking</p>
                    </div>
                    <Link to="/orders" className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">View All</Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />)}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.$id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-red-500/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                                        <Package size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-slate-900 text-sm uppercase">Order #{order.$id.slice(-8).toUpperCase()}</p>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">Planted on {new Date(order.$createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900 tracking-tighter">₹{order.total}</p>
                                    <button className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 hover:underline flex items-center gap-1">
                                        Details <ExternalLink size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <ShoppingBag size={40} />
                        </div>
                        <p className="font-bold text-slate-400">No orders found yet.</p>
                        <Link to="/products" className="inline-block mt-6 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">Start Shopping</Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group cursor-pointer hover:border-red-500/20 transition-all">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 uppercase">Support</h4>
                        <p className="text-xs font-bold text-slate-400">24/7 help center</p>
                    </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group cursor-pointer hover:border-red-500/20 transition-all">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 uppercase">Wishlist</h4>
                        <p className="text-xs font-bold text-slate-400">0 items saved</p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
