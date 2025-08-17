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

// Vehicle Details Modal Component
const VehicleModal = ({ vehicle, isOpen, onClose, navigate }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="relative">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-80 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <X size={24} />
          </button>
          <div className="absolute bottom-4 left-4 text-white">
            {/* <div className="text-3xl font-bold">{formatPrice(vehicle.price)}</div> */}
            <div className="text-emerald-200">{vehicle.year} Model</div>
          </div>
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              vehicle.status === 'Available' ? 'bg-green-500 text-white' :
              vehicle.status === 'Pre-Order' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {vehicle.status}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.name}</h2>
            <p className="text-lg text-gray-600 capitalize">{vehicle.category.replace('-', ' ')}</p>
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {vehicle.specs.map((spec, index) => (
                <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4"></div>
                  <span className="text-gray-700 font-medium">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-8 grid md:grid-cols-3 gap-6 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{vehicle.year}</div>
              <div className="text-gray-600">Model Year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{vehicle.condition}</div>
              <div className="text-gray-600">Condition</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{vehicle.warranty}</div>
              <div className="text-gray-600">Warranty</div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {vehicle.features?.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

                <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+2348034931164"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
                >
                  <Phone className="mr-2" size={20} />
                  Call Us Now
                </a>
                <button 
                  onClick={onClose}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Close Details
                </button>
                </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-emerald-800 font-medium">Interested in this vehicle?</p>
            <p className="text-emerald-600">Call us at +234 803 493 1164 or visit our contact page</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Automotive Page Component
const AutomotivePage = ({navigate}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: [
        "5.2L V10 Natural Aspirated Engine",
        "630hp @ 8,000 RPM",
        "443 lb-ft Torque",
        "0-100km/h: 3.2 seconds",
        "325km/h Top Speed",
        "All-Wheel Drive System",
        "7-Speed Dual-Clutch Transmission",
        "Carbon Ceramic Brakes"
      ],
      year: 2024,
      status: "Available",
      condition: "Brand New",
      warranty: "3 Years / 100,000km",
      features: [
        "Premium Alcantara Interior",
        "Advanced Traction Control",
        "Multiple Drive Modes",
        "Premium Infotainment System",
        "Smartphone Integration",
        "Parking Sensors",
        "Keyless Entry & Start",
        "Premium Sound System",
        "LED Headlights",
        "Carbon Fiber Accents",
        "Sport Exhaust System",
        "Performance Monitoring"
      ]
    },
    {
      id: 2,
      name: "Rolls-Royce Cullinan",
      category: "luxury-suv",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: [
        "6.75L V12 Twin-Turbocharged Engine",
        "563hp @ 5,000 RPM",
        "627 lb-ft Torque",
        "0-100km/h: 5.2 seconds",
        "250km/h Top Speed",
        "All-Wheel Drive System",
        "8-Speed Automatic Transmission",
        "Air Suspension System"
      ],
      year: 2024,
      status: "Pre-Order",
      condition: "Brand New",
      warranty: "4 Years / Unlimited Mileage",
      features: [
        "Bespoke Leather Interior",
        "Starlight Headliner",
        "Rear Theater Configuration",
        "Champagne Cooler",
        "Massage Seats",
        "Panoramic Sunroof",
        "Advanced Climate Control",
        "Premium Audio System",
        "Night Vision",
        "Adaptive Cruise Control",
        "Self-Leveling Suspension",
        "Suicide Doors"
      ]
    },
    {
      id: 3,
      name: "Mercedes S-Class",
      category: "executive",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: [
        "4.0L V8 Twin-Turbocharged Engine",
        "469hp @ 5,500 RPM",
        "516 lb-ft Torque",
        "0-100km/h: 4.4 seconds",
        "250km/h Top Speed",
        "Rear-Wheel Drive",
        "9-Speed Automatic Transmission",
        "AIRMATIC Air Suspension"
      ],
      year: 2024,
      status: "Available",
      condition: "Brand New",
      warranty: "4 Years / 80,000km",
      features: [
        "Nappa Leather Seats",
        "MBUX Hyperscreen",
        "Active Ambient Lighting",
        "Burmester 4D Sound",
        "Executive Rear Seating",
        "Massage Function",
        "Active Parking Assist",
        "Driver Assistance Package",
        "360° Camera System",
        "Wireless Charging",
        "Head-Up Display",
        "Magic Body Control"
      ]
    },
    {
      id: 4,
      name: "Ferrari 488 Spider",
      category: "convertible",
      image: "https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: [
        "3.9L V8 Twin-Turbocharged Engine",
        "661hp @ 8,000 RPM",
        "560 lb-ft Torque",
        "0-100km/h: 3.0 seconds",
        "325km/h Top Speed",
        "Rear-Wheel Drive",
        "7-Speed Dual-Clutch Transmission",
        "Retractable Hard Top (14 seconds)"
      ],
      year: 2024,
      status: "Sold",
      condition: "Brand New",
      warranty: "3 Years / 100,000km",
      features: [
        "Racing-Inspired Interior",
        "Ferrari Dynamic Enhancer",
        "Side Slip Control",
        "F1-Trac Traction Control",
        "Launch Control",
        "Carbon Fiber Steering Wheel",
        "Manettino Drive Modes",
        "Premium Navigation",
        "Track Telemetry",
        "Variable Torque Management",
        "Electronic Differential",
        "Adaptive Headlights"
      ]
    },
    {
      id: 5,
      name: "Range Rover Autobiography",
      category: "luxury-suv",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: [
        "5.0L Supercharged V8 Engine",
        "518hp @ 6,000 RPM",
        "461 lb-ft Torque",
        "0-100km/h: 5.4 seconds",
        "225km/h Top Speed",
        "All-Wheel Drive System",
        "8-Speed Automatic Transmission",
        "Electronic Air Suspension"
      ],
      year: 2024,
      status: "Available",
      condition: "Brand New",
      warranty: "5 Years / 100,000km",
      features: [
        "Semi-Aniline Leather Interior",
        "Terrain Response 2",
        "Wade Sensing Technology",
        "Meridian Signature Sound",
        "Heated & Cooled Seats",
        "Panoramic Sunroof",
        "Touch Pro Duo Interface",
        "All-Terrain Progress Control",
        "ClearSight Ground View",
        "Adaptive Dynamics",
        "Configurable Ambient Lighting",
        "Activity Key Wristband"
      ]
    },
    {
      id: 6,
      name: "Porsche 911 Turbo S",
      category: "supercars",
      image: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: [
        "3.8L Twin-Turbocharged H6 Engine",
        "640hp @ 6,750 RPM",
        "590 lb-ft Torque",
        "0-100km/h: 2.7 seconds",
        "330km/h Top Speed",
        "All-Wheel Drive System",
        "8-Speed PDK Transmission",
        "Active Suspension Management"
      ],
      year: 2024,
      status: "Available",
      condition: "Brand New",
      warranty: "4 Years / 80,000km",
      features: [
        "Sport Seats Plus",
        "Sport Chrono Package",
        "Porsche Active Suspension",
        "Dynamic Chassis Control",
        "Porsche Stability Management",
        "Launch Control",
        "Sport Exhaust System",
        "LED Matrix Headlights",
        "Bose Surround Sound",
        "PCM Infotainment",
        "Adaptive Cruise Control",
        "ParkAssist with Camera"
      ]
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

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
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
              and exceptional after-sales service.
            </p>
            <button onClick={() => navigate && navigate("/contact")} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200">
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
                    {/* <div className="text-2xl font-bold">{formatPrice(vehicle.price)}</div> */}
                    <div className="text-emerald-200">{vehicle.year} Model</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {vehicle.name}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    {vehicle.specs.slice(0, 4).map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        {spec}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleViewDetails(vehicle)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Eye className="mr-2" size={18} />
                    View Details
                  </button>
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
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Custom Imports", desc: "Any make, any model, anywhere in the world", icon: "🌍" },
              { title: "Showroom Sales", desc: "Ready-to-own vehicles in pristine condition", icon: "🏢" },
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

      {/* Vehicle Details Modal */}
      <VehicleModal 
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={closeModal}
        navigate={navigate}
      />
    </div>
  );
};

export default AutomotivePage;