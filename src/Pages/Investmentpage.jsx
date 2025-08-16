import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3, Target, Calendar, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';

// Investment Page Component
const InvestmentPage = ({ navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    investmentAmount: '',
    sector: '',
    message: ''
  });

  const useScrollAnimation = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef();
    
    React.useEffect(() => {
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

  const [heroRef, heroVisible] = useScrollAnimation();
  const [opportunitiesRef, opportunitiesVisible] = useScrollAnimation();
  const [whyInvestRef, whyInvestVisible] = useScrollAnimation();
  const [financialsRef, financialsVisible] = useScrollAnimation();
  const [formRef, formVisible] = useScrollAnimation();

  const investmentOpportunities = [
    {
      title: "Security Marketplace Expansion",
      description: "Expand our security marketplace across West Africa with flagship stores in Lagos, Ghana, and Ivory Coast.",
      target: "$2.5M",
      roi: "35-45%",
      timeline: "18-24 months",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Market leadership position", "High-demand products", "Proven business model"]
    },
    {
      title: "Agribusiness Processing Plants",
      description: "Establish value-add processing facilities for cashew, sesame, and ginger to increase export margins.",
      target: "$5.0M",
      roi: "40-55%",
      timeline: "24-36 months",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Vertical integration", "Premium pricing", "Export ready products"]
    },
    {
      title: "Luxury Auto Showrooms",
      description: "Premium automotive showrooms in Lagos, Abuja, and Port Harcourt with full service capabilities.",
      target: "$3.8M",
      roi: "30-40%",
      timeline: "12-18 months",
      image: "https://images.unsplash.com/photo-1562141961-b06ffc730dd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Luxury market growth", "High-margin services", "Exclusive partnerships"]
    }
  ];

  const whyInvestReasons = [
    {
      icon: TrendingUp,
      title: "Proven Growth Trajectory",
      description: "Consistent 40% year-over-year growth across all business divisions with expanding market presence."
    },
    {
      icon: Target,
      title: "Diversified Revenue Streams",
      description: "Multiple income sources across security, agriculture, and automotive sectors minimize investment risk."
    },
    {
      icon: Users,
      title: "Strong Market Position",
      description: "Established relationships with key suppliers and customers across domestic and international markets."
    },
    {
      icon: BarChart3,
      title: "Scalable Business Model",
      description: "Proven systems and processes ready for rapid expansion with proper capital injection."
    }
  ];

  const financialHighlights = [
    { metric: "Revenue Growth", value: "40%", description: "Annual growth rate" },
    { metric: "Market Share", value: "25%", description: "In Nigerian security tech" },
    { metric: "Export Countries", value: "15+", description: "International reach" },
    { metric: "ROI Target", value: "35-55%", description: "Projected returns" }
  ];

  const investmentBenefits = [
    "Quarterly financial reports and updates",
    "Board representation for major investors",
    "Priority access to new product lines",
    "Exclusive investor events and networking",
    "Tax optimization strategies",
    "Exit strategy options after 3-5 years"
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.investmentAmount || !formData.sector) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    // Create email content
    const subject = encodeURIComponent('Investment Inquiry - Cossy White');
    const emailBody = encodeURIComponent(`Dear Cossy White Investment Team,

I am interested in learning more about investment opportunities with your company. Please find my details below:

CONTACT INFORMATION:
- Full Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Company/Organization: ${formData.company || 'N/A'}

INVESTMENT DETAILS:
- Investment Range: ${formData.investmentAmount}
- Sector of Interest: ${formData.sector}

MESSAGE:
${formData.message || 'Please send me detailed information about your current investment opportunities.'}

I would appreciate the opportunity to discuss these investment opportunities further. Please contact me at your earliest convenience to schedule a consultation.

Thank you for your time and consideration.

Best regards,
${formData.name}
${formData.phone}
${formData.email}`);

    // Create mailto link
    const mailtoLink = `mailto:investments@cossywhite.com?subject=${subject}&body=${emailBody}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Clear form after successful submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      investmentAmount: '',
      sector: '',
      message: ''
    });
    
    // Show success message
    alert('Your email client will open with the investment inquiry. Please review and send the email to complete your request.');
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div ref={heroRef} className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Invest in Our 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600"> Vision</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join strategic investors seeking high-growth opportunities in Nigeria's fastest-rising sectors. 
              Partner with us to share in our success story.
            </p>
            <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Investment growth"
                  className="rounded-2xl shadow-2xl w-full h-80 object-cover"
                />
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Invest with Cossy White?</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">Diversified revenue streams for stability</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">Strong supplier and client networks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">Operational transparency and governance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">Proven track record of growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={opportunitiesRef} className={`text-center mb-16 transition-all duration-1000 ${
            opportunitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Current Investment Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Strategic expansion projects with clear ROI projections and defined timelines
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {investmentOpportunities.map((opportunity, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 
                           transform hover:-translate-y-2 border border-gray-100 overflow-hidden group
                           ${opportunitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={opportunity.image}
                    alt={opportunity.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{opportunity.target}</div>
                    <div className="text-sm text-emerald-300">Investment Target</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {opportunity.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="font-bold text-emerald-600">{opportunity.roi}</div>
                      <div className="text-xs text-gray-600">Projected ROI</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900">{opportunity.timeline}</div>
                      <div className="text-xs text-gray-600">Timeline</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {opportunity.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="text-emerald-600 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-600">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => navigate("/contact")} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg
                                   hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-semibold
                                   transform hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div ref={whyInvestRef} className={`text-center mb-16 transition-all duration-1000 ${
            whyInvestVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Cossy White</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our competitive advantages that ensure sustainable returns for our investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyInvestReasons.map((reason, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
                           transform hover:-translate-y-2 text-center group
                           ${whyInvestVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl 
                               flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <reason.icon className="text-white" size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h4>
                <p className="text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Highlights */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div ref={financialsRef} className={`text-center mb-16 transition-all duration-1000 ${
            financialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold mb-4">Financial Highlights</h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Key metrics that demonstrate our growth potential and market position
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {financialHighlights.map((highlight, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-1000 ${
                  financialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">{highlight.value}</div>
                <div className="text-lg font-semibold mb-1">{highlight.metric}</div>
                <div className="text-emerald-200 text-sm">{highlight.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Investor Benefits</h2>
              <p className="text-xl text-gray-600 mb-8">
                We provide comprehensive support and benefits to ensure our investors are informed and engaged.
              </p>
              <div className="space-y-4">
                {investmentBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Investment benefits"
                className="rounded-2xl shadow-lg w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Investment Inquiry Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div ref={formRef} className={`max-w-4xl mx-auto transition-all duration-1000 ${
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Request Investment Prospectus</h2>
              <p className="text-xl text-gray-600">
                Get detailed information about our investment opportunities and how you can participate.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                   focus:border-emerald-500 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                   focus:border-emerald-500 transition-colors"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                   focus:border-emerald-500 transition-colors"
                          placeholder="+234 XXX XXX XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company/Organization</label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                   focus:border-emerald-500 transition-colors"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Investment Range *</label>
                        <select
                          name="investmentAmount"
                          value={formData.investmentAmount}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                   focus:border-emerald-500 transition-colors"
                        >
                          <option value="">Select range</option>
                          <option value="$100K - $500K">$100K - $500K</option>
                          <option value="$500K - $1M">$500K - $1M</option>
                          <option value="$1M - $5M">$1M - $5M</option>
                          <option value="$5M+">$5M+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sector of Interest *</label>
                        <select
                          name="sector"
                          value={formData.sector}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                   focus:border-emerald-500 transition-colors"
                        >
                          <option value="">Select sector</option>
                          <option value="security">Security Technologies</option>
                          <option value="agribusiness">Agribusiness Export</option>
                          <option value="automotive">Luxury Automotive</option>
                          <option value="all">All Divisions</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                                 focus:border-emerald-500 transition-colors resize-none"
                        placeholder="Tell us about your investment interests and any specific questions..."
                      ></textarea>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-lg 
                               font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 
                               transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
                    >
                      Request Prospectus
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-8 lg:p-12 text-white">
                  <h3 className="text-2xl font-bold mb-6">Contact Our Investment Team</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <Phone className="text-emerald-200" size={20} />
                      <span>+234 803 493 1164</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="text-emerald-200" size={20} />
                      <span>investments@cossywhite.com</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                    <h4 className="font-semibold mb-3">What's Next?</h4>
                    <ul className="space-y-2 text-sm text-emerald-100">
                      <li>• We'll review your inquiry within 24 hours</li>
                      <li>• Schedule a confidential consultation</li>
                      <li>• Provide detailed investment prospectus</li>
                      <li>• Discuss terms and partnership structure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestmentPage;