import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#0a0608] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B0F1A] to-[#A82030] flex items-center justify-center group-hover:shadow-lg transition-all">
                <BookOpen size={15} className="text-white" />
              </div>
              <span className="text-lg font-bold font-['Poppins'] bg-gradient-to-r from-[#F8C1B8] to-[#A82030] bg-clip-text text-transparent">
                Dokkhify
              </span>
            </Link>
            <p className="text-sm text-[#c5b4b8]/70 leading-relaxed">
              Bangladesh's premier online learning platform. Structured courses in Bangla & English, guided by verified instructors.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: 'Courses', path: '/courses' },
                { label: 'About Us', path: '/about-us' },
                { label: 'Privacy Policy', path: '/privacy' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="text-sm text-[#c5b4b8]/70 hover:text-[#F8C1B8] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <div className="flex items-center gap-2 text-sm text-[#c5b4b8]/70">
              <Mail size={14} />
              <span>support@dokkhify.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#c5b4b8]/50">
            © {new Date().getFullYear()} Dokkhify. All rights reserved.
          </p>
          <p className="text-xs text-[#c5b4b8]/50">
            Made with ❤️ for learners in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;