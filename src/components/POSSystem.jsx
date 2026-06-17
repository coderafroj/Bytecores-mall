import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, Printer, PackageX, ShoppingBag, User, Phone, Tag, CreditCard, Wallet, Banknote, X, Zap, Keyboard, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import databaseService from '../appwrite/db';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

const POSSystem = ({ products, refreshData }) => {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    
    // New Mobile & UI state
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [showCustomItem, setShowCustomItem] = useState(false);
    const [customItemData, setCustomItemData] = useState({ name: '', price: '', quantity: 1 });
    const searchInputRef = useRef(null);

    // Fuse.js for typo-tolerant search
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const fuse = new Fuse(products, { keys: ['name', 'category', '$id'], threshold: 0.3 });
        return fuse.search(searchQuery).map(res => res.item);
    }, [searchQuery, products]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.$id === product.$id);
            if (existing) {
                if (!product.isCustom && existing.quantity >= product.stock) {
                    toast.error('Not enough stock available!');
                    return prev;
                }
                toast.success(`Added another ${product.name}`);
                return prev.map(item => item.$id === product.$id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            if (!product.isCustom && product.stock <= 0) {
                toast.error('Product is out of stock!');
                return prev;
            }
            toast.success(`${product.name} added to cart`);
            return [{ ...product, quantity: product.isCustom ? product.quantity : 1 }, ...prev];
        });
    };

    const handleAddCustomItem = () => {
        if (!customItemData.name || !customItemData.price) {
            toast.error('Please enter name and price for custom item');
            return;
        }
        const newCustom = {
            $id: `custom_${Date.now()}`,
            name: customItemData.name,
            price: parseFloat(customItemData.price),
            stock: 999, // infinite
            isCustom: true,
            imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80',
            quantity: parseInt(customItemData.quantity) || 1
        };
        addToCart(newCustom);
        setCustomItemData({ name: '', price: '', quantity: 1 });
        setShowCustomItem(false);
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.$id === id) {
                    const newQ = item.quantity + delta;
                    if (!item.isCustom && newQ > item.stock) {
                        toast.error('Exceeds available stock!');
                        return item;
                    }
                    if (newQ <= 0) return item; // Don't remove here, handle separately
                    return { ...item, quantity: newQ };
                }
                return item;
            });
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.$id !== id));
        toast.info('Item removed');
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (filteredProducts.length > 0) {
                addToCart(filteredProducts[0]);
                setSearchQuery('');
            } else {
                toast.error('No product found!');
            }
        }
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const total = useMemo(() => Math.max(0, subtotal - (Number(discount) || 0)), [subtotal, discount]);

    const handleHoldBill = () => {
        if (cart.length === 0) return;
        const holdData = { cart, customerName, customerPhone, discount, timestamp: new Date().getTime() };
        const existingHolds = JSON.parse(localStorage.getItem('pos_holds') || '[]');
        localStorage.setItem('pos_holds', JSON.stringify([...existingHolds, holdData]));
        toast.success('Bill placed on hold!');
        clearCart();
    };

    const handleResumeBill = () => {
        const existingHolds = JSON.parse(localStorage.getItem('pos_holds') || '[]');
        if (existingHolds.length === 0) {
            toast.error('No bills on hold!');
            return;
        }
        const lastHold = existingHolds.pop();
        setCart(lastHold.cart);
        setCustomerName(lastHold.customerName);
        setCustomerPhone(lastHold.customerPhone);
        setDiscount(lastHold.discount);
        localStorage.setItem('pos_holds', JSON.stringify(existingHolds));
        toast.success('Bill resumed!');
        setIsMobileCartOpen(true);
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount('');
        setIsMobileCartOpen(false);
    };

    // Advanced Barcode Scanner & Global Shortcuts
    useEffect(() => {
        let barcodeBuffer = '';
        let barcodeTimeout = null;

        const handleGlobalKeyDown = (e) => {
            // F2 to focus search
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Shift + Enter to checkout
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                if (cart.length > 0) handleCheckout();
            }
            if (e.key === 'Escape') {
                setIsMobileCartOpen(false);
                setShowCustomItem(false);
            }

            // Simple barcode listener heuristic (fast typing)
            if (e.key.length === 1) {
                barcodeBuffer += e.key;
                clearTimeout(barcodeTimeout);
                barcodeTimeout = setTimeout(() => {
                    if (barcodeBuffer.length > 5 && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                        // Attempt to find by barcode/SKU
                        const found = products.find(p => p.$id.toLowerCase().includes(barcodeBuffer.toLowerCase()) || p.name.toLowerCase().includes(barcodeBuffer.toLowerCase()));
                        if (found) {
                            addToCart(found);
                            toast.success(`Barcode scanned: ${found.name}`);
                        } else {
                            toast.error(`Barcode not found: ${barcodeBuffer}`);
                        }
                    }
                    barcodeBuffer = '';
                }, 50); // 50ms threshold for scanner
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [cart, customerName, customerPhone, discount, paymentMethod, products]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const orderData = {
                userId: user?.id || 'pos_admin',
                userName: customerName || 'Walk-in Customer',
                userEmail: customerPhone ? `${customerPhone}@pos.local` : (user?.primaryEmailAddress?.emailAddress || 'pos@bytecores.in'),
                address: 'In-Store Purchase',
                shippingAddress: 'In-Store Purchase',
                items: JSON.stringify(cart.map(item => ({
                    id: item.$id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    isCustom: item.isCustom || false
                }))),
                subtotal,
                shipping: 0,
                total,
                status: 'delivered',
                paymentMethod: paymentMethod,
                paymentStatus: 'paid'
            };

            const newOrder = await databaseService.createOrder(orderData);

            // Deduct stock only for non-custom items
            for (const item of cart) {
                if (!item.isCustom) {
                    await databaseService.updateProduct(item.$id, {
                        ...item,
                        stock: item.stock - item.quantity
                    });
                }
            }

            setPrintData({
                orderId: newOrder.$id,
                date: new Date().toLocaleString('en-IN'),
                items: cart,
                subtotal,
                discount: Number(discount) || 0,
                total,
                customerName: customerName || 'Walk-in Customer',
                customerPhone: customerPhone || 'N/A',
                paymentMethod: paymentMethod
            });

            toast.success('Bill generated successfully!');
            clearCart();
            if (refreshData) refreshData();

            setTimeout(() => {
                window.print();
                setTimeout(() => setPrintData(null), 1000); // Clear after printing
            }, 500);

        } catch (error) {
            console.error('POS Checkout Error:', error);
            toast.error('Failed to process billing.');
        } finally {
            setIsProcessing(false);
        }
    };

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-120px)] gap-6 pos-container relative">
            {/* Left Side: Product Grid */}
            <div className="flex-1 flex flex-col bg-white lg:rounded-[3rem] rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hide-on-print mb-20 lg:mb-0 relative">
                
                {/* Search Header */}
                <div className="p-4 lg:p-6 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-20 flex flex-col sm:flex-row gap-4 shrink-0">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                        <input 
                            ref={searchInputRef}
                            id="pos-search-input"
                            type="text" 
                            placeholder="Search item or scan barcode (F2)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/30 focus:bg-white rounded-[1.5rem] py-4 pl-14 pr-16 font-bold lg:text-lg text-base outline-none transition-all shadow-inner placeholder:text-slate-400"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-50">
                            <kbd className="bg-slate-200 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-500">F2</kbd>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowCustomItem(!showCustomItem)}
                        className={`shrink-0 flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${
                            showCustomItem ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
                        }`}
                    >
                        {showCustomItem ? <X size={20} /> : <Zap size={20} />}
                        <span className="hidden sm:inline">{showCustomItem ? 'Cancel' : 'Custom Item'}</span>
                    </button>
                </div>
                
                {/* Custom Item Panel */}
                <AnimatePresence>
                    {showCustomItem && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-amber-50/50 border-b border-amber-100 overflow-hidden shrink-0"
                        >
                            <div className="p-4 lg:p-6 flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 ml-2">Item Name</label>
                                    <input type="text" value={customItemData.name} onChange={e => setCustomItemData({...customItemData, name: e.target.value})} placeholder="E.g., Laptop Repair" className="w-full bg-white border border-amber-200 rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-bold" />
                                </div>
                                <div className="w-full sm:w-32 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 ml-2">Price (₹)</label>
                                    <input type="number" value={customItemData.price} onChange={e => setCustomItemData({...customItemData, price: e.target.value})} placeholder="0.00" className="w-full bg-white border border-amber-200 rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-bold" />
                                </div>
                                <div className="w-full sm:w-24 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 ml-2">Qty</label>
                                    <input type="number" min="1" value={customItemData.quantity} onChange={e => setCustomItemData({...customItemData, quantity: e.target.value})} className="w-full bg-white border border-amber-200 rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-bold" />
                                </div>
                                <button onClick={handleAddCustomItem} className="w-full sm:w-auto bg-amber-500 text-white font-black px-8 py-3 rounded-xl hover:bg-amber-600 transition-colors uppercase tracking-widest text-sm shadow-lg shadow-amber-500/20">
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid */}
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-slate-50/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                        {filteredProducts.map(product => (
                            <motion.div 
                                key={product.$id}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => addToCart(product)}
                                className={`cursor-pointer rounded-[1.5rem] lg:rounded-[2rem] border-2 transition-all p-3 lg:p-4 flex flex-col group ${product.stock > 0 ? 'bg-white border-transparent hover:border-blue-500/40 hover:shadow-2xl shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                            >
                                <div className="aspect-square rounded-[1rem] lg:rounded-2xl bg-slate-100/50 p-4 mb-4 relative overflow-hidden flex items-center justify-center">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-black text-slate-800 leading-tight mb-2 line-clamp-2 text-sm lg:text-base group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                <div className="mt-auto flex items-end justify-between">
                                    <span className="font-black text-slate-900 text-lg lg:text-xl tracking-tight">₹{product.price}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${product.stock < 5 ? 'text-red-500 bg-red-50 border-red-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                        Stock: {product.stock}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                            <ScanLine size={64} className="mb-6 opacity-30 text-blue-500" />
                            <p className="font-black text-lg lg:text-xl uppercase tracking-[0.2em] text-slate-500">No Items Found</p>
                            <p className="text-sm font-bold text-slate-400 mt-2">Try a different search or scan a valid barcode.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Bar (Collapsed Cart) */}
            <AnimatePresence>
                {!isMobileCartOpen && !isDesktop && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="lg:hidden fixed bottom-[72px] sm:bottom-20 left-4 right-4 z-40"
                    >
                        <div className="bg-blue-600 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-[0_20px_40px_rgba(37,99,235,0.4)] border border-white/20">
                            <div className="flex items-center gap-4 pl-2">
                                <div className="relative bg-white/20 p-3 rounded-2xl">
                                    <ShoppingBag size={24} />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg">
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] leading-none mb-1">Due Amount</p>
                                    <p className="text-2xl font-black text-white leading-tight tracking-tighter">₹{total.toLocaleString()}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsMobileCartOpen(true)}
                                className="bg-white text-blue-600 font-black px-6 py-4 rounded-[1.5rem] text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                            >
                                Checkout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Right Side: Professional Bill/Cart Panel */}
            <AnimatePresence>
                {(isMobileCartOpen || isDesktop) && (
                    <motion.div 
                        initial={{ opacity: 0, x: isDesktop ? 50 : 0, y: isDesktop ? 0 : 100 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: isDesktop ? 50 : 0, y: isDesktop ? 0 : 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`
                            fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto 
                            w-full lg:w-[480px] lg:h-auto 
                            flex flex-col bg-white text-slate-900 
                            lg:rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.1)] border border-slate-200/60 overflow-hidden
                            ${isMobileCartOpen && !isDesktop ? 'h-screen pt-safe bg-white' : ''}
                        `}
                    >
                        {/* Header */}
                        <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80 backdrop-blur-xl relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                                    <Printer size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Current Bill</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{cart.length} unique items</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleHoldBill} className="hidden lg:flex items-center gap-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Hold
                                </button>
                                <button onClick={handleResumeBill} className="hidden lg:flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Resume
                                </button>
                                {isMobileCartOpen && !isDesktop && (
                                    <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-slate-50/50">
                            {/* Cart Items List */}
                            <div className="p-4 lg:p-6 space-y-3 min-h-[150px]">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 py-16">
                                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                            <ShoppingBag size={40} className="text-slate-300" />
                                        </div>
                                        <p className="font-black uppercase tracking-[0.2em] text-sm text-center px-4 text-slate-400">Cart is empty.<br/>Add items to generate bill.</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <motion.div 
                                            key={item.$id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-[1.5rem] p-3 flex gap-4 transition-all group"
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-[1rem] overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
                                                <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                {item.isCustom && (
                                                    <div className="absolute top-0 right-0 bg-amber-400 text-white text-[8px] font-black uppercase px-1 rounded-bl-md">Custom</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-black text-sm truncate pr-2 text-slate-800">{item.name}</h4>
                                                <span className="font-black text-blue-600 text-sm">₹{item.price}</span>
                                            </div>
                                            <div className="flex flex-col items-end justify-between">
                                                <button onClick={() => removeFromCart(item.$id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mt-auto border border-slate-200">
                                                    <button onClick={() => updateQuantity(item.$id, -1)} className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 hover:text-blue-600 hover:shadow-sm rounded-lg transition-all font-black">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-black text-sm w-6 text-center text-slate-800">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.$id, 1)} className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 hover:text-blue-600 hover:shadow-sm rounded-lg transition-all font-black">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Customer Details Form - Very Premium */}
                            {cart.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 lg:p-8 bg-white border-t border-slate-100"
                                >
                                    <div className="mb-8">
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 text-sm">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><User size={14} /></span>
                                            Customer Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    type="tel" 
                                                    placeholder="Mobile Number (Optional)" 
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/20 focus:bg-white transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="relative">
                                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Customer Name (Optional)" 
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/20 focus:bg-white transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Tag size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    type="number" 
                                                    placeholder="Discount Amount ₹" 
                                                    value={discount}
                                                    onChange={(e) => setDiscount(e.target.value)}
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500/20 focus:bg-white transition-all shadow-inner text-red-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 text-sm">
                                            <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Wallet size={14} /></span>
                                            Payment Mode
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'CASH', icon: <Banknote size={20} /> },
                                                { id: 'UPI', icon: <ScanLine size={20} /> },
                                                { id: 'CARD', icon: <CreditCard size={20} /> }
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    className={`py-4 rounded-[1.5rem] flex flex-col items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                                                        paymentMethod === method.id 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {method.icon}
                                                    {method.id}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Totals & Checkout */}
                        <div className="p-6 lg:p-8 border-t border-slate-200 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10">
                            <div className="space-y-3 mb-6 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-800">₹{subtotal.toLocaleString()}</span>
                                </div>
                                {Number(discount) > 0 && (
                                    <div className="flex justify-between items-center text-sm font-bold text-red-500">
                                        <span>Discount</span>
                                        <span>- ₹{Number(discount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-3xl font-black pt-4 border-t border-slate-200 mt-2">
                                    <span className="text-slate-900 tracking-tighter">Total</span>
                                    <span className="text-blue-600 tracking-tighter">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <button 
                                disabled={cart.length === 0 || isProcessing}
                                onClick={handleCheckout}
                                className="w-full bg-slate-900 text-white font-black text-lg py-5 rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_40px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                                {isProcessing ? (
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin relative z-10" />
                                ) : (
                                    <>
                                        <Printer size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
                                        <span className="relative z-10">Generate Bill (Shift+Enter)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Printable Invoice (Optimized for both Thermal and A4) */}
            {printData && (
                <div id="print-section">
                    <style>
                        {`
                        @media print {
                            body * { visibility: hidden; }
                            #print-section, #print-section * { visibility: visible; }
                            #print-section {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                max-width: 80mm; /* Standard thermal receipt width */
                                margin: 0 auto;
                                font-family: 'Courier New', Courier, monospace;
                                color: #000;
                            }
                            .receipt-container {
                                padding: 10px;
                                text-align: center;
                            }
                            .receipt-header h1 {
                                font-size: 1.5rem;
                                margin: 0;
                                font-weight: 900;
                            }
                            .receipt-header p {
                                margin: 2px 0;
                                font-size: 0.8rem;
                            }
                            .divider {
                                border-top: 1px dashed #000;
                                margin: 10px 0;
                            }
                            .receipt-meta {
                                text-align: left;
                                font-size: 0.8rem;
                                margin-bottom: 10px;
                            }
                            .receipt-meta p { margin: 2px 0; }
                            table {
                                width: 100%;
                                font-size: 0.8rem;
                                text-align: left;
                                border-collapse: collapse;
                            }
                            th { border-bottom: 1px dashed #000; padding-bottom: 5px; }
                            td { padding: 5px 0; vertical-align: top; }
                            .td-qty { text-align: center; }
                            .td-price { text-align: right; }
                            .totals-section {
                                margin-top: 10px;
                                border-top: 1px dashed #000;
                                padding-top: 10px;
                                font-size: 0.9rem;
                                text-align: right;
                            }
                            .totals-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                            .grand-total {
                                font-size: 1.2rem;
                                font-weight: bold;
                                border-top: 1px solid #000;
                                border-bottom: 1px solid #000;
                                padding: 5px 0;
                                margin-top: 5px;
                            }
                            .receipt-footer {
                                margin-top: 15px;
                                font-size: 0.8rem;
                                font-weight: bold;
                            }
                            .barcode {
                                font-family: 'Libre Barcode 39', 'Courier New', monospace;
                                font-size: 2rem;
                                margin-top: 10px;
                            }
                        }
                        `}
                    </style>
                    <div className="receipt-container">
                        <div className="receipt-header">
                            <h1>BYTECORE MALL</h1>
                            <p>Premium Digital Store</p>
                            <p>Ph: +91 9999999999</p>
                            <p>GSTIN: 09XXXXXXXXXXXXX</p>
                        </div>
                        <div className="divider"></div>
                        <div className="receipt-meta">
                            <p><strong>Date:</strong> {printData.date}</p>
                            <p><strong>Bill No:</strong> {printData.orderId.substring(0, 8).toUpperCase()}</p>
                            <p><strong>Customer:</strong> {printData.customerName}</p>
                            {printData.customerPhone !== 'N/A' && <p><strong>Phone:</strong> {printData.customerPhone}</p>}
                            <p><strong>Payment Mode:</strong> {printData.paymentMethod}</p>
                        </div>
                        <div className="divider"></div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th className="td-qty">Qty</th>
                                    <th className="td-price">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {printData.items.map(item => (
                                    <tr key={item.$id}>
                                        <td style={{ paddingRight: '10px' }}>
                                            {item.name}
                                            <div style={{ fontSize: '0.7rem', color: '#555' }}>@ ₹{item.price}</div>
                                        </td>
                                        <td className="td-qty">{item.quantity}</td>
                                        <td className="td-price">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="totals-section">
                            <div className="totals-row">
                                <span>Subtotal:</span>
                                <span>₹{printData.subtotal}</span>
                            </div>
                            {printData.discount > 0 && (
                                <div className="totals-row">
                                    <span>Discount:</span>
                                    <span>-₹{printData.discount}</span>
                                </div>
                            )}
                            <div className="totals-row grand-total">
                                <span>TOTAL:</span>
                                <span>₹{printData.total}</span>
                            </div>
                        </div>
                        <div className="receipt-footer">
                            <p>Thank you for shopping!</p>
                            <p>Visit: mall.bytecores.in</p>
                            <div className="barcode">*{printData.orderId.substring(0, 8)}*</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSSystem;
