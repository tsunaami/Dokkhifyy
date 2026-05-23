import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

function SignupPage({ setLoggedUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || data.error || 'Signup failed'); return; }
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch {
      toast.error('Server error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#0f0a0b] relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[#6B0F1A]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#A82030]/15 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B0F1A] to-[#A82030] flex items-center justify-center group-hover:shadow-lg transition-all">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold font-['Poppins'] bg-gradient-to-r from-[#F8C1B8] to-[#A82030] bg-clip-text text-transparent">
              Dokkhify
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-[#c5b4b8] text-sm mb-8">Join thousands of learners today</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5b4b8]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/50 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5b4b8]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/50 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5b4b8]" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/50 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'instructor'].map(r => (
                  <motion.button
                    key={r} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      role === r
                        ? 'border-[#A82030] bg-[#6B0F1A]/20 text-[#F8C1B8]'
                        : 'border-white/10 bg-white/5 text-[#c5b4b8] hover:border-white/20'
                    }`}
                  >
                    {r === 'student' ? <GraduationCap size={15} /> : <BookOpen size={15} />}
                    {r}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(107,15,26,0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl mt-2 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account…
                </span>
              ) : (
                <><span>Create Account</span><ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[#c5b4b8] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F8C1B8] font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;
