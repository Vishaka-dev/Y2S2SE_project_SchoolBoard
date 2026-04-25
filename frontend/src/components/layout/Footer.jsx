import React from 'react';
import { Mail, Globe, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import learnlinkLogo from '../../../logos/logo.webp';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 mt-auto">
      <div className="mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <img src={learnlinkLogo} alt="LearnLink" className="h-8 w-auto" />
              <h2 className="text-xl font-bold text-gray-900">LearnLink</h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-dm-sans">
              The all-in-one social platform for students, teachers, and institutions to collaborate, share resources, and grow together.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Platform</h3>
            <ul className="space-y-4">
              <li><a href="/feed" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Home Feed</a></li>
              <li><a href="/resource-hub" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Resource Hub</a></li>
              <li><a href="/events" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Events Board</a></li>
              <li><a href="/groups" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Groups</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Safety Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">support@learnlink.edu</span>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">www.learnlink.edu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © {currentYear} LearnLink Educational Platforms. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the future of education
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
