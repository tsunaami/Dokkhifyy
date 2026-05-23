import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Play, ArrowRight, CheckCircle, Globe, Sparkles } from 'lucide-react';

function HomePage({ loggedUser }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-12 px-4">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-[#6B0F1A]/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-[#A82030]/15 blur-[150px] rounded-full"
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B0F1A]/20 border border-[#6B0F1A]/30 text-[#F8C1B8] text-xs font-bold mb-6">
              <Sparkles size={14} className="animate-pulse" />
              BANGLADESH'S #1 SKILL PLATFORM
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-['Poppins'] leading-tight">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F8C1B8] via-[#A82030] to-[#6B0F1A]">
                Digital Potential
              </span>
            </h1>
            <p className="text-[#c5b4b8] text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
              Master in-demand skills with Bangla & English courses led by industry experts. Join 10,000+ students building their future today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/courses"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-[#6B0F1A]/40 transition-all group"
              >
                Browse Courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              {!loggedUser && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Start Learning Now
                </Link>
              )}
              {loggedUser?.role === 'student' && (
                <Link
                  to="/my-learning"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Go to My Courses
                </Link>
              )}
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f0a0b] bg-gray-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="text-white font-bold">12k+ Active Students</p>
                <div className="flex items-center gap-1 text-[#F8C1B8]">
                  <CheckCircle size={12} fill="currentColor" className="text-[#6B0F1A]" />
                  <span className="text-xs text-[#c5b4b8]">Joined this month</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                alt="Learning Together"
                className="w-full h-[550px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a0b] via-transparent to-transparent opacity-60" />
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-6 -right-6 p-4 bg-[#1a0f12]/90 backdrop-blur-md rounded-2xl border border-[#6B0F1A]/30 shadow-xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Play size={18} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-[#c5b4b8]">Now Studying</p>
                  <p className="text-sm font-bold text-white">Fullstack JS</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              className="absolute bottom-12 -left-6 p-4 bg-[#0f0a0b]/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6B0F1A]/30 flex items-center justify-center text-[#F8C1B8]">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#c5b4b8]">Certified</p>
                  <p className="text-sm font-bold text-white">Verified Certificate</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { count: '500+', label: 'Premium Courses', icon: <BookOpen className="text-blue-400" /> },
            { count: '120+', label: 'Verified Instructors', icon: <Users className="text-purple-400" /> },
            { count: '24/7', label: 'Support System', icon: <Globe className="text-emerald-400" /> },
            { count: '10k+', label: 'Success Stories', icon: <CheckCircle className="text-amber-400" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#6B0F1A]/30 transition-all text-center group"
            >
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                {React.cloneElement(stat.icon, { size: 32 })}
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 font-['Poppins']">{stat.count}</h3>
              <p className="text-sm text-[#c5b4b8] uppercase tracking-widest font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

export default HomePage;