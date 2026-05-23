import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Upload, X, FileText, Image, Film, 
  ChevronDown, ChevronUp, BookOpen, Users, HelpCircle,
  ShieldCheck, Clock, AlertCircle, GraduationCap, Check, 
  XCircle, Send, Eye, ToggleLeft, ToggleRight, Phone, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = '/api';

function InstructorDashboard({ loggedUser }) {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState([]);
  const [quiz, setQuiz] = useState([{ question: '', a: '', b: '', answer: '' }]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  // Tuition state
  const [tuitionRequests, setTuitionRequests] = useState([]);
  const [tuitionOffers, setTuitionOffers] = useState([]);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');
  // Post offer form
  const [offerSubject, setOfferSubject] = useState('');
  const [offerLevel, setOfferLevel] = useState('Class 9-10');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerRate, setOfferRate] = useState('');
  const [offerAvailability, setOfferAvailability] = useState('');
  const [offerPhone, setOfferPhone] = useState('');
  const [offerEmail, setOfferEmail] = useState('');
  const [postingOffer, setPostingOffer] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);

  const token = localStorage.getItem('token') || '';
  const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/instructor/courses`, { headers: authHeaders });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Instructor catalog load error:', e.message);
      toast.error('Could not load your courses: ' + e.message);
    }
  }, [authHeaders]);

  const fetchTuitionData = useCallback(async () => {
    setTuitionLoading(true);
    try {
      const [reqRes, offerRes] = await Promise.all([
        fetch(`${API}/tuition/all-requests`, { headers: authHeaders }),
        fetch(`${API}/tuition/my-offers`, { headers: authHeaders }),
      ]);
      if (reqRes.ok) setTuitionRequests(await reqRes.json());
      if (offerRes.ok) setTuitionOffers(await offerRes.json());
    } catch (e) {
      toast.error('Could not load tuition data.');
    } finally {
      setTuitionLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { if (activeTab === 'tuition') fetchTuitionData(); }, [activeTab, fetchTuitionData]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const addQuestion = () => setQuiz(prev => [...prev, { question: '', a: '', b: '', answer: '' }]);
  const removeQuestion = (i) => setQuiz(prev => prev.length === 1 ? [{ question: '', a: '', b: '', answer: '' }] : prev.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) => setQuiz(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const handleUpload = async () => {
    if (!title.trim() || !description.trim()) { toast.error('Title and description are required.'); return; }
    setLoading(true); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('price', priceType === 'free' ? 'Free' : price);
      const validQuiz = quiz.filter(q => q.question && q.answer).map(q => ({
        question: q.question, options: [q.a, q.b].filter(Boolean), a: q.a, b: q.b, answer: q.answer,
      }));
      fd.append('quiz', JSON.stringify(validQuiz));
      files.forEach(f => fd.append('files', f));
      const res = await fetch(`${API}/courses`, { method: 'POST', headers: authHeaders, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      toast.success('Course submitted for approval! 🚀');
      setTitle(''); setDescription(''); setPriceType('free'); setPrice('');
      setFiles([]); setQuiz([{ question: '', a: '', b: '', answer: '' }]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchCourses();
      setActiveTab('courses');
    } catch (e) {
      toast.error(e.message || 'Upload failed.');
    } finally {
      setLoading(false); setUploading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const res = await fetch(`${API}/courses/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      toast.success('Course deleted.');
      await fetchCourses();
    } catch (e) {
      toast.error(e.message || 'Failed to delete.');
    }
  };

  const handleAccept = async (reqId) => {
    try {
      const res = await fetch(`${API}/tuition/request/${reqId}/accept`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherResponse: responseText }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Request accepted! ✅');
      setRespondingId(null); setResponseText('');
      fetchTuitionData();
    } catch (e) {
      toast.error('Failed to accept request.');
    }
  };

  const handleDecline = async (reqId) => {
    try {
      const res = await fetch(`${API}/tuition/request/${reqId}/decline`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherResponse: responseText }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Request declined.');
      setRespondingId(null); setResponseText('');
      fetchTuitionData();
    } catch (e) {
      toast.error('Failed to decline request.');
    }
  };

  const handlePostOffer = async () => {
    if (!offerSubject || !offerLevel) { toast.error('Subject and level are required.'); return; }
    setPostingOffer(true);
    try {
      const res = await fetch(`${API}/tuition/offer`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: offerSubject, level: offerLevel, description: offerDesc,
          rate: offerRate || 'Negotiable', availability: offerAvailability,
          contactPhone: offerPhone, contactEmail: offerEmail || loggedUser?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      toast.success('Tuition offer posted! 🎉');
      setOfferSubject(''); setOfferLevel('Class 9-10'); setOfferDesc('');
      setOfferRate(''); setOfferAvailability(''); setOfferPhone(''); setOfferEmail('');
      setShowOfferForm(false);
      fetchTuitionData();
    } catch (e) {
      toast.error(e.message || 'Failed to post offer.');
    } finally {
      setPostingOffer(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`${API}/tuition/offer/${offerId}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error('Failed');
      toast.success('Offer deleted.');
      fetchTuitionData();
    } catch (e) {
      toast.error('Failed to delete offer.');
    }
  };

  const handleToggleOffer = async (offerId) => {
    try {
      const res = await fetch(`${API}/tuition/offer/${offerId}/toggle`, { method: 'PATCH', headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed');
      toast.success(data.message);
      fetchTuitionData();
    } catch (e) {
      toast.error('Failed to update offer.');
    }
  };

  const statusColor = (status) => {
    if (status === 'accepted') return 'text-green-400 bg-green-900/20 border-green-900/40';
    if (status === 'declined') return 'text-red-400 bg-red-900/20 border-red-900/40';
    return 'text-yellow-400 bg-yellow-900/20 border-yellow-900/40';
  };

  const tabs = [
    ['upload', 'Upload Course'],
    ['courses', 'My Catalog'],
    ['tuition', '🎓 Tuition'],
  ];

  return (
    <div className="pt-16 min-h-screen bg-[#0f0a0b] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-1">
            Instructor <span className="text-[#A82030]">Dashboard</span>
          </h1>
          <p className="text-[#c5b4b8]">Welcome, {loggedUser?.name || 'Instructor'}</p>
        </motion.div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-blue-900/10 border border-blue-900/30 flex items-start gap-4">
          <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-blue-400">Course Moderation Active</h4>
            <p className="text-xs text-[#c5b4b8] mt-1">All new course uploads must be reviewed and approved by administrators before appearing to students.</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Your Courses', value: courses.length, icon: <BookOpen size={18} /> },
            { label: 'Approved', value: courses.filter(c => c.isApproved).length, icon: <ShieldCheck size={18} /> },
            { label: 'Pending', value: courses.filter(c => !c.isApproved).length, icon: <Clock size={18} /> },
            { label: 'Tuition Requests', value: tuitionRequests.filter(r => r.status === 'pending').length, icon: <GraduationCap size={18} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="flex justify-center text-[#F8C1B8] mb-1">{icon}</div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#c5b4b8]">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white'
                  : 'bg-white/5 border border-white/10 text-[#c5b4b8] hover:border-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ===== UPLOAD TAB ===== */}
          {activeTab === 'upload' && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload size={20} className="text-[#A82030]" /> Upload New Course
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Course Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Complete Web Development Bootcamp"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/50 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Description *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe what students will learn…"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/50 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Pricing</label>
                  <div className="flex gap-3">
                    {['free', 'paid'].map(p => (
                      <button key={p} type="button" onClick={() => setPriceType(p)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                          priceType === p ? 'border-[#A82030] bg-[#6B0F1A]/20 text-[#F8C1B8]' : 'border-white/10 bg-white/5 text-[#c5b4b8]'
                        }`}>
                        {p === 'free' ? '🎁 Free' : '💳 Paid'}
                      </button>
                    ))}
                  </div>
                  {priceType === 'paid' && (
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price in BDT (৳)"
                      className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/50 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#c5b4b8] mb-1.5">Course Materials</label>
                  <motion.label whileHover={{ scale: 1.01 }}
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#6B0F1A]/40 rounded-2xl cursor-pointer hover:border-[#A82030]/60 hover:bg-[#6B0F1A]/5 transition-all">
                    <Upload size={28} className="text-[#6B0F1A] mb-2" />
                    <p className="text-sm text-[#c5b4b8]"><span className="text-[#F8C1B8] font-medium">Click to upload</span> or drag & drop</p>
                    <p className="text-xs text-[#c5b4b8]/60 mt-1">Images, Videos, PDFs — up to 100MB each</p>
                    <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,video/*,.pdf,.zip,.ppt,.pptx" onChange={handleFileChange} />
                  </motion.label>
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between py-2 px-3 bg-white/5 border border-white/10 rounded-xl">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs">{getFileIcon(f.type)}</span>
                            <span className="text-sm text-white truncate">{f.name}</span>
                            <span className="text-xs text-[#c5b4b8]/60 flex-shrink-0">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                          </div>
                          <button onClick={() => removeFile(i)} className="ml-2 text-red-400 hover:text-red-300"><X size={14} /></button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle size={16} className="text-[#A82030]" />
                    <label className="text-xs font-medium text-[#c5b4b8]">Quiz Questions (optional)</label>
                  </div>
                  <div className="space-y-3">
                    {quiz.map((q, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-[#F8C1B8]">Question {i + 1}</span>
                          <button onClick={() => removeQuestion(i)} className="text-red-400/60 hover:text-red-400"><X size={14} /></button>
                        </div>
                        {[['question','Enter question…'],['a','Option A'],['b','Option B'],['answer','Correct answer (must match A or B exactly)']].map(([field, ph]) => (
                          <input key={field} value={q[field]} onChange={e => updateQuestion(i, field, e.target.value)} placeholder={ph}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                        ))}
                      </motion.div>
                    ))}
                    <button onClick={addQuestion} className="flex items-center gap-2 text-sm text-[#A82030] hover:text-[#F8C1B8] transition-colors">
                      <Plus size={14} /> Add Question
                    </button>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleUpload} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl text-base disabled:opacity-60 transition-all mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Uploading…
                    </span>
                  ) : <><Upload size={18} /> Submit for Approval</>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ===== COURSES TAB ===== */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {courses.length === 0 ? (
                <div className="flex flex-col items-center py-24 text-center">
                  <BookOpen size={48} className="text-[#6B0F1A]/40 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
                  <p className="text-[#c5b4b8] mb-6">Upload your first course to get started.</p>
                  <button onClick={() => setActiveTab('upload')} className="px-6 py-3 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl">Upload Course</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course, i) => (
                    <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.price === 0 || course.price === 'Free' ? 'bg-green-900/40 text-green-400' : 'bg-[#6B0F1A]/40 text-[#F8C1B8]'}`}>
                                {course.price === 0 || course.price === 'Free' ? 'FREE' : `৳${course.price}`}
                              </span>
                              {course.isApproved ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase"><ShieldCheck size={12} /> Published</span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase"><Clock size={12} /> Pending Approval</span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-white">{course.title}</h3>
                            <p className="text-sm text-[#c5b4b8] mt-1 line-clamp-2">{course.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setExpandedId(expandedId === course._id ? null : course._id)}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#c5b4b8] hover:text-white transition-all">
                              {expandedId === course._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button onClick={() => deleteCourse(course._id)} className="p-2 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3 text-xs text-[#c5b4b8]/60">
                          <span>{course.students || 0} students enrolled</span>
                          <span>{course.files?.length || 0} files uploaded</span>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedId === course._id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/10">
                            <div className="px-6 py-4">
                              <h4 className="text-xs font-semibold text-[#F8C1B8] mb-3 uppercase tracking-wider">Course Materials</h4>
                              {course.files?.length > 0 ? (
                                <div className="space-y-2">
                                  {course.files.map((f, fi) => (
                                    <div key={fi} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-xl">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span>{getFileIcon(f.type)}</span>
                                        <span className="text-sm text-white truncate">{f.originalName || f.name}</span>
                                      </div>
                                      <a href={f.url} target="_blank" rel="noreferrer"
                                        className="ml-2 text-xs text-[#A82030] hover:text-[#F8C1B8] border border-[#6B0F1A]/40 px-2 py-1 rounded-lg transition-all">
                                        View
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-sm text-[#c5b4b8]/60">No files uploaded.</p>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ===== TUITION TAB ===== */}
          {activeTab === 'tuition' && (
            <motion.div key="tuition" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">

              {/* ---- Student Requests Section ---- */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-[#A82030]" /> Student Tuition Requests
                  {tuitionRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                      {tuitionRequests.filter(r => r.status === 'pending').length} pending
                    </span>
                  )}
                </h2>

                {tuitionLoading ? (
                  <div className="text-center py-12 text-[#c5b4b8]">Loading requests…</div>
                ) : tuitionRequests.length === 0 ? (
                  <div className="text-center py-12 text-[#c5b4b8]/60 bg-white/[0.02] border border-white/10 rounded-2xl">
                    No tuition requests yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tuitionRequests.map((req) => (
                      <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl p-5">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor(req.status)}`}>
                                {req.status}
                              </span>
                              <span className="text-xs text-[#c5b4b8]/60">{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-base font-bold text-white">{req.studentName}</h3>
                            <p className="text-sm text-[#c5b4b8] mt-0.5">
                              <span className="text-[#F8C1B8]">{req.subject}</span> · {req.level}
                            </p>
                            {req.message && <p className="text-sm text-[#c5b4b8]/70 mt-2 italic">"{req.message}"</p>}
                            <div className="flex gap-4 mt-2 text-xs text-[#c5b4b8]/60 flex-wrap">
                              {req.email && <span className="flex items-center gap-1"><Mail size={11} />{req.email}</span>}
                              {req.phone && <span className="flex items-center gap-1"><Phone size={11} />{req.phone}</span>}
                            </div>
                            {req.assignedTeacherName && (
                              <p className="text-xs text-green-400 mt-2">Accepted by: {req.assignedTeacherName}</p>
                            )}
                            {req.teacherResponse && (
                              <p className="text-xs text-[#c5b4b8]/70 mt-1 italic">Response: "{req.teacherResponse}"</p>
                            )}
                          </div>

                          {req.status === 'pending' && (
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {respondingId === req._id ? (
                                <div className="flex flex-col gap-2 w-56">
                                  <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                                    placeholder="Optional message to student…" rows={2}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-xs resize-none" />
                                  <div className="flex gap-2">
                                    <button onClick={() => handleAccept(req._id)}
                                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-700/30 border border-green-700/50 text-green-400 rounded-xl text-xs font-medium hover:bg-green-700/50 transition-all">
                                      <Check size={13} /> Accept
                                    </button>
                                    <button onClick={() => handleDecline(req._id)}
                                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-700/30 border border-red-700/50 text-red-400 rounded-xl text-xs font-medium hover:bg-red-700/50 transition-all">
                                      <XCircle size={13} /> Decline
                                    </button>
                                  </div>
                                  <button onClick={() => { setRespondingId(null); setResponseText(''); }}
                                    className="text-xs text-[#c5b4b8]/50 hover:text-[#c5b4b8] text-center">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setRespondingId(req._id)}
                                  className="flex items-center gap-1 px-4 py-2 bg-[#6B0F1A]/30 border border-[#6B0F1A]/50 text-[#F8C1B8] rounded-xl text-xs font-medium hover:bg-[#6B0F1A]/50 transition-all">
                                  <Eye size={13} /> Respond
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* ---- My Tuition Offers Section ---- */}
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap size={20} className="text-[#A82030]" /> My Tuition Offers
                  </h2>
                  <button onClick={() => setShowOfferForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white rounded-xl text-sm font-medium">
                    <Plus size={16} /> Post New Offer
                  </button>
                </div>

                {/* Post offer form */}
                <AnimatePresence>
                  {showOfferForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-5">
                      <div className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-[#6B0F1A]/30 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Send size={16} className="text-[#A82030]" /> Post a Tuition Offer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Subject *</label>
                            <input value={offerSubject} onChange={e => setOfferSubject(e.target.value)} placeholder="e.g. Physics, Math…"
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Level *</label>
                            <select value={offerLevel} onChange={e => setOfferLevel(e.target.value)}
                              className="w-full px-3 py-2.5 bg-[#0f0a0b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6B0F1A] text-sm">
                              {['Class 9-10','Class 11-12','Admission','University','Professional'].map(l => <option key={l}>{l}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Rate (e.g. 500 BDT/hr)</label>
                            <input value={offerRate} onChange={e => setOfferRate(e.target.value)} placeholder="Negotiable"
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Availability</label>
                            <input value={offerAvailability} onChange={e => setOfferAvailability(e.target.value)} placeholder="e.g. Weekends, Evenings"
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Contact Phone</label>
                            <input value={offerPhone} onChange={e => setOfferPhone(e.target.value)} placeholder="01XXXXXXXXX"
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Contact Email</label>
                            <input value={offerEmail} onChange={e => setOfferEmail(e.target.value)} placeholder={loggedUser?.email || 'your@email.com'}
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">Description</label>
                            <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} rows={3}
                              placeholder="Tell students about your teaching style, experience, and what they'll get…"
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm resize-none" />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handlePostOffer} disabled={postingOffer}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                            {postingOffer ? 'Posting…' : 'Post Offer'}
                          </motion.button>
                          <button onClick={() => setShowOfferForm(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-[#c5b4b8] rounded-xl text-sm hover:bg-white/10 transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* List of offers */}
                {tuitionOffers.length === 0 ? (
                  <div className="text-center py-10 text-[#c5b4b8]/60 bg-white/[0.02] border border-white/10 rounded-2xl">
                    You haven't posted any tuition offers yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tuitionOffers.map((offer) => (
                      <motion.div key={offer._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border rounded-2xl p-5 transition-all ${offer.isActive ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${offer.isActive ? 'text-green-400 bg-green-900/20 border-green-900/40' : 'text-gray-400 bg-gray-900/20 border-gray-700/40'}`}>
                                {offer.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white">{offer.subject} <span className="text-[#c5b4b8] font-normal text-sm">· {offer.level}</span></h3>
                            {offer.description && <p className="text-sm text-[#c5b4b8]/70 mt-1">{offer.description}</p>}
                            <div className="flex gap-4 mt-2 text-xs text-[#c5b4b8]/60 flex-wrap">
                              {offer.rate && <span>💰 {offer.rate}</span>}
                              {offer.availability && <span>🕐 {offer.availability}</span>}
                              {offer.contactPhone && <span className="flex items-center gap-1"><Phone size={11} />{offer.contactPhone}</span>}
                              {offer.contactEmail && <span className="flex items-center gap-1"><Mail size={11} />{offer.contactEmail}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleOffer(offer._id)}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#c5b4b8] hover:text-white transition-all" title={offer.isActive ? 'Deactivate' : 'Activate'}>
                              {offer.isActive ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                            </button>
                            <button onClick={() => handleDeleteOffer(offer._id)}
                              className="p-2 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function getFileIcon(type = '') {
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('video')) return '🎬';
  return '📁';
}

export default InstructorDashboard;
