import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Send, CheckCircle, ArrowRight, Phone, Mail, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const API = '/api';

function TuitionPage() {
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('Class 9-10');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [teacherOffers, setTeacherOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API}/tuition/offers`);
        if (res.ok) setTeacherOffers(await res.json());
      } catch {}
      finally { setOffersLoading(false); }
    };
    fetchOffers();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!studentName || !subject) { toast.error('Name and Subject are required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/tuition/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, subject, level, message, email, phone })
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      toast.success('Your tuition request has been sent! 🎉');
      setSubmitted(true);
      setStudentName(''); setSubject(''); setMessage(''); setEmail(''); setPhone('');
    } catch (err) {
      toast.error('Failed to send request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = teacherOffers.filter(o =>
    !searchTerm ||
    o.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen bg-[#0f0a0b] relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#6B0F1A]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#A82030]/10 blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto relative">

        {/* Hero + Request Form */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B0F1A]/20 border border-[#6B0F1A]/30 text-[#F8C1B8] text-xs font-bold mb-6">
              <GraduationCap size={14} /> PERSONALISED LEARNING
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-['Poppins'] leading-tight">
              Book a <span className="text-[#A82030]">Tuition</span> Session
            </h1>
            <p className="text-[#c5b4b8] text-lg mb-8 leading-relaxed">
              Need extra help? Our expert instructors provide one-on-one virtual tuition tailored to your needs.
            </p>
            <ul className="space-y-4">
              {['One-on-one personalized attention', 'Expert instructors in various fields', 'Flexible scheduling', 'Focused exam preparation'].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 text-[#c5b4b8]">
                  <div className="w-5 h-5 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center text-green-400">
                    <CheckCircle size={12} />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:w-1/2 w-full">
            <div className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-3xl p-8 shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center text-green-400 mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
                  <p className="text-[#c5b4b8] mb-6">A teacher will review and respond to your request soon.</p>
                  <button onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl text-sm">
                    Submit Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Send size={20} className="text-[#A82030]" /> Service Request
                  </h2>
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5 uppercase tracking-wider">Your Name *</label>
                        <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name" required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/30 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5 uppercase tracking-wider">Subject *</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Math, Physics…" required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/30 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5 uppercase tracking-wider">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/30 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5 uppercase tracking-wider">Phone</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/30 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5 uppercase tracking-wider">Academic Level</label>
                      <select value={level} onChange={e => setLevel(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0f0a0b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6B0F1A] transition-all text-sm appearance-none">
                        {['Class 9-10','Class 11-12','Admission','University','Professional'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5 uppercase tracking-wider">Message</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what you want to learn…" rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/30 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm resize-none" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-bold rounded-xl text-base disabled:opacity-60 transition-all">
                      {loading ? 'Sending…' : <><span className="flex items-center gap-2">Book Tuition Session <ArrowRight size={18} /></span></>}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Available Tutors Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Users size={26} className="text-[#A82030]" /> Available <span className="text-[#A82030] ml-2">Tutors</span>
              </h2>
              <p className="text-[#c5b4b8] mt-1 text-sm">Browse tutors and contact them directly.</p>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5b4b8]/50" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search subject, level…"
                className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm w-56" />
            </div>
          </div>

          {offersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-16 text-[#c5b4b8]/60 bg-white/[0.02] border border-white/10 rounded-2xl">
              {searchTerm ? `No tutors found for "${searchTerm}".` : 'No tutors available right now. Check back soon!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer, i) => (
                <motion.div key={offer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl p-5 hover:border-[#6B0F1A]/40 transition-all group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6B0F1A] to-[#A82030] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {offer.teacherName?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{offer.teacherName}</p>
                      <p className="text-xs text-[#c5b4b8]">{offer.subject}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6B0F1A]/20 border border-[#6B0F1A]/30 text-[#F8C1B8]">{offer.level}</span>
                    {offer.rate && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#c5b4b8]">💰 {offer.rate}</span>}
                  </div>
                  {offer.description && <p className="text-sm text-[#c5b4b8]/80 mb-3 line-clamp-2">{offer.description}</p>}
                  {offer.availability && <p className="text-xs text-[#c5b4b8]/60 mb-3">🕐 {offer.availability}</p>}
                  <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                    {offer.contactPhone && (
                      <a href={`tel:${offer.contactPhone}`}
                        className="flex items-center gap-2 text-xs text-white bg-[#6B0F1A]/20 border border-[#6B0F1A]/30 px-3 py-2 rounded-xl hover:bg-[#6B0F1A]/40 transition-all">
                        <Phone size={13} className="text-[#A82030]" /> {offer.contactPhone}
                      </a>
                    )}
                    {offer.contactEmail && (
                      <a href={`mailto:${offer.contactEmail}`}
                        className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
                        <Mail size={13} className="text-[#A82030]" /> {offer.contactEmail}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default TuitionPage;
