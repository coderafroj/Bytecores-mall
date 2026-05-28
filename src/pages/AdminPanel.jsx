import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';
import databaseService from '../appwrite/db';
import storageService from '../appwrite/storage';
import { 
  Plus, LayoutDashboard, Package, ShoppingCart, Users, 
  LogOut, Search, Filter, TrendingUp, 
  CheckCircle, Clock, Edit, Trash2, 
  Image as ImageIcon, DollarSign, Tag, Briefcase, ChevronRight, ArrowRight, Upload,
  X, Eye, FileText, Printer, Download, ExternalLink, RefreshCcw, MessageSquare,
  Settings, Shield, Activity, Bell, HelpCircle, Crop
} from 'lucide-react';
import { Query } from 'appwrite';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const AdminPanel = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals / Overlays
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalMessages: 0
  });

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'electronics',
    description: '',
    imageUrl: '',
    stock: 100,
    rating: 4.5,
    reviews: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes, feedbackRes] = await Promise.all([
        databaseService.getProducts([Query.limit(100)]),
        databaseService.databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
            [Query.limit(100), Query.orderDesc('$createdAt')]
        ),
        databaseService.getFeedbacks([Query.limit(100), Query.orderDesc('$createdAt')])
      ]);

      if (prodRes) setProducts(prodRes.documents);
      if (orderRes) setOrders(orderRes.documents);
      if (feedbackRes) setFeedbacks(feedbackRes.documents);

      const totalSales = orderRes?.documents
        .filter(o => o.paymentStatus === 'paid' || o.paymentMethod === 'cod')
        .reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const pending = orderRes?.documents.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalSales,
        totalOrders: orderRes?.total || 0,
        totalProducts: prodRes?.total || 0,
        pendingOrders: pending,
        totalMessages: feedbackRes?.total || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const customers = useMemo(() => {
    const uniqueUsers = {};
    orders.forEach(order => {
      if (!uniqueUsers[order.userEmail]) {
        uniqueUsers[order.userEmail] = {
          name: order.userName,
          email: order.userEmail,
          orders: 0,
          totalSpent: 0,
          lastOrder: order.$createdAt
        };
      }
      uniqueUsers[order.userEmail].orders += 1;
      uniqueUsers[order.userEmail].totalSpent += order.total;
    });
    return Object.values(uniqueUsers);
  }, [orders]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let finalImageUrl = productForm.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

      if (imageFile) {
        const fileResponse = await storageService.uploadFile(imageFile);
        if (fileResponse) {
          finalImageUrl = storageService.getFilePreview(fileResponse.$id);
        }
      }

      const productData = {
        ...productForm,
        imageUrl: finalImageUrl,
        price: parseFloat(productForm.price) || 0,
        originalPrice: parseFloat(productForm.originalPrice || productForm.price) || 0,
        stock: parseInt(productForm.stock) || 0,
        rating: parseFloat(productForm.rating) || 4.5,
        reviews: parseInt(productForm.reviews) || 0
      };

      if (editingProduct) {
        await databaseService.updateProduct(editingProduct.$id, productData);
      } else {
        await databaseService.createProduct(productData);
      }

      setShowAddForm(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Action failed: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      originalPrice: '',
      category: 'electronics',
      description: '',
      imageUrl: '',
      stock: 100,
      rating: 4.5,
      reviews: 0
    });
    setImageFile(null);
    setImageSrc(null);
    setShowCropper(false);
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews
    });
    setShowAddForm(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await databaseService.updateOrderStatus(orderId, newStatus);
      fetchData();
      if (selectedOrder && selectedOrder.$id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await databaseService.deleteProduct(productId);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setShowCropper(true);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const saveCroppedImage = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Create a new File from the blob
      const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
      setImageFile(croppedFile);
      setShowCropper(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Overview' },
    { id: 'products', icon: <Package />, label: 'Inventory' },
    { id: 'orders', icon: <ShoppingCart />, label: 'Orders' },
    { id: 'customers', icon: <Users />, label: 'Customers' },
    { id: 'messages', icon: <MessageSquare />, label: 'Messages' },
    { id: 'system', icon: <Activity />, label: 'System Status' },
    { id: 'settings', icon: <Settings />, label: 'Settings' }
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.$id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-20 h-20 border-[6px] border-red-500/10 border-t-red-500 rounded-full" 
        />
        <p className="text-red-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Initializing Terminal Mall System</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FBFCFE] text-slate-900 font-sans selection:bg-red-500/10 selection:text-red-600">
      {/* Premium Sidebar */}
      <aside className="w-[300px] bg-slate-950 text-white fixed h-screen hidden lg:flex flex-col border-r border-white/5 z-50">
        <div className="p-10">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40">
                    <Shield size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">ByteCore Mall</h1>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">A Division of ByteCore Computer Centre</p>
                </div>
            </div>
            
            <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="w-11 h-11 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-red-500 border border-white/10 shadow-inner">
                    {user?.firstName?.[0] || 'A'}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{user?.fullName || 'Admin User'}</p>
                    <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Administrator
                    </div>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-black group ${
                activeTab === item.id 
                  ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-xs uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />}
            </button>
          ))}
        </nav>

        <div className="p-10 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (App-like) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 z-[100] px-6 py-4 rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] flex items-center justify-between safe-area-pb">
        {sidebarItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              activeTab === item.id ? 'text-red-500 scale-110' : 'text-slate-500 hover:text-white'
            }`}
          >
            <span className="relative">
              {item.icon}
              {activeTab === item.id && <motion.div layoutId="mobileTab" className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_red]" />}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-black mt-1">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1.5 transition-all duration-300 text-slate-500 hover:text-red-500"
        >
          <LogOut size={24} />
          <span className="text-[9px] uppercase tracking-widest font-black mt-1">Exit</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 lg:ml-[300px] min-h-screen">
        <header className="sticky top-0 bg-white/70 backdrop-blur-2xl border-b border-slate-100 px-6 lg:px-12 py-6 lg:py-8 flex items-center justify-between z-40">
            <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <span>Terminal</span>
                    <ChevronRight size={10} />
                    <span className="text-red-600 truncate max-w-[100px] sm:max-w-none">{activeTab}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase">
                    {sidebarItems.find(i => i.id === activeTab)?.label}
                </h2>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative hidden xl:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Master Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-100/50 border border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl py-3.5 pl-12 pr-6 font-bold text-sm outline-none transition-all w-80" 
                    />
                </div>
                <button 
                    onClick={fetchData}
                    className="p-3.5 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                    <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                </button>
                <button 
                    onClick={() => { resetProductForm(); setShowAddForm(true); }}
                    className="bg-slate-950 text-white font-black px-5 sm:px-8 py-3.5 rounded-2xl shadow-2xl shadow-slate-950/20 hover:bg-red-600 hover:shadow-red-600/20 transition-all active:scale-95 flex items-center gap-3 text-xs uppercase tracking-widest"
                >
                    <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">New Object</span>
                </button>
            </div>
        </header>

        <div className="p-6 lg:p-12 pb-32 lg:pb-12 max-w-[1800px] mx-auto">
            {activeTab === 'dashboard' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: 'Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+18.2%' },
                            { label: 'Transactions', value: stats.totalOrders, icon: <ShoppingCart size={24} />, color: 'text-blue-600', bg: 'bg-blue-500/10', trend: '+5.4%' },
                            { label: 'Products', value: stats.totalProducts, icon: <Package size={24} />, color: 'text-violet-600', bg: 'bg-violet-500/10', trend: 'Optimal' },
                            { label: 'Pending', value: stats.pendingOrders, icon: <Clock size={24} />, color: 'text-red-600', bg: 'bg-red-500/10', trend: 'Attention' }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 group hover:border-red-500/20 transition-all"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100">{stat.trend}</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                        <div className="xl:col-span-2 bg-white rounded-[3rem] shadow-[0_8px_60px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col">
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">Matrix Revenue Flux</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time financial synchronization</p>
                                </div>
                                <div className="flex gap-2">
                                    {['7D', '1M', '1Y'].map(t => (
                                        <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === '7D' ? 'bg-slate-950 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Pro CSS Chart */}
                            <div className="flex-1 p-10 min-h-[400px] flex flex-col justify-end">
                                <div className="flex items-end justify-between gap-4 h-[300px] mb-8">
                                    {[65, 45, 78, 52, 90, 70, 85].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                                            <div className="absolute -top-10 bg-slate-950 text-white px-3 py-1.5 rounded-lg text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                                ₹{(h * 1000).toLocaleString()}
                                            </div>
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                className={`w-full max-w-[40px] rounded-t-2xl transition-all duration-500 group-hover:bg-red-500 shadow-2xl ${i === 4 ? 'bg-red-600' : 'bg-slate-900'}`}
                                            />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Day {i+1}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Load</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">₹90,000</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mean Value</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">₹62,400</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('orders')} className="group flex items-center gap-3 text-[10px] font-black text-red-600 uppercase tracking-widest">
                                        Exfiltrate Full Logs <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 flex flex-col">
                            {/* Live Terminal */}
                            <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden flex-1 flex flex-col shadow-2xl shadow-slate-950/40 border border-white/5">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center animate-pulse">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black uppercase tracking-tight">Live Terminal</h3>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol v2.4.0 Active</p>
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                    </div>
                                    
                                    <div className="flex-1 font-mono text-[9px] space-y-3 opacity-80 custom-scrollbar overflow-y-auto pr-4">
                                        <p className="text-emerald-500">[12:44:01] AUTH_SYNC: Admin connection established</p>
                                        <p className="text-blue-400">[12:44:05] DB_PULL: Fetched {products.length} products successfully</p>
                                        <p className="text-slate-500">[12:44:12] SYS_STATUS: All nodes healthy (latency 42ms)</p>
                                        <p className="text-emerald-500">[12:44:15] ORDER_FETCH: Syncing {orders.length} transaction records</p>
                                        <p className="text-amber-400">[12:44:20] CACHE_HIT: Global dashboard analytics ready</p>
                                        <p className="text-red-500 animate-pulse">[12:44:25] ACTION: Admin viewed Overview Matrix</p>
                                        <p className="text-slate-500">[12:44:30] SECURITY: Layer 7 protection active</p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
                                        <div>
                                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                                <span>Core Processing</span>
                                                <span className="text-emerald-500">Optimum</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '38%' }} transition={{ duration: 2 }} className="h-full bg-emerald-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                                <span>Memory Utilization</span>
                                                <span className="text-blue-500">12GB / 32GB</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '62%' }} transition={{ duration: 2 }} className="h-full bg-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="relative z-10 w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest mt-10 shadow-2xl">
                                        <Shield size={16} /> Encryption Key Verified
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product, i) => (
                            <motion.div 
                                key={product.$id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-red-500/20 transition-all duration-500"
                            >
                                <div className="aspect-square bg-slate-50/50 relative overflow-hidden p-10">
                                    <img 
                                        src={product.imageUrl || '/placeholder.jpg'} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                        <button 
                                            onClick={() => startEditProduct(product)}
                                            className="w-14 h-14 bg-white text-slate-950 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-2xl"
                                        >
                                            <Edit size={24} />
                                        </button>
                                        <button 
                                            onClick={() => deleteProduct(product.$id)}
                                            className="w-14 h-14 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300 delay-150 shadow-2xl"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-1.5 bg-white shadow-xl text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-100">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-black text-slate-900 text-xl mb-6 truncate uppercase tracking-tight">{product.name}</h3>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valuation</p>
                                            <span className="text-2xl font-black text-red-600 tracking-tighter">₹{product.price}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Units</p>
                                            <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{product.stock}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal Name</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Value</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Object Count</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Date</th>
                                    <th className="px-10 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredOrders.map((order) => {
                                    const items = JSON.parse(order.items || '[]');
                                    return (
                                        <tr key={order.$id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-sm text-white uppercase shadow-xl">
                                                        {order.userName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-slate-900 uppercase">{order.userName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">{order.userEmail}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                                                    order.status === 'processing' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 font-black text-slate-900 text-lg">₹{order.total}</td>
                                            <td className="px-10 py-8">
                                                <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{items.length} units</span>
                                            </td>
                                            <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase">
                                                {new Date(order.$createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-10 py-8">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="w-11 h-11 bg-slate-100 text-slate-900 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'customers' && (
                <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal Profile</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Orders</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Life Time Value</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Activity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Provider</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {customers.map((customer, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-red-600 border border-slate-200">
                                                    {customer.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900 uppercase">{customer.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{customer.orders} Orders</span>
                                        </td>
                                        <td className="px-10 py-8 font-black text-emerald-600 text-lg">₹{customer.totalSpent.toLocaleString()}</td>
                                        <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase">
                                            {new Date(customer.lastOrder).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest">Google Auth</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">Inbound Transmissions</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Messages Logged: {stats.totalMessages}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sender Protocol</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject Classification</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission Body</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No incoming transmissions found</td>
                                    </tr>
                                ) : feedbacks.map((fb) => (
                                    <tr key={fb.$id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-10 py-8 min-w-[250px]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-xl shadow-indigo-500/30">
                                                    {fb.firstName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900 uppercase">{fb.firstName} {fb.lastName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">{fb.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm inline-block">
                                                {fb.subject}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 max-w-[400px]">
                                            <p className="text-sm font-bold text-slate-600 line-clamp-2 leading-relaxed">{fb.message}</p>
                                        </td>
                                        <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase">
                                            {new Date(fb.$createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="bg-slate-950 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl">
                             <div className="flex items-center justify-between mb-12">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Live Terminal Logs</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Listening...</span>
                                </div>
                             </div>
                             <div className="font-mono text-xs space-y-4 opacity-70">
                                <p className="text-emerald-500">[2024-05-14 12:45:12] AUTH_SUCCESS: user_id: 6a04... logged in via Google_OAuth2</p>
                                <p className="text-blue-400">[2024-05-14 12:45:15] DB_QUERY: fetched 100 documents from products_collection</p>
                                <p className="text-amber-400">[2024-05-14 12:45:22] CACHE_HIT: assets/logo.png served from edge_node_4</p>
                                <p className="text-slate-500">[2024-05-14 12:45:30] SYSTEM_CHECK: Memory usage 42%, CPU 12%</p>
                                <p className="text-red-400">[2024-05-14 12:45:45] WARNING: detected high traffic from IP 192.168.1.1</p>
                                <p className="text-emerald-500">[2024-05-14 12:46:01] DB_WRITE: order_id: ord_9921 created successfully</p>
                             </div>
                        </div>

                        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-12">Resource Allocation</h3>
                            <div className="space-y-10">
                                {[
                                    { label: 'Storage Bucket', value: '1.2 GB / 50 GB', percent: 2 },
                                    { label: 'API Bandwidth', value: '45.2 GB / 500 GB', percent: 9 },
                                    { label: 'Database Operations', value: '124k / 1.5M', percent: 8 }
                                ].map((r, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{r.label}</span>
                                            <span className="text-sm font-black text-slate-900">{r.value}</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${r.percent}%` }} className="h-full bg-red-600 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Advanced Add/Edit Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white h-full rounded-l-[4rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-12 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                    {editingProduct ? 'Update Matrix' : 'New Listing'}
                  </h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Matrix configuration portal</p>
                </div>
                <button 
                  onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                  className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} id="product-form" className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Product Designation</label>
                  <input 
                    type="text" required placeholder="Display Name" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
                    value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Current Value (₹)</label>
                        <input 
                            type="number" required placeholder="Price" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
                            value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Market Price (₹)</label>
                        <input 
                            type="number" placeholder="MRP" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
                            value={productForm.originalPrice} onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Matrix Branch</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all cursor-pointer appearance-none shadow-sm"
                            value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        >
                            <option value="electronics">📱 Electronics</option>
                            <option value="fashion">👕 Fashion</option>
                            <option value="home">🏠 Home & Decor</option>
                            <option value="beauty">💄 Beauty</option>
                            <option value="sports">⚽ Sports</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Inventory Stock</label>
                        <input 
                            type="number" required placeholder="Units" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
                            value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Visual Source</label>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative group overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center hover:border-red-600 hover:bg-white transition-all cursor-pointer shadow-sm">
                        <Upload size={40} className="mx-auto text-slate-300 mb-6 group-hover:text-red-600 group-hover:scale-110 transition-all duration-500" />
                        <p className="font-black text-slate-400 text-sm group-hover:text-slate-900">{imageFile ? imageFile.name : 'Click to Upload High-Res Media'}</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    </div>
                    <div className="relative">
                        <ImageIcon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                            type="url" placeholder="Direct CDN Integration URL" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 pl-14 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
                            value={productForm.imageUrl} onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Comprehensive Intelligence</label>
                  <textarea 
                    rows="6" required placeholder="Technical specifications and marketing copy..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 font-black text-slate-900 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
                    value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  ></textarea>
                </div>
              </form>

              <div className="p-12 border-t border-slate-50 bg-white">
                <button 
                  form="product-form"
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-slate-950 text-white font-black text-xl py-7 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70 group hover:bg-red-600"
                >
                  {formLoading ? (
                    <Clock className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="uppercase tracking-widest text-sm">Commit Data to Registry</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && imageSrc && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Crop Image</h3>
                <button onClick={() => { setShowCropper(false); setImageSrc(null); }} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><X size={20} /></button>
              </div>
              <div className="relative w-full h-[50vh] bg-slate-950">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="p-8 bg-white border-t border-slate-50 flex items-center justify-between">
                  <div className="flex-1 mr-8">
                      <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(e.target.value)} className="w-full accent-red-600" />
                  </div>
                  <button onClick={saveCroppedImage} className="bg-slate-950 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 uppercase text-xs hover:bg-red-600 transition-all">
                      <Crop size={18} /> Apply Crop
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-Level Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row h-[85vh]"
            >
              <div className="flex-1 overflow-y-auto p-16 custom-scrollbar border-r border-slate-50">
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-4">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            Transaction Secure
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">RECEIPT</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">ID_NODE: {selectedOrder.$id}</p>
                        {selectedOrder.paymentId && (
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">PAYMENT_ID: {selectedOrder.paymentId}</p>
                        )}
                    </div>
                    <div className="text-right space-y-3">
                        <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                            selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            selectedOrder.status === 'processing' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                            selectedOrder.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                            {selectedOrder.status}
                        </div>
                        <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                            selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                            {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} ({selectedOrder.paymentMethod})
                        </div>
                        <p className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">{new Date(selectedOrder.$createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-20 mb-16">
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Client Registry</p>
                        <div>
                            <p className="font-black text-2xl text-slate-900 uppercase tracking-tight">{selectedOrder.userName}</p>
                            <p className="font-bold text-slate-500 text-sm mt-1">{selectedOrder.userEmail}</p>
                            <p className="font-bold text-slate-500 text-sm mt-1">{selectedOrder.phone}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Geographic Node</p>
                        <p className="font-black text-slate-900 text-sm leading-relaxed uppercase">{selectedOrder.address}</p>
                    </div>
                </div>

                <div className="space-y-8 mb-16">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Matrix Objects</p>
                    {JSON.parse(selectedOrder.items || '[]').map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900 text-sm border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight truncate max-w-[300px]">{item.name}</p>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.quantity} units @ ₹{item.price}</p>
                                </div>
                            </div>
                            <span className="font-black text-slate-900 text-xl tracking-tighter">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50/50 p-12 rounded-[3rem] border border-slate-100 space-y-6">
                    <div className="flex justify-between text-sm font-black text-slate-400 uppercase tracking-widest">
                        <span>Base Valuation</span>
                        <span className="text-slate-900">₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-400 uppercase tracking-widest">
                        <span>Logistics Protocol</span>
                        <span className="text-emerald-500">{selectedOrder.shipping === 0 ? 'FREE_PASS' : `₹${selectedOrder.shipping}`}</span>
                    </div>
                    <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Final Credit Transaction</p>
                            <span className="text-5xl font-black text-red-600 tracking-tighter">₹{selectedOrder.total}</span>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=BYTECORE_ORD" className="opacity-20 grayscale" alt="QR" />
                        </div>
                    </div>
                </div>
              </div>

              <div className="w-[400px] bg-slate-50/50 p-16 flex flex-col gap-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Protocol Control</h3>
                
                <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Matrix State</p>
                    <div className="grid grid-cols-1 gap-3">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button 
                                key={status}
                                onClick={() => updateOrderStatus(selectedOrder.$id, status)}
                                className={`w-full text-left p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${
                                    selectedOrder.status === status 
                                    ? 'bg-slate-950 text-white border-slate-950 shadow-2xl' 
                                    : 'bg-white text-slate-400 border-white hover:border-red-500/20 shadow-sm'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{status}</span>
                                    {selectedOrder.status === status && <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_red]"></div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => updateOrderStatus(selectedOrder.$id, 'cancelled')}
                            className="bg-white border border-slate-200 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                        >
                            <Trash2 size={18} /> Cancel Order
                        </button>
                        <button 
                            onClick={() => {
                                alert('Refund Protocol Initiated for ID: ' + (selectedOrder.paymentId || 'N/A'));
                                updateOrderStatus(selectedOrder.$id, 'cancelled', 'refunded');
                            }}
                            className="bg-white border border-slate-200 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                        >
                            <RefreshCcw size={18} /> Refund
                        </button>
                    </div>
                    <button onClick={() => window.print()} className="w-full bg-white border border-slate-200 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-sm">
                        <Printer size={18} /> Print Record
                    </button>
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="w-full bg-red-600 text-white p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-red-600/30 active:scale-95 transition-all mt-4"
                    >
                        Deactivate Link
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
