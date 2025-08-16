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



// Automotive Page Component
const AutomotivePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [heroRef, heroVisible] = useScrollAnimation();
  const [carsRef, carsVisible] = useScrollAnimation();
  
  const categories = [
    { id: 'all', name: 'All Vehicles' },
    { id: 'supercars', name: 'Supercars' },
    { id: 'luxury-suv', name: 'Luxury SUVs' },
    { id: 'executive', name: 'Executive Sedans' },
    { id: 'convertible', name: 'Convertibles' }
  ];
  
  const vehicles = [
    {
      id: 1,
      name: "Lamborghini Huracán",
      category: "supercars",
      price: 85000000,
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: ["V10 Engine", "630hp", "0-100km/h: 3.2s", "325km/h Top Speed"],
      year: 2024,
      status: "Available"
    },
    {
      id: 2,
      name: "Rolls-Royce Cullinan",
      category: "luxury-suv",
      price: 120000000,
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: ["V12 Twin-Turbo", "563hp", "All-Wheel Drive", "Luxury Interior"],
      year: 2024,
      status: "Pre-Order"
    },
    {
      id: 3,
      name: "Mercedes S-Class",
      category: "executive",
      price: 45000000,
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: ["V8 Biturbo", "469hp", "MBUX Interior", "Level 3 Autonomy"],
      year: 2024,
      status: "Available"
    },
    {
      id: 4,
      name: "Ferrari 488 Spider",
      category: "convertible",
      price: 95000000,
      image: "https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: ["V8 Twin-Turbo", "661hp", "Retractable Hardtop", "Track Mode"],
      year: 2024,
      status: "Sold"
    },
    {
      id: 5,
      name: "Range Rover Autobiography",
      category: "luxury-suv",
      price: 55000000,
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: ["Supercharged V8", "518hp", "Air Suspension", "Terrain Response"],
      year: 2024,
      status: "Available"
    },
    {
      id: 6,
      name: "Porsche 911 Turbo S",
      category: "supercars",
      price: 75000000,
      image: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: ["Twin-Turbo H6", "640hp", "PDK Transmission", "Sport Chrono"],
      year: 2024,
      status: "Available"
    }
  ];
  
  const filteredVehicles = selectedCategory === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.category === selectedCategory);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-gray-900 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div ref={heroRef} className={`transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <h1 className="text-5xl font-bold mb-4">Luxury & Exotic Auto Imports</h1>
            <p className="text-xl mb-6 max-w-2xl">
              Drive prestige with world-class exotic vehicles. Custom imports, showroom sales, 
              flexible financing, and exceptional after-sales service.
            </p>
            <button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200">
              Request Custom Import
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Luxury car"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Vehicles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicles Grid */}
          <div ref={carsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group
                           ${carsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      vehicle.status === 'Available' ? 'bg-green-500 text-white' :
                      vehicle.status === 'Pre-Order' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{formatPrice(vehicle.price)}</div>
                    <div className="text-emerald-200">{vehicle.year} Model</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {vehicle.name}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    {vehicle.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        {spec}
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200">
                      View Details
                    </button>
                    <button className="border-2 border-emerald-600 text-emerald-600 py-3 px-4 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-200">
                      Finance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Automotive Services</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Custom Imports", desc: "Any make, any model, anywhere in the world", icon: "🌍" },
              { title: "Showroom Sales", desc: "Ready-to-own vehicles in pristine condition", icon: "🏢" },
              { title: "Flexible Financing", desc: "Partnership with leading banks for easy payments", icon: "💳" },
              { title: "After-Sales Service", desc: "Maintenance, servicing, and genuine parts", icon: "🔧" }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


export default AutomotivePage;