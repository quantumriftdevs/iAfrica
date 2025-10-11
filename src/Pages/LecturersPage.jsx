import React, { useState, useEffect } from 'react';
import { ChevronRight, Award, BookOpen, Users, Mail, Linkedin, Star, Eye, X, GraduationCap, Video, CheckCircle } from 'lucide-react';

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

// Lecturer Details Modal Component
const LecturerModal = ({ lecturer, isOpen, onClose, navigate }) => {
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

  if (!isOpen || !lecturer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-emerald-600 to-green-600"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <X size={24} />
          </button>
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <img
              src={lecturer.image}
              alt={lecturer.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 pt-20">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{lecturer.name}</h2>
            <p className="text-lg text-emerald-600 font-semibold mb-2">{lecturer.title}</p>
            <p className="text-gray-600">{lecturer.specialization}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center">
                <Star className="text-yellow-500 fill-current" size={20} />
                <span className="ml-2 font-semibold text-gray-900">{lecturer.rating}/5.0</span>
              </div>
              <div className="flex items-center">
                <Users className="text-emerald-600" size={20} />
                <span className="ml-2 text-gray-700">{lecturer.students} Students</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="text-emerald-600" size={20} />
                <span className="ml-2 text-gray-700">{lecturer.courses} Courses</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
            <p className="text-gray-700 leading-relaxed">{lecturer.bio}</p>
          </div>

          {/* Expertise */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {lecturer.expertise.map((skill, index) => (
                <div key={index} className="flex items-center bg-emerald-50 p-3 rounded-lg">
                  <CheckCircle className="text-emerald-600 mr-3" size={20} />
                  <span className="text-gray-700 font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Qualifications & Certifications</h3>
            <div className="space-y-3">
              {lecturer.qualifications.map((qual, index) => (
                <div key={index} className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <Award className="text-emerald-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{qual}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Programs */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Teaching Programs</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {lecturer.programs.map((program, index) => (
                <div key={index} className="border-2 border-emerald-200 p-4 rounded-lg hover:border-emerald-400 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">{program.name}</h4>
                  <p className="text-sm text-gray-600">{program.level}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                onClose();
                navigate && navigate("/marketplace");
              }}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
            >
              <Video className="mr-2" size={20} />
              View Available Classes
            </button>
            <button 
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Close Profile
            </button>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-emerald-800 font-medium">Interested in learning from {lecturer.name.split(' ')[0]}?</p>
            <p className="text-emerald-600">Enroll in their programs to access live interactive classes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lecturers Page Component
const LecturersPage = ({navigate}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heroRef, heroVisible] = useScrollAnimation();
  const [lecturersRef, lecturersVisible] = useScrollAnimation();
  
  const categories = [
    { id: 'all', name: 'All Lecturers' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'marketing', name: 'Digital Marketing' },
    { id: 'design', name: 'Graphic Design' },
    { id: 'data', name: 'Data Analytics' }
  ];
  
  const lecturers = [
    {
      id: 1,
      name: "Dr. Adewale Johnson",
      title: "Senior Web Development Instructor",
      category: "web-dev",
      specialization: "Full-Stack JavaScript Development",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      students: "450+",
      courses: 6,
      experience: "12 Years",
      bio: "Dr. Adewale Johnson is a seasoned full-stack developer with over 12 years of experience in web technologies. He has worked with Fortune 500 companies and led development teams on major projects. His teaching approach focuses on practical, real-world applications that prepare students for immediate employment.",
      expertise: [
        "React.js & Modern Frontend",
        "Node.js Backend Development",
        "Database Design & Management",
        "API Development & Integration",
        "Cloud Deployment (AWS, Azure)",
        "Responsive Web Design"
      ],
      qualifications: [
        "Ph.D. in Computer Science - MIT",
        "AWS Certified Solutions Architect",
        "Google Cloud Professional Developer",
        "Microsoft Azure Developer Associate"
      ],
      programs: [
        { name: "Web Development", level: "Beginner & Advanced" },
        { name: "Full-Stack JavaScript", level: "Advanced" }
      ]
    },
    {
      id: 2,
      name: "Chioma Okonkwo",
      title: "Lead Digital Marketing Strategist",
      category: "marketing",
      specialization: "SEO & Social Media Marketing",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      students: "380+",
      courses: 5,
      experience: "10 Years",
      bio: "Chioma Okonkwo is a digital marketing expert who has managed campaigns for leading African brands. Her data-driven approach to marketing has helped businesses achieve 300% growth in online engagement. She specializes in creating strategies that work specifically for African markets.",
      expertise: [
        "Search Engine Optimization",
        "Social Media Strategy",
        "Content Marketing",
        "Google Analytics & Data",
        "Paid Advertising (PPC)",
        "Email Marketing Campaigns"
      ],
      qualifications: [
        "M.Sc. Marketing - London School of Economics",
        "Google Ads Certification",
        "Facebook Blueprint Certification",
        "HubSpot Content Marketing Certified"
      ],
      programs: [
        { name: "Digital Marketing", level: "Beginner & Advanced" },
        { name: "Social Media Marketing", level: "Advanced" }
      ]
    },
    {
      id: 3,
      name: "Ibrahim Yusuf",
      title: "Creative Design Director",
      category: "design",
      specialization: "Brand Identity & UI/UX Design",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      students: "320+",
      courses: 4,
      experience: "15 Years",
      bio: "Ibrahim Yusuf is an award-winning designer who has created brand identities for over 200 companies across Africa. His portfolio includes work for international corporations and successful startups. He brings a unique blend of traditional design principles and modern digital aesthetics to his teaching.",
      expertise: [
        "Adobe Creative Suite Mastery",
        "Brand Identity Design",
        "UI/UX Design Principles",
        "Typography & Layout",
        "Print & Digital Media",
        "Prototyping & Wireframing"
      ],
      qualifications: [
        "B.F.A. Graphic Design - Central Saint Martins",
        "Adobe Certified Expert (ACE)",
        "Certified User Experience Professional",
        "Award: African Design Excellence 2022"
      ],
      programs: [
        { name: "Graphic Design", level: "Beginner & Advanced" },
        { name: "UI/UX Design", level: "Advanced" }
      ]
    },
    {
      id: 4,
      name: "Dr. Fatima Bello",
      title: "Data Science Consultant",
      category: "data",
      specialization: "Business Intelligence & Predictive Analytics",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      students: "280+",
      courses: 5,
      experience: "11 Years",
      bio: "Dr. Fatima Bello specializes in turning complex data into actionable business insights. She has consulted for government agencies, NGOs, and private corporations, helping them make data-driven decisions. Her teaching methodology emphasizes practical problem-solving with real datasets.",
      expertise: [
        "Python for Data Science",
        "Statistical Analysis",
        "Power BI & Tableau",
        "Machine Learning Basics",
        "Data Visualization",
        "SQL & Database Queries"
      ],
      qualifications: [
        "Ph.D. Statistics - University of Oxford",
        "Microsoft Certified: Data Analyst",
        "Tableau Desktop Specialist",
        "IBM Data Science Professional Certificate"
      ],
      programs: [
        { name: "Data Analytics", level: "Beginner & Advanced" },
        { name: "Business Intelligence", level: "Advanced" }
      ]
    },
    {
      id: 5,
      name: "Samuel Okafor",
      title: "Frontend Development Specialist",
      category: "web-dev",
      specialization: "Modern JavaScript Frameworks",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      students: "290+",
      courses: 4,
      experience: "8 Years",
      bio: "Samuel Okafor is a passionate frontend developer who believes in creating beautiful, performant web applications. He has contributed to major open-source projects and regularly speaks at tech conferences. His courses focus on modern best practices and cutting-edge frameworks.",
      expertise: [
        "React.js & Redux",
        "Vue.js Development",
        "TypeScript",
        "CSS/SASS/Tailwind",
        "Performance Optimization",
        "Progressive Web Apps"
      ],
      qualifications: [
        "B.Sc. Software Engineering - Carnegie Mellon",
        "Meta Front-End Developer Certificate",
        "freeCodeCamp Responsive Web Design",
        "Open Source Contributor - React"
      ],
      programs: [
        { name: "Web Development", level: "Beginner" },
        { name: "Advanced Frontend", level: "Advanced" }
      ]
    },
    {
      id: 6,
      name: "Amaka Nnamdi",
      title: "Content Marketing Expert",
      category: "marketing",
      specialization: "Content Strategy & Copywriting",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      students: "340+",
      courses: 4,
      experience: "9 Years",
      bio: "Amaka Nnamdi is a master storyteller who has helped brands find their voice and connect with audiences. Her content strategies have generated millions in revenue for e-commerce businesses. She teaches students how to craft compelling narratives that drive engagement and conversions.",
      expertise: [
        "Content Strategy Development",
        "SEO Copywriting",
        "Brand Storytelling",
        "Blog & Article Writing",
        "Social Media Content",
        "Video Script Writing"
      ],
      qualifications: [
        "M.A. Communications - Columbia University",
        "Content Marketing Institute Certification",
        "Copyblogger Certified Content Marketer",
        "Published Author - 'Digital Storytelling'"
      ],
      programs: [
        { name: "Digital Marketing", level: "Beginner & Advanced" },
        { name: "Content Marketing", level: "Advanced" }
      ]
    }
  ];
  
  const filteredLecturers = selectedCategory === 'all' 
    ? lecturers 
    : lecturers.filter(lecturer => lecturer.category === selectedCategory);

  const handleViewProfile = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLecturer(null);
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
            <h1 className="text-5xl font-bold mb-4">Meet Our Expert Lecturers</h1>
            <p className="text-xl mb-6 max-w-2xl">
              Learn from industry professionals with years of real-world experience. 
              Our lecturers are passionate educators dedicated to your success.
            </p>
            <button onClick={() => navigate && navigate("/contact")} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200">
              Become a Lecturer
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Teaching"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Lecturers Section */}
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

          {/* Lecturers Grid */}
          <div ref={lecturersRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLecturers.map((lecturer, index) => (
              <div
                key={lecturer.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group
                           ${lecturersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-emerald-600 to-green-600">
                  <img
                    src={lecturer.image}
                    alt={lecturer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center mb-2">
                      <Star className="text-yellow-400 fill-current mr-1" size={20} />
                      <span className="font-bold">{lecturer.rating}/5.0</span>
                    </div>
                    <div className="text-emerald-200 text-sm">{lecturer.experience} Experience</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {lecturer.name}
                  </h3>
                  <p className="text-emerald-600 font-semibold mb-2">{lecturer.title}</p>
                  <p className="text-gray-600 text-sm mb-4">{lecturer.specialization}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="text-emerald-600 mr-2" size={16} />
                      {lecturer.students} Students Taught
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="text-emerald-600 mr-2" size={16} />
                      {lecturer.courses} Active Courses
                    </div>
                  </div>

                  <button 
                    onClick={() => handleViewProfile(lecturer)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Eye className="mr-2" size={18} />
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Lecturers Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Our Lecturers Stand Out</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Industry Experience", desc: "Real-world professionals who bring practical insights to every class", icon: "💼" },
              { title: "Student-Focused", desc: "Dedicated to your success with personalized attention and support", icon: "🎯" },
              { title: "Continuous Learning", desc: "Always updating their skills to teach the latest industry trends", icon: "📚" }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lecturer Details Modal */}
      <LecturerModal 
        lecturer={selectedLecturer}
        isOpen={isModalOpen}
        onClose={closeModal}
        navigate={navigate}
      />
    </div>
  );
};

export default LecturersPage;