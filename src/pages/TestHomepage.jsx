import React, { useState } from 'react';
import { ShoppingCart, Search, User, Menu, Heart, Truck, Shield, Headphones, Tag, Star, TrendingUp, Zap } from 'lucide-react';

export default function ByteCoreMallHomepage() {
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    { name: 'Electronics', icon: '📱', color: '#3B82F6' },
    { name: 'Fashion', icon: '👔', color: '#EC4899' },
    { name: 'Home & Kitchen', icon: '🏠', color: '#10B981' },
    { name: 'Beauty', icon: '💄', color: '#F59E0B' },
    { name: 'Sports', icon: '⚽', color: '#8B5CF6' },
    { name: 'Books', icon: '📚', color: '#EF4444' },
    { name: 'Toys', icon: '🧸', color: '#06B6D4' },
    { name: 'Grocery', icon: '🛒', color: '#84CC16' },
  ];

  const flashDeals = [
    { id: 1, name: 'Wireless Earbuds', price: 1299, originalPrice: 2999, discount: 57, rating: 4.5, image: '🎧', sold: 234 },
    { id: 2, name: 'Smart Watch', price: 2499, originalPrice: 5999, discount: 58, rating: 4.3, image: '⌚', sold: 189 },
    { id: 3, name: 'Phone Case', price: 199, originalPrice: 599, discount: 67, rating: 4.7, image: '📱', sold: 456 },
    { id: 4, name: 'Power Bank', price: 899, originalPrice: 1999, discount: 55, rating: 4.4, image: '🔋', sold: 312 },
  ];

  const featuredProducts = [
    { id: 1, name: 'Premium Headphones', price: 3999, rating: 4.8, image: '🎧', badge: 'Bestseller' },
    { id: 2, name: 'Laptop Backpack', price: 1499, rating: 4.6, image: '🎒', badge: 'New' },
    { id: 3, name: 'Smart LED Bulb', price: 499, rating: 4.5, image: '💡', badge: 'Trending' },
    { id: 4, name: 'Yoga Mat', price: 799, rating: 4.7, image: '🧘', badge: 'Hot' },
    { id: 5, name: 'Coffee Maker', price: 2999, rating: 4.4, image: '☕', badge: 'Sale' },
    { id: 6, name: 'Running Shoes', price: 2499, rating: 4.9, image: '👟', badge: 'Bestseller' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 text-center text-sm font-medium">
        <Zap className="inline w-4 h-4 mr-2" />
        Free Shipping on orders above ₹499 | Use Code: BYTE99
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                99
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ByteCore Mall
                </h1>
                <p className="text-xs text-gray-500">99 Mall - Shop Smart!</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full px-6 py-3 pr-12 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Header Icons */}
            <div className="flex items-center gap-6">
              <button className="relative hover:text-blue-600 transition-colors">
                <Heart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              <button className="relative hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">5</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all">
                <User className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Nav */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between overflow-x-auto gap-4 scrollbar-hide">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(idx)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeCategory === idx
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 scale-105'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Banner */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
            <div className="relative z-10">
              <div className="inline-block px-4 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold mb-4">
                🎉 MEGA SALE
              </div>
              <h2 className="text-5xl font-bold mb-4">
                Flat 60% OFF<br />on Electronics
              </h2>
              <p className="text-xl mb-6 text-white/90">Limited time offer! Grab now</p>
              <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
                Shop Now →
              </button>
            </div>
            <div className="absolute bottom-8 right-8 text-8xl opacity-20">📱</div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-2">Fashion Sale</h3>
              <p className="text-sm mb-4">Up to 50% OFF</p>
              <button className="px-6 py-2 bg-white text-orange-600 rounded-full font-semibold text-sm hover:shadow-lg transition-all">
                Explore
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-2">Home & Kitchen</h3>
              <p className="text-sm mb-4">New Arrivals</p>
              <button className="px-6 py-2 bg-white text-green-600 rounded-full font-semibold text-sm hover:shadow-lg transition-all">
                Discover
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              Flash Deals
            </h2>
            <p className="text-gray-600">Ends in: 02:45:33</p>
          </div>
          <button className="text-blue-600 font-semibold hover:underline">View All →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashDeals.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-200 group">
              <div className="relative mb-4">
                <div className="text-7xl text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">{product.image}</div>
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}%
                </div>
                <button className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-500">({product.sold} sold)</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-gray-800">₹{product.price}</span>
                <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders above ₹499</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">24/7 Support</h3>
                <p className="text-sm text-gray-600">Dedicated support</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Tag className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Best Prices</h3>
                <p className="text-sm text-gray-600">Guaranteed low prices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Trending Products
          </h2>
          <button className="text-blue-600 font-semibold hover:underline">View All →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
              <div className="relative mb-3">
                <div className="text-5xl text-center py-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl">{product.image}</div>
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  {product.badge}
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              </div>
              <div className="text-xl font-bold text-gray-800 mb-3">₹{product.price}</div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all">
                Add
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ByteCore Mall</h3>
              <p className="text-gray-400 text-sm">Your one-stop shop for everything you need.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Policies</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Return Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-3">Get latest offers & updates</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 flex-1 text-sm" />
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">→</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 ByteCore Mall (99Mall). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
