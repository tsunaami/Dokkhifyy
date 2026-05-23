import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award, BookOpen, CheckCircle, Clock, Play, GraduationCap,
  Mail, Phone, MessageSquare, Plus, ChevronDown, ChevronUp,
  FileText, Image as ImageIcon, Film, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const API = '/api';

/* ─── tiny helpers ─── */
function fileIcon(type = '') {
  if (type.includes('pdf'))   return <FileText size={14} className="text-red-400" />;
  if (type.includes('image')) return <ImageIcon size={14} className="text-blue-400" />;
  if (type.includes('video')) return <Film size={14} className="text-purple-400" />;
  return <FileText size={14} className="text-gray-400" />;
}

/* ─── Course Content Viewer ─── */
function CourseContent({ course, loggedUser, onCertificate }) {
  const [quizAnswers, setQuizAnswers]   = useState({});
  const [quizChecked, setQuizChecked]   = useState({});
  const [quizScore,   setQuizScore]     = useState(null);
  const [savingProgress, setSaving]     = useState(false);

  // normalise quiz: handles both `answer`/`correctAnswer` field names and
  // options that might be stored as an array or as a/b fields
  const quiz = useMemo(() => {
    const raw = course.quiz || [];
    return raw
      .filter(q => q?.question)
      .map(q => {
        const correctAnswer = q.answer || q.correctAnswer || '';
        let options = [];
        if (Array.isArray(q.options) && q.options.filter(Boolean).length > 0) {
          options = q.options.filter(Boolean);
        } else {
          options = [q.a, q.b].filter(Boolean);
        }
        // make sure correctAnswer is in options
        if (correctAnswer && !options.includes(correctAnswer)) {
          options.push(correctAnswer);
        }
        return { ...q, options, correctAnswer };
      })
      .filter(q => q.options.length > 0 && q.correctAnswer);
  }, [course.quiz]);

  const submitQuiz = async () => {
    if (!quiz.length) return;
    let correct = 0;
    const checked = {};
    quiz.forEach((q, i) => {
      const isCorrect = quizAnswers[i] === q.correctAnswer;
      checked[i] = isCorrect;
      if (isCorrect) correct++;
    });
    setQuizChecked(checked);
    const score = Math.round((correct / quiz.length) * 100);
    setQuizScore(score);
    toast(score === 100 ? '🎉 Perfect score!' : `Score: ${score}%`, { icon: score >= 70 ? '✅' : '❌' });

    if (score >= 70) {
      setSaving(true);
      try {
        await fetch(`${API}/myCourses/${course._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ progress: 100, completed: true, certificate: true }),
        });
        toast.success('Certificate unlocked! 🏆');
        onCertificate?.();
      } catch { /* silent */ }
      finally { setSaving(false); }
    }
  };

  return (
    <div className="mt-5 space-y-6">

      {/* ── FILES ── */}
      {course.files?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-[#F8C1B8] uppercase tracking-wider mb-3">Course Materials</h4>
          <div className="space-y-3">
            {course.files.map((f, i) => {
              const url = f.url || f.content || '';
              const isImage = f.type?.includes('image');
              const isVideo = f.type?.includes('video');
              const isPDF   = f.type?.includes('pdf');
              return (
                <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    {fileIcon(f.type || '')}
                    <span className="text-sm text-white flex-1 truncate">{f.originalName || f.name || `File ${i + 1}`}</span>
                    <a href={url} target="_blank" rel="noreferrer" download={f.originalName || f.name}
                      className="flex items-center gap-1 text-xs text-[#A82030] hover:text-[#F8C1B8] border border-[#6B0F1A]/40 px-2 py-1 rounded-lg transition-all">
                      <Download size={11} /> Download
                    </a>
                  </div>

                  {/* inline image */}
                  {isImage && url && (
                    <div className="px-4 pb-4">
                      <img src={url} alt={f.originalName || f.name} className="w-full max-h-80 object-contain rounded-lg bg-black/20" />
                    </div>
                  )}

                  {/* inline video */}
                  {isVideo && url && (
                    <div className="px-4 pb-4">
                      <video controls className="w-full max-h-72 rounded-lg bg-black" src={url}>
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}

                  {/* PDF embed */}
                  {isPDF && url && (
                    <div className="px-4 pb-4">
                      <iframe src={url} title={f.originalName || f.name}
                        className="w-full h-72 rounded-lg border border-white/10" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {quiz.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-[#F8C1B8] uppercase tracking-wider mb-3">
            Quiz ({quiz.length} question{quiz.length > 1 ? 's' : ''})
            {quizScore !== null && (
              <span className={`ml-3 text-xs font-bold ${quizScore >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                — Score: {quizScore}%
              </span>
            )}
          </h4>
          <div className="space-y-4">
            {quiz.map((q, qi) => (
              <div key={qi} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-3">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = quizAnswers[qi] === opt;
                    const isCorrect = q.correctAnswer === opt;
                    let style = 'border-white/10 bg-white/5 text-[#c5b4b8]';
                    if (quizChecked[qi] !== undefined) {
                      if (isCorrect)       style = 'border-green-600/60 bg-green-900/20 text-green-300 font-semibold';
                      else if (selected)   style = 'border-red-600/60 bg-red-900/20 text-red-300';
                    } else if (selected)   style = 'border-[#A82030] bg-[#6B0F1A]/30 text-white';

                    return (
                      <button key={oi} disabled={quizChecked[qi] !== undefined}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: opt }))}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${style}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizChecked[qi] !== undefined && (
                  <p className={`text-xs mt-2 ${quizChecked[qi] ? 'text-green-400' : 'text-red-400'}`}>
                    {quizChecked[qi] ? '✅ Correct!' : `❌ Correct answer: ${q.correctAnswer}`}
                  </p>
                )}
              </div>
            ))}
          </div>
          {quizScore === null && (
            <button onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length < quiz.length || savingProgress}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl text-sm disabled:opacity-40 transition-all">
              {savingProgress ? 'Saving…' : 'Submit Quiz'}
            </button>
          )}
          {quizScore !== null && quizScore < 70 && (
            <button onClick={() => { setQuizAnswers({}); setQuizChecked({}); setQuizScore(null); }}
              className="mt-4 px-6 py-2.5 bg-white/5 border border-white/10 text-[#c5b4b8] rounded-xl text-sm hover:bg-white/10 transition-all">
              Try Again
            </button>
          )}
        </div>
      )}

      {course.files?.length === 0 && quiz.length === 0 && (
        <p className="text-sm text-[#c5b4b8]/50 italic">No content available for this course yet.</p>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─── */
function StudentDashboard({ loggedUser }) {
  const [myCourses,    setMyCourses]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('courses');
  const [expandedId,   setExpandedId]   = useState(null);

  // Tuition
  const [myRequests,   setMyRequests]   = useState([]);
  const [teacherOffers,setTeacherOffers]= useState([]);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqName,      setReqName]      = useState(loggedUser?.name || '');
  const [reqSubject,   setReqSubject]   = useState('');
  const [reqLevel,     setReqLevel]     = useState('Class 9-10');
  const [reqMessage,   setReqMessage]   = useState('');
  const [reqPhone,     setReqPhone]     = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const token = localStorage.getItem('token') || '';
  const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  const loadCourses = async () => {
    if (!loggedUser || loggedUser.role !== 'student' || !token) { setLoading(false); return; }
    try {
      const res  = await fetch(`${API}/myCourses`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setMyCourses(Array.isArray(data) ? data : []);
    } catch { toast.error('Could not load your courses.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCourses(); }, []);               // eslint-disable-line

  const fetchTuitionData = async () => {
    setTuitionLoading(true);
    try {
      const [rr, or] = await Promise.all([
        fetch(`${API}/tuition/my-requests`, { headers: authHeaders }),
        fetch(`${API}/tuition/offers`),
      ]);
      if (rr.ok) setMyRequests(await rr.json());
      if (or.ok) setTeacherOffers(await or.json());
    } catch { toast.error('Could not load tuition data.'); }
    finally { setTuitionLoading(false); }
  };

  useEffect(() => { if (activeTab === 'tuition') fetchTuitionData(); }, [activeTab]); // eslint-disable-line

  const handleSubmitRequest = async () => {
    if (!reqName || !reqSubject) { toast.error('Name and subject are required.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/tuition/request`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: reqName, subject: reqSubject, level: reqLevel, message: reqMessage, phone: reqPhone, email: loggedUser?.email }),
      });
      if (!res.ok) throw new Error();
      toast.success('Request submitted! ✅');
      setReqSubject(''); setReqMessage(''); setReqPhone(''); setShowRequestForm(false);
      fetchTuitionData();
    } catch { toast.error('Failed to submit request.'); }
    finally { setSubmitting(false); }
  };

  const downloadCertificate = (course) => {
    if (!course.certificate) { toast.error('Complete the quiz to unlock certificate.'); return; }
    const doc = new jsPDF('landscape');
    doc.setDrawColor(107, 15, 26); doc.setLineWidth(3);
    doc.rect(8, 8, 281, 194); doc.setLineWidth(1); doc.rect(14, 14, 269, 182);
    doc.setFont('Times', 'Bold'); doc.setFontSize(40); doc.setTextColor(107, 15, 26);
    doc.text('Certificate of Completion', 148, 55, { align: 'center' });
    doc.setFontSize(16); doc.setFont('Times', 'Normal'); doc.setTextColor(50, 50, 50);
    doc.text('This certifies that', 148, 80, { align: 'center' });
    doc.setFontSize(30); doc.setFont('Times', 'Bold'); doc.setTextColor(0, 0, 0);
    doc.text(loggedUser?.name || 'Student', 148, 105, { align: 'center' });
    doc.setFontSize(16); doc.setFont('Times', 'Normal'); doc.setTextColor(50, 50, 50);
    doc.text('has successfully completed the course', 148, 125, { align: 'center' });
    doc.setFontSize(22); doc.setFont('Times', 'Bold'); doc.setTextColor(107, 15, 26);
    doc.text(course.courseTitle, 148, 148, { align: 'center' });
    doc.setFontSize(12); doc.setFont('Times', 'Normal'); doc.setTextColor(100, 100, 100);
    doc.text(`Issued: ${new Date().toLocaleDateString()} | Dokkhify`, 148, 175, { align: 'center' });
    doc.save(`${course.courseTitle}-certificate.pdf`);
    toast.success('Certificate downloaded! 🏆');
  };

  const completed  = myCourses.filter(c => c.certificate).length;
  const inProgress = myCourses.filter(c => !c.certificate).length;

  const statusStyle = (s) =>
    s === 'accepted' ? 'text-green-400 bg-green-900/20 border-green-900/40' :
    s === 'declined' ? 'text-red-400 bg-red-900/20 border-red-900/40' :
    'text-yellow-400 bg-yellow-900/20 border-yellow-900/40';

  return (
    <div className="pt-16 min-h-screen bg-[#0f0a0b] px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-[#6B0F1A]/30">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-1">
            Student <span className="text-[#A82030]">Dashboard</span>
          </h1>
          <p className="text-[#c5b4b8]">Welcome back, {loggedUser?.name}!</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Enrolled',    value: myCourses.length,  icon: <BookOpen size={18} />,    color: 'text-blue-400'   },
              { label: 'Completed',   value: completed,          icon: <CheckCircle size={18} />, color: 'text-green-400'  },
              { label: 'In Progress', value: inProgress,         icon: <Clock size={18} />,       color: 'text-yellow-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="text-center">
                <div className={`flex justify-center ${color} mb-1`}>{icon}</div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-[#c5b4b8]">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['courses','My Courses'], ['tuition','🎓 Tuition']].map(([key, label]) => (
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

        {/* ══════════ COURSES TAB ══════════ */}
        {activeTab === 'courses' && (
          <>
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-8 h-8 border-2 border-[#A82030] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myCourses.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center py-24 text-center">
                <BookOpen size={64} className="text-[#6B0F1A]/40 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No courses yet</h2>
                <p className="text-[#c5b4b8] mb-8 max-w-sm">Explore our courses and enroll to start learning.</p>
                <Link to="/courses" className="px-6 py-3 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl">
                  Browse Courses
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course, i) => (
                  <motion.div key={course._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl overflow-hidden">

                    {/* card header */}
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {course.certificate ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-900/20 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                                <Award size={10} /> Completed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 uppercase bg-yellow-900/20 border border-yellow-900/30 px-2 py-0.5 rounded-full">
                                <Play size={10} /> In Progress
                              </span>
                            )}
                            <span className="text-[10px] text-[#c5b4b8]/50">
                              {(course.files?.length || 0)} file{course.files?.length !== 1 ? 's' : ''} ·{' '}
                              {(course.quiz?.length || 0)} quiz question{course.quiz?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">{course.courseTitle}</h3>
                          <p className="text-sm text-[#c5b4b8] mt-1 line-clamp-2">{course.courseDescription}</p>

                          {/* progress bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-[#c5b4b8] mb-1">
                              <span>Progress</span><span>{course.progress || 0}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#6B0F1A] to-[#A82030] rounded-full transition-all"
                                style={{ width: `${course.progress || 0}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {/* expand/collapse content */}
                          <button onClick={() => setExpandedId(expandedId === course._id ? null : course._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[#c5b4b8] rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                            {expandedId === course._id ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View Content</>}
                          </button>
                          {course.certificate && (
                            <button onClick={() => downloadCertificate(course)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white rounded-xl text-xs font-medium">
                              <Award size={14} /> Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* expandable course content */}
                    <AnimatePresence>
                      {expandedId === course._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-white/10">
                          <div className="px-6 pb-6">
                            <CourseContent
                              course={course}
                              loggedUser={loggedUser}
                              onCertificate={loadCourses}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════ TUITION TAB ══════════ */}
        {activeTab === 'tuition' && (
          <div className="space-y-8">

            {/* My Requests */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#A82030]" /> My Tuition Requests
                </h2>
                <button onClick={() => setShowRequestForm(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white rounded-xl text-sm font-medium">
                  <Plus size={16} /> New Request
                </button>
              </div>

              <AnimatePresence>
                {showRequestForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5">
                    <div className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-[#6B0F1A]/30 rounded-2xl p-6">
                      <h3 className="text-base font-bold text-white mb-4">Submit a Tuition Request</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[['Name *', reqName, setReqName, 'Your name'], ['Subject *', reqSubject, setReqSubject, 'e.g. Physics, Math…'],
                          ['Phone', reqPhone, setReqPhone, '01XXXXXXXXX']].map(([label, val, setter, ph]) => (
                          <div key={label}>
                            <label className="block text-xs text-[#c5b4b8] mb-1.5">{label}</label>
                            <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm" />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs text-[#c5b4b8] mb-1.5">Level</label>
                          <select value={reqLevel} onChange={e => setReqLevel(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#0f0a0b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6B0F1A] text-sm">
                            {['Class 9-10','Class 11-12','Admission','University','Professional'].map(l => <option key={l}>{l}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-[#c5b4b8] mb-1.5">Message</label>
                          <textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)} rows={2} placeholder="What do you need help with?"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/40 focus:outline-none focus:border-[#6B0F1A] text-sm resize-none" />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={handleSubmitRequest} disabled={submitting}
                          className="px-6 py-2.5 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                          {submitting ? 'Submitting…' : 'Submit Request'}
                        </button>
                        <button onClick={() => setShowRequestForm(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-[#c5b4b8] rounded-xl text-sm hover:bg-white/10 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {tuitionLoading ? (
                <div className="text-center py-10 text-[#c5b4b8]">Loading…</div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-10 text-[#c5b4b8]/60 bg-white/[0.02] border border-white/10 rounded-2xl">
                  No requests yet. Click "New Request" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map(req => (
                    <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusStyle(req.status)}`}>{req.status}</span>
                        <span className="text-xs text-[#c5b4b8]/50">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-base font-semibold text-white">{req.subject} <span className="text-[#c5b4b8] font-normal text-sm">· {req.level}</span></p>
                      {req.message && <p className="text-sm text-[#c5b4b8]/70 mt-1 italic">"{req.message}"</p>}
                      {req.status === 'accepted' && req.assignedTeacherName && (
                        <div className="mt-3 p-3 bg-green-900/10 border border-green-900/30 rounded-xl">
                          <p className="text-xs font-bold text-green-400">✅ Accepted by {req.assignedTeacherName}</p>
                          {req.teacherResponse && <p className="text-xs text-[#c5b4b8]/80 mt-1">"{req.teacherResponse}"</p>}
                        </div>
                      )}
                      {req.status === 'declined' && (
                        <div className="mt-3 p-3 bg-red-900/10 border border-red-900/30 rounded-xl">
                          <p className="text-xs font-bold text-red-400">❌ Declined</p>
                          {req.teacherResponse && <p className="text-xs text-[#c5b4b8]/80 mt-1">"{req.teacherResponse}"</p>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Offers */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#A82030]" /> Available Tutors
              </h2>
              {tuitionLoading ? (
                <div className="text-center py-10 text-[#c5b4b8]">Loading…</div>
              ) : teacherOffers.length === 0 ? (
                <div className="text-center py-10 text-[#c5b4b8]/60 bg-white/[0.02] border border-white/10 rounded-2xl">
                  No tutors available right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherOffers.map(offer => (
                    <motion.div key={offer._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl p-5 hover:border-[#6B0F1A]/40 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B0F1A] to-[#A82030] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {offer.teacherName?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm">{offer.teacherName}</p>
                          <p className="text-xs text-[#c5b4b8]">{offer.subject} · {offer.level}</p>
                        </div>
                        {offer.rate && (
                          <span className="text-xs text-[#F8C1B8] bg-[#6B0F1A]/20 border border-[#6B0F1A]/30 px-2 py-0.5 rounded-full">
                            {offer.rate}
                          </span>
                        )}
                      </div>
                      {offer.description && <p className="text-sm text-[#c5b4b8]/80 mb-3 line-clamp-2">{offer.description}</p>}
                      {offer.availability && <p className="text-xs text-[#c5b4b8]/60 mb-3">🕐 {offer.availability}</p>}
                      <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5">
                        {offer.contactPhone && (
                          <a href={`tel:${offer.contactPhone}`} className="flex items-center gap-2 text-xs text-[#c5b4b8] hover:text-white transition-colors">
                            <Phone size={13} className="text-[#A82030]" /> {offer.contactPhone}
                          </a>
                        )}
                        {offer.contactEmail && (
                          <a href={`mailto:${offer.contactEmail}`} className="flex items-center gap-2 text-xs text-[#c5b4b8] hover:text-white transition-colors">
                            <Mail size={13} className="text-[#A82030]" /> {offer.contactEmail}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentDashboard;
