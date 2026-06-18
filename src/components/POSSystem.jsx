import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, Printer, PackageX, ShoppingBag, User, Phone, Tag, CreditCard, Wallet, Banknote, X, Zap, Keyboard, ScanLine, ArrowLeft, CheckCircle2, Share2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import databaseService from '../appwrite/db';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

const POSSystem = ({ products, refreshData, onClose }) => {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Digital Receipt State
    const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    // Customer Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    
    // UI states
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [showCustomItem, setShowCustomItem] = useState(false);
    const [customItemData, setCustomItemData] = useState({ name: '', price: '', quantity: 1 });
    const searchInputRef = useRef(null);

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
                    if (newQ <= 0) return item; 
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

    useEffect(() => {
        let barcodeBuffer = '';
        let barcodeTimeout = null;

        const handleGlobalKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                if (cart.length > 0 && !isCheckoutComplete) handleCheckout();
            }
            if (e.key === 'Escape') {
                setIsMobileCartOpen(false);
                setShowCustomItem(false);
            }

            if (e.key.length === 1 && !isCheckoutComplete) {
                barcodeBuffer += e.key;
                clearTimeout(barcodeTimeout);
                barcodeTimeout = setTimeout(() => {
                    if (barcodeBuffer.length > 5 && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                        const found = products.find(p => p.$id.toLowerCase().includes(barcodeBuffer.toLowerCase()) || p.name.toLowerCase().includes(barcodeBuffer.toLowerCase()));
                        if (found) {
                            addToCart(found);
                            toast.success(`Barcode scanned: ${found.name}`);
                        } else {
                            toast.error(`Barcode not found: ${barcodeBuffer}`);
                        }
                    }
                    barcodeBuffer = '';
                }, 50);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [cart, customerName, customerPhone, discount, paymentMethod, products, isCheckoutComplete]);

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

            for (const item of cart) {
                if (!item.isCustom) {
                    await databaseService.updateProduct(item.$id, {
                        ...item,
                        stock: item.stock - item.quantity
                    });
                }
            }

            setCompletedOrder({
                orderId: newOrder.$id,
                date: new Date().toLocaleString('en-IN'),
                items: [...cart],
                subtotal,
                discount: Number(discount) || 0,
                total,
                customerName: customerName || 'Walk-in Customer',
                customerPhone: customerPhone || 'N/A',
                paymentMethod: paymentMethod
            });

            setIsCheckoutComplete(true);
            toast.success('Sale Completed Successfully!');
            clearCart();
            if (refreshData) refreshData();

        } catch (error) {
            console.error('POS Checkout Error:', error);
            toast.error('Failed to process billing.');
        } finally {
            setIsProcessing(false);
        }
    };

    const startNewSale = () => {
        setIsCheckoutComplete(false);
        setCompletedOrder(null);
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        // Fullscreen Overlay Container - Hides Sidebar & Admin Header
        <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col lg:flex-row h-screen w-screen overflow-hidden pos-fullscreen font-sans text-slate-900">
            
            {/* Left Pane: POS Core (70% width on Desktop) */}
            <div className={`flex-1 flex flex-col bg-white border-r border-slate-200 hide-on-print h-full overflow-hidden transition-all duration-300 ${isMobileCartOpen && !isDesktop ? 'hidden' : 'flex'}`}>
                
                {/* Top App Bar */}
                <div className="h-[72px] lg:h-[88px] px-4 lg:px-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-3 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors flex items-center justify-center shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-xl lg:text-2xl uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                                <ScanLine className="text-blue-600" />
                                ByteCore POS
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Live Terminal</p>
                        </div>
                    </div>
                    
                    {/* Immersive Search Bar inside Top Bar */}
                    <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input 
                                ref={searchInputRef}
                                id="pos-search-input"
                                type="text" 
                                placeholder="Search items or scan barcode (F2)" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/30 focus:bg-white rounded-2xl py-3 pl-12 pr-12 font-bold lg:text-base text-sm outline-none transition-all shadow-inner placeholder:text-slate-400"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
                                <kbd className="bg-slate-200 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-500">F2</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowCustomItem(!showCustomItem)} className={`p-3 lg:px-6 lg:py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${showCustomItem ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                            {showCustomItem ? <X size={18} /> : <Zap size={18} />}
                            <span className="hidden lg:inline">{showCustomItem ? 'Cancel' : 'Custom Item'}</span>
                        </button>
                    </div>
                </div>

                {/* Custom Item Slide-down */}
                <AnimatePresence>
                    {showCustomItem && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-amber-50/80 border-b border-amber-100 overflow-hidden shrink-0 backdrop-blur-sm relative z-10 shadow-sm"
                        >
                            <div className="p-4 lg:p-6 flex flex-col sm:flex-row gap-4 items-end max-w-4xl mx-auto">
                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 ml-2">Item Name</label>
                                    <input type="text" value={customItemData.name} onChange={e => setCustomItemData({...customItemData, name: e.target.value})} placeholder="E.g., Screen Guard" className="w-full bg-white border border-amber-200 rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-bold" />
                                </div>
                                <div className="w-full sm:w-32 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 ml-2">Price (₹)</label>
                                    <input type="number" value={customItemData.price} onChange={e => setCustomItemData({...customItemData, price: e.target.value})} placeholder="0" className="w-full bg-white border border-amber-200 rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-bold" />
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

                {/* Product Grid Area */}
                <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 lg:p-6 custom-scrollbar relative">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                        {filteredProducts.map(product => (
                            <motion.div 
                                key={product.$id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addToCart(product)}
                                className={`cursor-pointer rounded-3xl border-2 transition-all p-3 bg-white flex flex-col group ${product.stock > 0 ? 'border-transparent hover:border-blue-500 hover:shadow-[0_10px_40px_rgba(37,99,235,0.1)] shadow-sm' : 'border-slate-100 opacity-60 grayscale-[0.5]'}`}
                            >
                                <div className="aspect-square rounded-[1.2rem] bg-slate-50 p-4 mb-3 relative overflow-hidden flex items-center justify-center">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-black text-slate-800 leading-tight mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors px-1">{product.name}</h3>
                                <div className="mt-auto flex items-center justify-between px-1 pb-1">
                                    <span className="font-black text-slate-900 text-lg">₹{product.price}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${product.stock < 5 ? 'text-red-600 bg-red-100' : 'text-slate-500 bg-slate-100'}`}>
                                        Stock: {product.stock}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-20">
                            <PackageX size={80} className="mb-6 opacity-20 text-slate-900" />
                            <p className="font-black text-2xl uppercase tracking-tighter text-slate-800">No Items Found</p>
                            <p className="text-sm font-bold text-slate-500 mt-2">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>
                
                {/* Mobile Cart Trigger */}
                <AnimatePresence>
                    {!isDesktop && !isMobileCartOpen && !isCheckoutComplete && cart.length > 0 && (
                        <motion.div 
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="absolute bottom-6 left-4 right-4 z-40"
                        >
                            <button onClick={() => setIsMobileCartOpen(true)} className="w-full bg-blue-600 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-[0_20px_40px_rgba(37,99,235,0.4)]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-3 rounded-2xl relative">
                                        <ShoppingBag size={24} />
                                        <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">View Cart</p>
                                        <p className="text-xl font-black leading-tight">₹{total.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg">Checkout</div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Pane: Cart / Checkout / Receipt (Fixed Width Desktop, Full Mobile) */}
            <AnimatePresence>
                {(isDesktop || isMobileCartOpen || isCheckoutComplete) && (
                    <motion.div 
                        initial={{ x: isDesktop ? 400 : 0, y: isDesktop ? 0 : '100%' }}
                        animate={{ x: 0, y: 0 }}
                        exit={{ x: isDesktop ? 400 : 0, y: isDesktop ? 0 : '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`
                            fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto 
                            w-full lg:w-[420px] xl:w-[480px] h-full 
                            bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.05)] 
                            flex flex-col hide-on-print
                        `}
                    >
                        {isCheckoutComplete && completedOrder ? (
                            /* DIGITAL RECEIPT VIEW */
                            <div className="flex flex-col h-full bg-[#FBFCFE] relative overflow-hidden">
                                {/* Success Header */}
                                <div className="bg-emerald-500 text-white p-8 pt-12 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                                        <CheckCircle2 size={48} className="text-emerald-500" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Payment Success</h2>
                                    <p className="text-emerald-100 font-bold text-sm tracking-widest uppercase">Order #{completedOrder.orderId.substring(0, 8)}</p>
                                </div>

                                {/* Receipt Body */}
                                <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {completedOrder.date}
                                        </div>
                                        
                                        <div className="mb-6 pb-6 border-b border-dashed border-slate-200">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Customer Info</div>
                                            <div className="font-black text-slate-900">{completedOrder.customerName}</div>
                                            {completedOrder.customerPhone && completedOrder.customerPhone !== 'N/A' && (
                                                <div className="font-bold text-sm text-slate-500 mt-1">{completedOrder.customerPhone}</div>
                                            )}
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Purchased</div>
                                            {completedOrder.items.map(item => (
                                                <div key={item.$id} className="flex justify-between items-start">
                                                    <div className="flex-1 pr-4">
                                                        <div className="font-bold text-slate-800 text-sm leading-tight">{item.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{item.quantity} x ₹{item.price}</div>
                                                    </div>
                                                    <div className="font-black text-slate-900 text-sm">₹{item.price * item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-2">
                                                <span>Subtotal</span>
                                                <span>₹{completedOrder.subtotal}</span>
                                            </div>
                                            {completedOrder.discount > 0 && (
                                                <div className="flex justify-between items-center text-sm font-bold text-emerald-500 mb-2">
                                                    <span>Discount</span>
                                                    <span>- ₹{completedOrder.discount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-200">
                                                <span className="font-black uppercase text-slate-900 tracking-widest">Total Paid</span>
                                                <span className="text-2xl font-black text-slate-900">₹{completedOrder.total}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 flex justify-center">
                                            <div className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1">
                                                {completedOrder.paymentMethod} Payment
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Receipt Actions */}
                                <div className="p-6 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 shrink-0">
                                    <button onClick={handlePrintReceipt} className="py-4 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all uppercase tracking-widest text-xs">
                                        <Printer size={18} /> Print
                                    </button>
                                    <button onClick={startNewSale} className="py-4 bg-slate-900 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-blue-600 shadow-xl shadow-slate-900/20 transition-all uppercase tracking-widest text-xs">
                                        New Sale <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ACTIVE CART VIEW */
                            <>
                                {/* Cart Header */}
                                <div className="h-[72px] lg:h-[88px] px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                                    <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                                        Current Order
                                        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-1 rounded-md tracking-widest">{cart.length} items</span>
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleHoldBill} className="hidden lg:flex px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Hold</button>
                                        <button onClick={handleResumeBill} className="hidden lg:flex px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Resume</button>
                                        {!isDesktop && (
                                            <button onClick={() => setIsMobileCartOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar flex flex-col">
                                    {/* Cart Items List */}
                                    <div className="p-4 lg:p-6 space-y-3 flex-1">
                                        {cart.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20">
                                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                    <ShoppingBag size={40} className="text-slate-300" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.2em] text-sm text-center px-4 text-slate-400">Cart is empty</p>
                                            </div>
                                        ) : (
                                            cart.map(item => (
                                                <motion.div 
                                                    key={item.$id} layout
                                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                                    className="bg-white border border-slate-100 shadow-sm rounded-[1.5rem] p-3 flex gap-4 relative group"
                                                >
                                                    <div className="w-16 h-16 bg-slate-50 rounded-[1rem] flex items-center justify-center p-2">
                                                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <h4 className="font-black text-sm text-slate-800 pr-6 leading-tight mb-1">{item.name}</h4>
                                                        <span className="font-black text-blue-600 text-sm">₹{item.price}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end justify-between">
                                                        <button onClick={() => removeFromCart(item.$id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
                                                            <button onClick={() => updateQuantity(item.$id, -1)} className="w-6 h-6 flex items-center justify-center bg-white text-slate-600 rounded-lg font-black"><Minus size={12} /></button>
                                                            <span className="font-black text-xs w-5 text-center text-slate-800">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.$id, 1)} className="w-6 h-6 flex items-center justify-center bg-white text-slate-600 rounded-lg font-black"><Plus size={12} /></button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    {/* Ultra-Clean Inline Customer Details (Only visible if cart has items) */}
                                    {cart.length > 0 && (
                                        <div className="px-6 py-6 bg-white border-t border-slate-100 shrink-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                                    </div>
                                                    <div className="relative flex-1">
                                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input type="tel" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                                                        <input type="number" placeholder="Discount ₹" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full bg-red-50/50 border border-red-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-red-600 placeholder:text-red-300 focus:outline-none focus:border-red-400 focus:bg-white transition-all" />
                                                    </div>
                                                </div>
                                                
                                                {/* Payment Toggles */}
                                                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                                                    {[ { id: 'CASH', label: 'Cash' }, { id: 'UPI', label: 'UPI' }, { id: 'CARD', label: 'Card' } ].map(method => (
                                                        <button
                                                            key={method.id} onClick={() => setPaymentMethod(method.id)}
                                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                                paymentMethod === method.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {method.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Totals & Checkout Button */}
                                <div className="p-6 bg-white border-t border-slate-200 shrink-0 relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</div>
                                            <div className="text-3xl font-black text-slate-900 leading-none">₹{total.toLocaleString()}</div>
                                        </div>
                                        {Number(discount) > 0 && (
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Discount</div>
                                                <div className="text-sm font-black text-red-500">-₹{Number(discount).toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        disabled={cart.length === 0 || isProcessing}
                                        onClick={handleCheckout}
                                        className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isProcessing ? (
                                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 size={24} /> Pay & Generate Bill
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Printable Invoice */}
            <div id="print-section">
                <style>
                    {`
                    @media print {
                        body * { visibility: hidden; }
                        #print-section, #print-section * { visibility: visible; }
                        #print-section {
                            position: absolute; left: 0; top: 0; width: 100%; max-width: 80mm;
                            margin: 0 auto; font-family: 'Courier New', Courier, monospace; color: #000;
                        }
                        .receipt-container { padding: 10px; text-align: center; }
                        .receipt-header h1 { font-size: 1.5rem; margin: 0; font-weight: 900; }
                        .receipt-header p { margin: 2px 0; font-size: 0.8rem; }
                        .divider { border-top: 1px dashed #000; margin: 10px 0; }
                        .receipt-meta { text-align: left; font-size: 0.8rem; margin-bottom: 10px; }
                        .receipt-meta p { margin: 2px 0; }
                        table { width: 100%; font-size: 0.8rem; text-align: left; border-collapse: collapse; }
                        th { border-bottom: 1px dashed #000; padding-bottom: 5px; }
                        td { padding: 5px 0; vertical-align: top; }
                        .td-qty { text-align: center; }
                        .td-price { text-align: right; }
                        .totals-section { margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; font-size: 0.9rem; text-align: right; }
                        .totals-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                        .grand-total { font-size: 1.2rem; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; margin-top: 5px; }
                        .receipt-footer { margin-top: 15px; font-size: 0.8rem; font-weight: bold; }
                        .barcode { font-family: 'Libre Barcode 39', 'Courier New', monospace; font-size: 2rem; margin-top: 10px; }
                    }
                    `}
                </style>
                {completedOrder && (
                    <div className="receipt-container">
                        <div className="receipt-header">
                            <h1>BYTECORE MALL</h1>
                            <p>Premium Digital Store</p>
                            <p>Ph: +91 9999999999</p>
                            <p>GSTIN: 09XXXXXXXXXXXXX</p>
                        </div>
                        <div className="divider"></div>
                        <div className="receipt-meta">
                            <p><strong>Date:</strong> {completedOrder.date}</p>
                            <p><strong>Bill No:</strong> {completedOrder.orderId.substring(0, 8).toUpperCase()}</p>
                            <p><strong>Customer:</strong> {completedOrder.customerName}</p>
                            {completedOrder.customerPhone && completedOrder.customerPhone !== 'N/A' && <p><strong>Phone:</strong> {completedOrder.customerPhone}</p>}
                            <p><strong>Payment Mode:</strong> {completedOrder.paymentMethod}</p>
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
                                {completedOrder.items.map(item => (
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
                                <span>₹{completedOrder.subtotal}</span>
                            </div>
                            {completedOrder.discount > 0 && (
                                <div className="totals-row">
                                    <span>Discount:</span>
                                    <span>-₹{completedOrder.discount}</span>
                                </div>
                            )}
                            <div className="totals-row grand-total">
                                <span>TOTAL:</span>
                                <span>₹{completedOrder.total}</span>
                            </div>
                        </div>
                        <div className="receipt-footer">
                            <p>Thank you for shopping!</p>
                            <p>Visit: mall.bytecores.in</p>
                            <div className="barcode">*{completedOrder.orderId.substring(0, 8)}*</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POSSystem;
