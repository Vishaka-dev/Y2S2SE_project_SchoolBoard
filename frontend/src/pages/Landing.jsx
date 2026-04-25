import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import logo from '../../logos/logo.webp';
import uniStudents from '../../photos/uni_students.webp';
import school from '../../photos/school.webp';
import Footer from '../components/layout/Footer';

const phrases = [
  { title: 'Collaborative Learning', subtitle: 'Connect, Share, Excel Together' },
  { title: 'Resource Hub', subtitle: 'Access Past Papers & Short Notes' },
  { title: 'Peer Mentorship', subtitle: 'Learn from Sri Lanka\'s Top Students' },
  { title: 'Stay Updated', subtitle: 'Latest Education News & Insights' }
];

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Redirect to feed if already authenticated
  useEffect(() => {
    if (user || authService.isAuthenticated()) {
      navigate('/feed', { replace: true });
    }
  }, [user, navigate]);

  const isAuthenticated = !!user || authService.isAuthenticated();
  const logoPath = isAuthenticated ? '/feed' : '/';

  const handleGetStarted = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    try {
      const status = await authService.getAuthStatus();
      if (status?.authenticated) {
        navigate('/feed');
      } else {
        authService.logout();
        navigate('/register');
      }
    } catch (error) {
      authService.logout();
      navigate('/register');
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Study Resource Hub',
      description: 'Access a vast library of past papers, marking schemes, and short notes curated by top students.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      title: 'Articles & News',
      description: 'Stay updated with education news and publish opinions on career paths, university life, and study tips.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community Forums',
      description: 'Connect with mentors, join study groups, and ask questions from a supportive community of peers.'
    }
  ];

  const testimonials = [
    {
      name: 'Dinil Dilmith',
      role: 'STUDENT, COLOMBO',
      quote: 'LearnLink helped me find the exact notes I needed for my A/L exams. The community is incredibly supportive when you\'re stuck on a problem.',
      image: '/images/landing/dinil.jpg'
    },
    {
      name: 'Manuth Wilegoda',
      role: 'UNDERGRADUATE, GALLE',
      quote: 'I love writing articles here. It\'s a great way to improve my writing skills and share what I know about tech with other students.',
      image: '/images/landing/manuth.png'
    },
    {
      name: 'Amaya Gunasekara',
      role: 'STUDENT, JAFFNA',
      quote: 'The past paper archive is a lifesaver. Everything is organized perfectly for easy access. Highly recommended!',
      image: '/images/landing/amaya.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={logoPath} className="flex items-center space-x-2">
              <img src={logo} alt="LearnLink Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">LearnLink</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#resources" className="text-gray-700 hover:text-blue-600 transition-colors">Resources</a>
              <a href="#articles" className="text-gray-700 hover:text-blue-600 transition-colors">Articles</a>
              <a href="#community" className="text-gray-700 hover:text-blue-600 transition-colors">Community</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About Us</a>
              <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-300">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Log in</Link>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#resources" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Resources</a>
              <a href="#articles" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Articles</a>
              <a href="#community" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Community</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">About Us</a>
              <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Log in</Link>
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-center"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-white overflow-hidden">
        {/* Dark Blue Corner Fill - Right Side */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-900 pointer-events-none z-0"></div>
        {/* Diagonal Stripes - Right Side Only */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none z-0" style={{ transform: 'skewX(-15deg)', transformOrigin: 'top right' }}>
          <div className="w-full h-full flex">
            <div className="flex-1 bg-blue-100"></div>
            <div className="flex-1 bg-blue-300"></div>
            <div className="flex-1 bg-blue-500"></div>
            <div className="flex-1 bg-blue-600"></div>
            <div className="flex-1 bg-blue-700"></div>
            <div className="flex-1 bg-blue-800"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center animate-fadeIn">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Empowering Students Through{' '}
                <span className="text-blue-600">Knowledge</span>
                <br />
                <span className="text-blue-600">& Community</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Join Sri Lanka's fastest-growing digital platform to share past papers, discover insightful articles, and connect with peers from across the island.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-lg hover:shadow-xl"
                >
                  Join Now
                </button>
                <a
                  href="#resources"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Explore Resources
                </a>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    A
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    B
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    C
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs border-2 border-white">
                    +20
                  </div>
                </div>
                <p className="text-sm text-gray-600">Trusted by students island-wide</p>
              </div>
            </div>
            <div className="relative group/hero">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1">
                <img
                  src={uniStudents}
                  alt="University students collaborating"
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover/hero:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center min-h-[70px] flex flex-col justify-center items-center shadow-lg transition-all duration-300">
                    <div className="overflow-hidden w-full relative h-[40px]">
                      {phrases.map((phrase, idx) => {
                        const isPrev = (currentPhrase - 1 + phrases.length) % phrases.length === idx;
                        const isCurrent = currentPhrase === idx;

                        return (
                          <div
                            key={idx}
                            className={`transition-all duration-700 absolute inset-0 flex flex-col items-center justify-center w-full ${isCurrent
                              ? 'opacity-100 translate-x-0'
                              : isPrev
                                ? 'opacity-0 -translate-x-full pointer-events-none'
                                : 'opacity-0 translate-x-full pointer-events-none'
                              }`}
                          >
                            <p className="text-sm font-extrabold text-blue-600 uppercase tracking-widest">{phrase.title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">{phrase.subtitle}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="resources" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2 uppercase tracking-wide">Why Choose LearnLink?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to excel in your studies
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A centralized hub designed specifically for local curriculum and student needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 border border-blue-100 cursor-default"
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Life Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-blue-50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={school}
                alt="School students learning"
                className="w-full h-auto object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for <span className="text-blue-600">Sri Lankan Students</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                From O/L and A/L students to university undergraduates, LearnLink provides resources tailored to your academic journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-lg p-2 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Exam-Focused Resources</h3>
                    <p className="text-gray-600 text-sm">Past papers, model answers, and marking schemes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-lg p-2 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Peer-to-Peer Learning</h3>
                    <p className="text-gray-600 text-sm">Connect with students from your school or university</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-lg p-2 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Free Access</h3>
                    <p className="text-gray-600 text-sm">All resources available at no cost to students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="community" className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Voices of Our Community
            </h2>
            <p className="text-gray-600">
              See how LearnLink is helping students achieve their academic goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-default border border-transparent hover:border-blue-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-blue-100 shadow-sm">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-blue-600 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of Sri Lankan students who are learning smarter, not harder. Sign up today for free access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg"
            >
              Get Started Free
            </button>
            <a
              href="#resources"
              className="bg-transparent text-white px-8 py-3 rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              View Resources
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
