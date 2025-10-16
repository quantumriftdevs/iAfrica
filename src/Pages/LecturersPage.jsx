import React, { useState, useEffect } from 'react';
import { getLecturers } from '../utils/api';
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
  const [, ,] = [null, null, null];
  const [lecturersRef, lecturersVisible] = useScrollAnimation();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = [
    { id: 'all', name: 'All Lecturers' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'marketing', name: 'Digital Marketing' },
    { id: 'design', name: 'Graphic Design' },
    { id: 'data', name: 'Data Analytics' }
  ];
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getLecturers();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) setLecturers(data);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="pt-20 text-center">Loading lecturers...</div>;
  if (!loading && (!Array.isArray(lecturers) || lecturers.length === 0)) return (
    <div className="pt-20 text-center">
      <h3 className="text-xl font-semibold">No lecturers available</h3>
      <p className="text-gray-600">We're not showing any lecturers right now. Please check back later.</p>
    </div>
  );

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