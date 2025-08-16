
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

// Team Page Component
const TeamPage = () => {
  const [teamRef, teamVisible] = useScrollAnimation();
  const [leadershipRef, leadershipVisible] = useScrollAnimation();
  
  const leadership = [
    {
      name: "Adaora Okafor",
      position: "Chief Executive Officer",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Leading Cossy White with over 15 years of experience in business development and strategic management.",
      linkedin: "#"
    },
    {
      name: "Chukwuma Nwankwo",
      position: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Driving innovation in security technologies with expertise in AI, IoT, and surveillance systems.",
      linkedin: "#"
    },
    {
      name: "Kemi Adebayo",
      position: "Head of Agribusiness",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Leading our export operations with deep knowledge of international trade and agricultural markets.",
      linkedin: "#"
    },
    {
      name: "Ibrahim Hassan",
      position: "Automotive Division Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Overseeing luxury vehicle imports with extensive experience in automotive financing and sales.",
      linkedin: "#"
    }
  ];
  
  const departments = [
    {
      title: "Security Technologies",
      team: [
        {
          name: "Amara Okonkwo",
          position: "Security Systems Engineer",
          image: "https://images.unsplash.com/photo-1594736797933-d0ff14dc2a8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Tunde Adeyemi",
          position: "Drone Operations Specialist",
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Grace Okoro",
          position: "Cybersecurity Analyst",
          image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        }
      ]
    },
    {
      title: "Agribusiness Export",
      team: [
        {
          name: "Fatima Abdullahi",
          position: "Export Operations Manager",
          image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Samuel Oduya",
          position: "Quality Assurance Specialist",
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Blessing Okafor",
          position: "Supply Chain Coordinator",
          image: "https://images.unsplash.com/photo-1494790108755-2616b332c169?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        }
      ]
    },
    {
      title: "Automotive Division",
      team: [
        {
          name: "David Olatunji",
          position: "Sales Manager",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Chioma Eze",
          position: "Finance Specialist",
          image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
          name: "Michael Adamu",
          position: "Service Manager",
          image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        }
      ]
    }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-4">
          <div ref={teamRef} className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Meet Our Team</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Our success is driven by a diverse team of passionate professionals committed to excellence 
              across security, agriculture, and automotive sectors.
            </p>
          </div>
        </div>
      </section>
      
      {/* Leadership Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={leadershipRef} className={`text-center mb-16 transition-all duration-1000 ${
            leadershipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced leaders guiding Cossy White toward sustainable growth and innovation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 
                           transform hover:-translate-y-2 overflow-hidden group
                           ${leadershipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-emerald-600 font-semibold mb-3">{leader.position}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{leader.description}</p>
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                    View LinkedIn →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Department Teams */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Departments</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Specialized teams working together to deliver excellence across all our divisions
            </p>
          </div>
          
          {departments.map((department, deptIndex) => (
            <div key={deptIndex} className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">{department.title}</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {department.team.map((member, memberIndex) => (
                  <div
                    key={memberIndex}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 
                              transform hover:-translate-y-1 p-6 text-center"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{member.name}</h4>
                    <p className="text-emerald-600 font-medium">{member.position}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Join Our Team CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Growing Team</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for excellence and innovation.
          </p>
          <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold 
                           hover:bg-gray-100 transform hover:scale-105 transition-all duration-200
                           shadow-lg hover:shadow-xl">
            View Open Positions
          </button>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;