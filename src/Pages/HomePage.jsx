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

// Home Page Component
const HomePage = ({ navigate }) => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [servicesRef, servicesVisible] = useScrollAnimation();
  const [statsRef, statsVisible] = useScrollAnimation();
  
  const services = [
    {
      icon: Shield,
      title: "Security Technologies",
      description: "State-of-the-art surveillance systems, drones, and security solutions for comprehensive protection.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Sprout,
      title: "Agribusiness Exports",
      description: "Premium Nigerian commodities including sesame, ginger, hibiscus, and cashew nuts for global markets.",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Truck,
      title: "Luxury Auto Imports",
      description: "Exotic and luxury vehicles from world-renowned brands with full financing and after-sales support.",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  const stats = [
    { number: "500+", label: "Security Installations" },
    { number: "15+", label: "Export Countries" },
    { number: "200+", label: "Luxury Vehicles Imported" },
    { number: "95%", label: "Client Satisfaction" }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-emerald-50 via-white to-green-50 overflow-hidden">
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div ref={heroRef} className={`transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Trusted Partner in 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600"> Excellence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From cutting-edge security solutions to global agribusiness and luxury automotive imports, 
              we deliver world-class solutions that empower people and create wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold 
                          hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200
                          shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                Explore Marketplace
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold
                          hover:bg-emerald-600 hover:text-white transform hover:scale-105 transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 ${
            heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professional team"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={servicesRef} className={`text-center mb-16 transition-all duration-1000 ${
            servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Divisions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diverse expertise unified by our commitment to excellence and innovation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500
                           transform hover:-translate-y-2 border border-gray-100 overflow-hidden
                           ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <service.icon className="text-emerald-400" size={32} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                  <button className="text-emerald-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                    Learn More <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-1000 ${
                  statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-emerald-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Partner with Excellence?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who trust Cossy White Limited for their security, agricultural, and automotive needs.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold
                      hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200
                      shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage
