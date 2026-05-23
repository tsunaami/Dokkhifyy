import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, Menu, X, GraduationCap, Home, Info } from 'lucide-react';

function Navbar({ loggedUser, handleLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/', icon: <Home size={15} /> },
    { label: 'Courses', path: '/courses', icon: <BookOpen size={15} /> },
    { label: 'Tuition', path: '/tuition', icon: <GraduationCap size={15} /> },
    { label: 'About', path: '/about-us', icon: <Info size={15} /> },
  ];

  const handleLogoutAction = () => {
    handleLogout();
    navigate('/');
    setMobileOpen(false);
  };

  const NavItem = ({ label, path, icon, mobile }) => (
    <NavLink
      to={path}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) => `
        flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'text-white bg-[#6B0F1A]/50 border border-[#6B0F1A]/50 shadow-lg shadow-[#6B0F1A]/20' 
          : 'text-[#c5b4b8] hover:text-white hover:bg-[#6B0F1A]/30'
        }
        ${mobile ? 'w-full py-3 mb-1' : ''}
      `}
    >
      {icon} {label}
    </NavLink>
  );

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f0a0b]/95 backdrop-blur-lg shadow-lg shadow-[#6B0F1A]/20 border-b border-[#6B0F1A]/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="cursor-pointer flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B0F1A] to-[#A82030] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#6B0F1A]/40 transition-all"
            >
              <BookOpen size={16} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold font-['Poppins'] bg-gradient-to-r from-[#F8C1B8] to-[#A82030] bg-clip-text text-transparent">
              Dokkhify
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavItem key={link.label} {...link} />
            ))}

            {loggedUser?.role === 'instructor' && (
              <NavItem label="Dashboard" path="/dashboard" icon={<LayoutDashboard size={15} />} />
            )}

            {loggedUser?.role === 'student' && (
              <NavItem label="My Learning" path="/my-learning" icon={<LayoutDashboard size={15} />} />
            )}
          </div>

          {/* Auth Buttons Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {!loggedUser ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#F8C1B8] border border-[#6B0F1A]/50 rounded-lg hover:bg-[#6B0F1A]/20 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white rounded-lg hover:shadow-lg hover:shadow-[#6B0F1A]/40 transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm text-right">
                  <p className="text-white font-medium leading-none">{loggedUser.name}</p>
                  <p className="text-[#F8C1B8]/60 text-xs capitalize">{loggedUser.role}</p>
                </div>
                {loggedUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#A82030]/20 text-[#F8C1B8] border border-[#A82030]/30 rounded-lg hover:bg-[#A82030]/30 transition-all uppercase tracking-wider"
                  >
                    Admin Panel
                  </Link>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogoutAction}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-all"
                >
                  <LogOut size={14} /> Logout
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f0a0b]/98 backdrop-blur-xl border-t border-[#6B0F1A]/30 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <NavItem key={link.label} {...link} mobile />
              ))}
              {loggedUser?.role === 'instructor' && (
                <NavItem label="Dashboard" path="/dashboard" icon={<LayoutDashboard size={15} />} mobile />
              )}
              {loggedUser?.role === 'student' && (
                <NavItem label="My Learning" path="/my-learning" icon={<LayoutDashboard size={15} />} mobile />
              )}
              {loggedUser?.role === 'admin' && (
                <NavItem label="Admin Panel" path="/admin" icon={<LayoutDashboard size={15} />} mobile />
              )}
              <div className="pt-2 border-t border-[#6B0F1A]/20 flex gap-2">
                {!loggedUser ? (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center text-sm text-[#F8C1B8] border border-[#6B0F1A]/50 rounded-lg">Login</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white rounded-lg">Sign Up</Link>
                  </>
                ) : (
                  <button onClick={handleLogoutAction} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-red-400 border border-red-900/50 rounded-lg">
                    <LogOut size={14} /> Logout
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
