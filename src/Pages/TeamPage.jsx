
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
      name: "Cosmos Enyinnaya Ogu",
      position: "Chief Executive Officer / Managing Director",
      image: "/Members/CosmosEnyinnayaOgu.jpg",
      description: "Leading Cossy White with over 15 years of experience in business development and strategic management.",
      linkedin: "#"
    },
    {
      name: "Chinyere Joy Ogu",
      position: "Chief Finance Officer/ Vice President",
      image: "/Members/ChinyereJoyOgu.jpg",
      description: "Expert in financial planning and management, ensuring sustainable growth and fiscal responsibility at Cossy White.",
      linkedin: "#"
    },
    {
      name: "Ozuruigbo Abuoma Jubilate",
      position: "Chief Operations Officer",
      image: "/Members/OzuruigboAbuomaJubilate.jpg",
      description: "Overseeing luxury vehicle imports and automotive operations with extensive experience in financing and sales.",
      linkedin: "#"
    },
    {
      name: "Chioma Chivhetam Prisca",
      position: "Chief Marketing Officer",
      image: "/Members/ChiomaChivhetamPrisca.jpg",
      description: "Driving our marketing strategy and brand growth with deep expertise in international trade and agricultural markets.",
      linkedin: "#"
    },
    {
      name: "Arinze Henry Nkemjieme",
      position: "Head Of Trade",
      image: "/Members/ArinzeHenryNkemjieme.jpg",
      description: "Expert in international trade and commodity exports, Arinze oversees global trading operations and builds strategic partnerships to expand Cossy White's market reach.",
      linkedin: "#"
    },
    {
      name: "Eddy Asuquo",
      position: "Strategic Partnership Lead",
      image: "/Members/eddy.jpg",
      description: "Eddy drives strategic alliances and business collaborations, leveraging his expertise to foster growth and unlock new opportunities for Cossy White.",
      linkedin: "#"
    },
    {
      name: "Livinus Anekwe",
      position: "Advisory Board Member",
      image: "/Members/livi.jpg",
      description: "Livinus brings strategic insight and industry expertise to the board, guiding Cossy White's growth and innovation initiatives with seasoned leadership.",
      linkedin: "#"
    }
  ];
  
  const departments = [
    {
      title: "Security Technologies",
      team: [
        {
          name: "Livinus Anekwe",
          position: "Advisory Board Member",
          image: "/Members/livi.jpg"
        },
        {
          name: "Eddy Asuquo",
          position: "Strategic Partnership Lead",
          image: "/Members/eddy.jpg"
        }
      ]
    },
    {
      title: "Agribusiness Export",
      team: [
        {
          name: "Arinze Henry Nkemjieme",
          position: "Head Of Trade",
          image: "/Members/ArinzeHenryNkemjieme.jpg"
        }
      ]
    },
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