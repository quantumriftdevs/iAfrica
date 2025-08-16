import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Truck, Sprout, Users, Phone, Mail, MapPin, Star, ShoppingCart, Eye, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

// Animation hooks
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return [ref, isVisible];
};

// Marketplace Component
const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'drones', name: 'Surveillance Drones' },
    { id: 'cameras', name: 'CCTV Cameras' },
    { id: 'biometric', name: 'Biometric Systems' },
    { id: 'alarms', name: 'Alarm Systems' },
    { id: 'sensors', name: 'Security Sensors' }
  ];
  
  const products = [
    {
      id: 1,
      name: "Professional Surveillance Drone X1",
      category: "drones",
      price: 2500000,
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["4K Camera", "Night Vision", "GPS Tracking", "30min Flight Time"],
      rating: 4.8
    },
    {
      id: 2,
      name: "HD PTZ Security Camera",
      category: "cameras",
      price: 350000,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["1080p HD", "Pan/Tilt/Zoom", "Weather Resistant", "Motion Detection"],
      rating: 4.6
    },
    {
      id: 3,
      name: "Biometric Access Control System",
      category: "biometric",
      price: 450000,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Fingerprint Scanner", "RFID Support", "Mobile App", "Multi-user Access"],
      rating: 4.7
    },
    {
      id: 4,
      name: "Smart Alarm Security Kit",
      category: "alarms",
      price: 280000,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Wireless Setup", "Mobile Notifications", "24/7 Monitoring", "Easy Installation"],
      rating: 4.5
    },
    {
      id: 5,
      name: "Thermal Imaging Security Drone",
      category: "drones",
      price: 3200000,
      image: "https://images.unsplash.com/photo-1508614999368-9260051292e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Thermal Camera", "Long Range", "Military Grade", "AI Detection"],
      rating: 4.9
    },
    {
      id: 6,
      name: "Perimeter Motion Sensor",
      category: "sensors",
      price: 150000,
      image: "https://images.unsplash.com/photo-1586864387492-9d86cb2e4c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["360° Coverage", "Weather Proof", "False Alarm Reduction", "Easy Setup"],
      rating: 4.4
    }
  ];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Security Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Premium security products for professionals and institutions. All items are tested, certified, and backed by our guarantee.
          </p>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-600 hover:text-emerald-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={20} className="text-gray-600" />
                </div>
                <div className="absolute bottom-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {formatPrice(product.price)}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center group"
                  >
                    <ShoppingCart size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </button>
                  <button className="border-2 border-emerald-600 text-emerald-600 py-3 px-4 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-200">
                    Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cart Notification */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <ShoppingCart size={20} />
              <span>{cartItems.length} items in cart</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;