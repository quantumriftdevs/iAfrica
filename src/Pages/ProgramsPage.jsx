import React, { useState, useEffect } from 'react';
import { getPrograms } from '../utils/api';
import { ChevronRight, BookOpen, Users, Clock, Award, Video } from 'lucide-react';


// Programs Page
const ProgramsPage = ({ navigate }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPrograms();
        console.log(data);
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) setPrograms(data);
      } catch {
        // ignore
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">Loading programs...</div>
      </div>
    );
  }

  if (!loading && (!Array.isArray(programs) || programs.length === 0)) return (
    <div className="pt-20 text-center">
      <h3 className="text-xl font-semibold">No programs available</h3>
      <p className="text-gray-600">We're not showing any programs right now. Please check back later.</p>
    </div>
  );

  return (
    <div className="pt-20">
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center transition-all duration-1000 opacity-100 translate-y-0">
            <div className="flex items-center justify-center mb-6">
              <BookOpen size={64} className="text-emerald-300" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Our Programs</h1>
            <p className="text-xl leading-relaxed mb-8 text-emerald-100">
              Explore our comprehensive educational programs designed to equip you with in-demand skills. Each program offers beginner and advanced levels with structured courses, expert lecturers, and hands-on learning through live interactive classes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Video size={16} className="mr-2" /> Live Classes
              </span>
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Award size={16} className="mr-2" /> Verified Certificates
              </span>
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Users size={16} className="mr-2" /> Expert Lecturers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {programs.map((program, index) => (
              <div
                key={index}
                className='transition-all duration-1000 opacity-100 translate-y-0'
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="relative">
                      <img
                        src={program.image}
                        alt={program.name}
                        className="rounded-2xl shadow-xl w-full h-80 object-cover"
                      />
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{program.name}</h2>
                    <p className="text-xl text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  {program.grades.map((grade, gradeIndex) => (
                    <div
                      key={gradeIndex}
                      className="bg-gradient-to-br from-gray-50 to-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{grade.name}</h3>
                        <span className="bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                          {grade.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-6 text-gray-600">
                        <div className="flex items-center">
                          <Clock size={18} className="mr-2 text-emerald-600" />
                          <span>{program.duration}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/Enroll?programId=${encodeURIComponent(program._id || program.id)}&gradeId=${encodeURIComponent(grade._id || grade.id)}`, { state: { program, grade } })}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center"
                      >
                        Enroll Now
                        <ChevronRight size={20} className="ml-2" />
                      </button>
                    </div>
                  ))}
                </div>
                {index < programs.length - 1 && (
                  <div className="border-t border-gray-200 mt-12"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Not Sure Which Program to Choose?</h2>
          <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
            Our advisors are here to help you select the right program based on your goals and experience level.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg"
          >
            Get Free Consultation
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProgramsPage;
