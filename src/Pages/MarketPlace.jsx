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

// Product Details Modal Component
const ProductModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCallNow = () => {
    // You can replace this with actual phone number
    window.open('tel:+2348034931164', '_self');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Product Image */}
        <div className="relative h-80 overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-emerald-600 text-white px-4 py-2 rounded-full text-lg font-bold">
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400 fill-current" size={20} />
              <span className="text-lg text-gray-600">{product.rating}</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-700 bg-gray-50 rounded-lg p-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{product.category.replace('_', ' ')}</span>
              </div>
              {Object?.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call Now Button */}
          <div className="flex space-x-4">
            <button
              onClick={handleCallNow}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center group shadow-lg"
            >
              <Phone size={20} className="mr-3 group-hover:scale-110 transition-transform" />
              Call Now for Quote
            </button>
            <button
              onClick={onClose}
              className="border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Marketplace Component
const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
      rating: 4.8,
      description: "Advanced surveillance drone designed for professional security operations. Features cutting-edge 4K camera technology with night vision capabilities, GPS tracking for precise positioning, and extended flight time for comprehensive area coverage. Ideal for perimeter monitoring, crowd surveillance, and emergency response operations.",
      specifications: {
        warranty: "3 Years",
        installation: "Professional Training Required",
        support: "24/7 Technical Support",
        weight: "2.5kg",
        range: "5km",
        battery: "Li-Po 5000mAh",
        certification: "CE, FCC Certified"
      }
    },
    {
      id: 2,
      name: "HD PTZ Security Camera",
      category: "cameras",
      price: 350000,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["1080p HD", "Pan/Tilt/Zoom", "Weather Resistant", "Motion Detection"],
      rating: 4.6,
      description: "High-definition PTZ camera with remote control capabilities. Offers 360-degree pan rotation, 90-degree tilt, and 20x optical zoom for detailed surveillance. Weather-resistant housing ensures reliable operation in all conditions. Advanced motion detection with smart alerts reduces false alarms.",
      specifications: {
        warranty: "2 Years",
        installation: "Professional Installation",
        support: "Business Hours Support",
        resolution: "1920x1080",
        zoom: "20x Optical",
        night_vision: "Up to 100m",
        storage: "MicroSD + Cloud"
      }
    },
    {
      id: 3,
      name: "Biometric Access Control System",
      category: "biometric",
      price: 450000,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Fingerprint Scanner", "RFID Support", "Mobile App", "Multi-user Access"],
      rating: 4.7,
      description: "State-of-the-art biometric access control system combining fingerprint recognition with RFID technology. Supports up to 3000 users with multiple authentication methods. Mobile app integration allows remote management and real-time access monitoring. Perfect for offices, warehouses, and secure facilities.",
      specifications: {
        warranty: "5 Years",
        installation: "Certified Technician Required",
        support: "24/7 Premium Support",
        capacity: "3000 Users",
        authentication: "Fingerprint + RFID + PIN",
        connectivity: "WiFi + Ethernet",
        backup: "Internal Battery 8hrs"
      }
    },
    {
      id: 4,
      name: "Smart Alarm Security Kit",
      category: "alarms",
      price: 280000,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Wireless Setup", "Mobile Notifications", "24/7 Monitoring", "Easy Installation"],
      rating: 4.5,
      description: "Comprehensive wireless alarm system with smart home integration. Easy DIY installation with professional monitoring service. Instant mobile notifications for all security events. Includes door/window sensors, motion detectors, and emergency panic buttons for complete home protection.",
      specifications: {
        warranty: "2 Years",
        installation: "DIY Friendly",
        support: "Online + Phone Support",
        sensors: "10 Door/Window + 3 Motion",
        battery: "3 Years Sensor Life",
        connectivity: "WiFi + Cellular Backup",
        monitoring: "Professional 24/7"
      }
    },
    {
      id: 5,
      name: "Thermal Imaging Security Drone",
      category: "drones",
      price: 3200000,
      image: "https://images.unsplash.com/photo-1508614999368-9260051292e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Thermal Camera", "Long Range", "Military Grade", "AI Detection"],
      rating: 4.9,
      description: "Military-grade thermal imaging drone for advanced surveillance operations. Equipped with FLIR thermal camera capable of detecting heat signatures from 2km distance. AI-powered object detection and tracking. Built for extreme weather conditions and sensitive security missions.",
      specifications: {
        warranty: "5 Years",
        installation: "Military Certification Required",
        support: "Priority 24/7 Support",
        thermal_range: "2km Detection",
        flight_time: "45 Minutes",
        temperature_range: "-40°C to 150°C",
        encryption: "AES-256 Military Grade"
      }
    },
    {
      id: 6,
      name: "Perimeter Motion Sensor",
      category: "sensors",
      price: 150000,
      image: "https://images.unsplash.com/photo-1586864387492-9d86cb2e4c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["360° Coverage", "Weather Proof", "False Alarm Reduction", "Easy Setup"],
      rating: 4.4,
      description: "Advanced perimeter motion sensor with 360-degree coverage and intelligent false alarm reduction. Uses dual-technology detection (PIR + Microwave) for accurate threat identification. Weather-resistant design suitable for outdoor installations. Smart algorithms filter out small animals and environmental factors.",
      specifications: {
        warranty: "3 Years",
        installation: "Standard Installation",
        support: "Business Hours Support",
        detection_range: "12m Radius",
        technology: "PIR + Microwave Dual",
        power: "12V DC / Battery Backup",
        temperature: "-25°C to +55°C"
      }
    }
  ];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
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
                
                <button
                  onClick={() => viewProductDetails(product)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center group"
                >
                  <Eye size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default MarketplacePage;