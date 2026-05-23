import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, Target, Users, Shield } from 'lucide-react';

function AboutPage() {
  return (
    <div className="pt-24 pb-12 px-4 min-h-screen bg-[#0f0a0b]">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            to="/"
            className="flex items-center gap-2 text-[#c5b4b8] hover:text-[#F8C1B8] transition-colors mb-8 group w-fit"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-[#6B0F1A]/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6B0F1A]/10 blur-3xl rounded-full translate-x-16 -translate-y-16" />

          <div className="flex items-center gap-3 mb-6 font-['Poppins']">
            <div className="w-10 h-10 rounded-xl bg-[#6B0F1A]/20 flex items-center justify-center text-[#F8C1B8]">
              <Info size={22} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">About <span className="text-[#A82030]">Dokkhify</span></h1>
          </div>

          <p className="text-lg text-[#c5b4b8] leading-relaxed mb-10">
            Dokkhify is a secure, skill-based e-learning platform offering structured courses in Bangla and English, guided by verified instructors. Our platform provides quizzes, assignments, tuition support, and certificates to help learners gain practical skills and improve employability.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-[#6B0F1A]/20 flex items-center justify-center text-[#F8C1B8] mb-4">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Our Mission</h3>
              <p className="text-sm text-[#c5b4b8]/70 leading-relaxed">
                To make high-quality, practical education accessible and affordable, bridging the gap between academia and industry requirements in Bangladesh.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-[#6B0F1A]/20 flex items-center justify-center text-[#F8C1B8] mb-4">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">For Everyone</h3>
              <p className="text-sm text-[#c5b4b8]/70 leading-relaxed">
                Whether you're a student looking to upskill or an instructor wanting to share knowledge and earn, Dokkhify provides the tools to succeed.
              </p>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#6B0F1A]/20 to-transparent border border-[#6B0F1A]/20">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-[#F8C1B8]">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1 text-base">Verified Excellence</h4>
                <p className="text-sm text-[#c5b4b8]/70">
                  Every course and instructor on our platform goes through a verification process to ensure you get the best learning experience.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutPage;