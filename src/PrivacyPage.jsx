import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from 'lucide-react';

function PrivacyPage() {
  return (
    <div className="pt-24 pb-12 px-4 min-h-screen bg-[#0f0a0b]">
      <div className="max-w-4xl auto">
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
              <Shield size={22} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy <span className="text-[#A82030]">Policy</span></h1>
          </div>

          <p className="text-lg text-[#c5b4b8] leading-relaxed mb-10">
            Your privacy is very important to us. Dokkhify ensures that all your personal information is stored securely and never shared with third parties without your consent.
          </p>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-[#6B0F1A]/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-[#F8C1B8]">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure Storage</h3>
                  <p className="text-[#c5b4b8]/70 leading-relaxed text-sm">
                    All your personal data, including name, email, and learning history, is stored on encrypted databases and protected by modern security protocols.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-[#6B0F1A]/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-[#F8C1B8]">
                  <Eye size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transparency</h3>
                  <p className="text-[#c5b4b8]/70 leading-relaxed text-sm">
                    We are open about how we use your enrollment, progress tracking, and payment data to improve your learning experience. No hidden practices.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-[#6B0F1A]/30 transition-all border-[#A82030]/20">
              <div className="flex items-start gap-4">
                <div className="text-[#F8C1B8]">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">User Consent</h3>
                  <p className="text-[#c5b4b8]/70 leading-relaxed text-sm">
                    By using our platform, you agree to our privacy practices. We only collect the data necessary to provide you with the best skill-building services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-[#c5b4b8]/50 text-xs">
            Last Updated: April 2026
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PrivacyPage;