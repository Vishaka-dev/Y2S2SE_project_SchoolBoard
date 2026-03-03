import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../logos/learnlink_logo.png';
import uniStudents from '../../photos/uni_students.webp';
import school from '../../photos/school.webp';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      name: 'Dilshan P.',
      role: 'STUDENT, COLOMBO',
      quote: 'LearnLink helped me find the exact notes I needed for my A/L exams. The community is incredibly supportive when you\'re stuck on a problem.',
      avatar: '👨‍🎓'
    },
    {
      name: 'Fatima R.',
      role: 'UNDERGRADUATE, GALLE',
      quote: 'I love writing articles here. It\'s a great way to improve my writing skills and share what I know about tech with other students.',
      avatar: '👩‍🎓'
    },
    {
      name: 'Thushara K.',
      role: 'STUDENT, JAFFNA',
      quote: 'The past paper archive is a lifesaver. Everything is organized perfectly for easy access. Highly recommended!',
      avatar: '👨‍🎓'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
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
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
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
              <Link to="/register" className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-center">Sign Up</Link>
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
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-lg hover:shadow-xl"
                >
                  Join Now
                </Link>
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
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={uniStudents} 
                  alt="University students collaborating" 
                  className="w-full h-auto object-cover rounded-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-gray-900">Collaborative Learning</p>
                    <p className="text-xs text-gray-600 mt-1">Connect, Share, Excel Together</p>
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
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow border border-blue-100"
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
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
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
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg"
            >
              Get Started Free
            </Link>
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
      <footer id="about" className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src={logo} alt="LearnLink Logo" className="h-8 w-auto" />
                <span className="text-lg font-bold text-white">LearnLink</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering the next generation of Sri Lanka with accessible education resources and a supportive community.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#resources" className="hover:text-white transition-colors">Resources</a></li>
                <li><a href="#articles" className="hover:text-white transition-colors">Articles</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Forums</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Membership</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2026 LearnLink SL. All rights reserved. Made with ❤️ in Sri Lanka
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
