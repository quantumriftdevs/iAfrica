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



// Agribusiness Page
const AgribusinessPage = ({navigate}) => {
  const [agriRef, agriVisible] = useScrollAnimation();
  const [commoditiesRef, commoditiesVisible] = useScrollAnimation();
  
  const commodities = [
    {
      name: "Sesame Seeds",
      description: "High oil content sesame seeds, perfect for tahini and sesame oil production. Sourced from the finest farms across Nigeria.",
      specs: ["Oil Content: 50-55%", "Purity: 99%", "Moisture: <6%", "Origin: Nigeria"],
      image: "https://images.unsplash.com/photo-1602498456745-e9503b30470b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Dried Hibiscus Flowers",
      description: "Premium quality dried hibiscus flowers with deep red color, organically grown for the global tea and beverage industry.",
      specs: ["Deep Red Color", "Organic Certified", "Moisture: <12%", "Pesticide Free"],
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Dried Split Ginger",
      description: "Pungent, fibrous, and perfectly sun-dried ginger that meets global spice industry standards for quality and flavor.",
      specs: ["Moisture: <10%", "Split & Clean", "Pungent Aroma", "Export Grade"],
      image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Cashew Nuts",
      description: "Premium W320 grade cashew nuts, available both raw and roasted, perfect for snacking and processing industries.",
      specs: ["Grade: W320", "Broken: <5%", "Moisture: <5%", "Kernel Count: 320/kg"],
      image: "https://images.unsplash.com/photo-1509814850881-9dfc084f8e86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div ref={agriRef} className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            agriVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-center mb-6">
              <Sprout size={64} className="text-green-300" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Agribusiness Exports</h1>
            <p className="text-xl leading-relaxed mb-8 text-green-100">
              From Nigerian Farms to Global Tables. We specialize in sourcing, processing, and exporting premium 
              Nigerian agricultural commodities to high-value markets worldwide.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">15+</div>
                <div className="text-green-200">Export Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-green-200">Partner Farmers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">ISO</div>
                <div className="text-green-200">Certified Quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Commodities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={commoditiesRef} className={`text-center mb-16 transition-all duration-1000 ${
            commoditiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Commodities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sustainably sourced, expertly processed, and globally certified agricultural products
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {commodities.map((commodity, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 
                           overflow-hidden border border-gray-100 group
                           ${commoditiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={commodity.image}
                    alt={commodity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white">{commodity.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">{commodity.description}</p>
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-gray-900">Specifications:</h4>
                    {commodity.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        {spec}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate("/contact")} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200">
                    Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgribusinessPage;