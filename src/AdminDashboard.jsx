import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, GraduationCap, BarChart3, 
  Mail, Trash2, CheckCircle, Clock, 
  Filter, Search, ArrowUpRight, TrendingUp,
  ShieldCheck, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = '/api/admin';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | requests | courses | approvals
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token') || '';
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Load stats
      const statsRes = await fetch(`${API}/stats`, { headers: authHeaders });
      if (!statsRes.ok) throw new Error(`Stats: ${statsRes.status}`);
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // Load requests
      const reqRes = await fetch(`${API}/service-requests`, { headers: authHeaders });
      if (!reqRes.ok) throw new Error(`Requests: ${reqRes.status}`);
      const reqData = await reqRes.json();
      setRequests(reqData);

      // Load all approved courses
      const coursesRes = await fetch('/api/courses');
      if (!coursesRes.ok) throw new Error(`Courses: ${coursesRes.status}`);
      const coursesData = await coursesRes.json();
      setAllCourses(coursesData);

      // Load pending courses
      const pendingRes = await fetch(`${API}/pending-courses`, { headers: authHeaders });
      if (!pendingRes.ok) throw new Error(`Pending: ${pendingRes.status}`);
      const pendingData = await pendingRes.json();
      setPendingCourses(pendingData);

    } catch (err) {
      console.error('Admin Load Error:', err.message);
      toast.error('Failed to load admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authHeaders]);

  const approveCourse = async (id) => {
    try {
      const res = await fetch(`${API}/courses/${id}/approve`, { method: 'PATCH', headers: authHeaders });
      if (res.ok) {
        toast.success('Course approved and published!');
        fetchData();
      } else { throw new Error(); }
    } catch {
      toast.error('Failed to approve course.');
    }
  };

  const deleteCourse = async (id, isFromApprovals = false) => {
    const msg = isFromApprovals 
      ? 'Reject and delete this course request?' 
      : 'Are you sure you want to PERMANENTLY delete this course as an administrator?';
    if (!window.confirm(msg)) return;
    
    try {
      const res = await fetch(`${API}/courses/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        toast.success(isFromApprovals ? 'Course application rejected.' : 'Course removed.');
        fetchData();
      } else { throw new Error(); }
    } catch {
      toast.error('Deletion failed.');
    }
  };

  const filteredCourses = allCourses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-20 min-h-screen bg-[#0b0809] text-white px-4 md:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-['Poppins'] text-white">
                Admin <span className="text-[#A82030]">Console</span>
              </h1>
              <p className="text-[#c5b4b8] text-sm mt-1">Platform overview and content moderation.</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start overflow-x-auto max-w-full">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
                { id: 'approvals', label: 'Approvals', icon: <ShieldCheck size={16} />, badge: stats?.pendingCourses },
                { id: 'requests', label: 'Service Requests', icon: <Mail size={16} /> },
                { id: 'courses', label: 'Manage Courses', icon: <BookOpen size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative ${
                    activeTab === tab.id 
                    ? 'bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white shadow-lg' 
                    : 'text-[#c5b4b8] hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A82030] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#A82030] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    { label: 'Total Students', value: stats?.totalStudents, icon: <Users />, color: 'text-blue-400' },
                    { label: 'Courses Published', value: stats?.totalCourses, icon: <BookOpen />, color: 'text-emerald-400' },
                    { label: 'Pending Approvals', value: stats?.pendingCourses, icon: <ShieldCheck />, color: 'text-amber-400' },
                    { label: 'Enrollments', value: stats?.totalEnrollments, icon: <TrendingUp />, color: 'text-purple-400' }
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-[#A82030]/40 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <ArrowUpRight size={18} className="text-[#c5b4b8]/50 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-1">{stat.value || 0}</h3>
                      <p className="text-[#c5b4b8] text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <ShieldCheck size={20} className="text-[#A82030]" /> Recent Course Uploads
                    </h2>
                    <div className="space-y-4">
                      {pendingCourses.length === 0 ? (
                        <p className="text-sm text-[#c5b4b8]/50 text-center py-10 italic">No pending course applications.</p>
                      ) : (
                        pendingCourses.slice(0, 4).map((course, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-[#A82030]/20 flex items-center justify-center text-[#F8C1B8] font-bold">
                              <BookOpen size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white mb-0.5">{course.title}</p>
                              <p className="text-xs text-[#c5b4b8]">By {course.uploadedBy}</p>
                            </div>
                            <button 
                              onClick={() => setActiveTab('approvals')}
                              className="text-xs text-[#F8C1B8] bg-[#A82030]/20 px-3 py-1.5 rounded-lg hover:bg-[#A82030]/40 transition-all"
                            >
                              Review
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <Mail size={20} className="text-[#A82030]" /> Recent Service Inquiries
                    </h2>
                    <div className="space-y-4">
                      {requests.slice(0, 4).map((req, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                          <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 font-bold">
                            {req.studentName[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{req.studentName}</p>
                            <p className="text-xs text-[#c5b4b8]">Interested in {req.subject}</p>
                          </div>
                          <span className="text-[10px] text-[#c5b4b8]/50">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'approvals' && (
              <motion.div
                key="approvals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold px-2">Approval Queue</h2>
                  <span className="text-sm text-[#c5b4b8]">{pendingCourses.length} pending applications</span>
                </div>

                {pendingCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                    <ShieldCheck size={64} className="text-[#c5b4b8]/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-1">Queue Clear</h3>
                    <p className="text-[#c5b4b8] text-sm">All course applications have been reviewed.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingCourses.map(course => (
                      <motion.div 
                        key={course._id}
                        layout
                        className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center gap-6 group hover:border-[#A82030]/40 transition-all"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B0F1A] to-[#A82030] flex items-center justify-center text-white md:shrink-0">
                          <BookOpen size={32} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white truncate">{course.title}</h3>
                            <span className="px-2 py-0.5 rounded-lg bg-yellow-900/30 text-yellow-500 text-[10px] font-bold uppercase">Pending</span>
                          </div>
                          <p className="text-sm text-[#c5b4b8] line-clamp-1 mb-2">{course.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-[#c5b4b8]/60">
                            <span className="flex items-center gap-1"><Users size={12} /> Instructor: {course.uploadedBy}</span>
                            <span className="flex items-center gap-1"><BarChart3 size={12} /> Price: {course.price}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> Uploaded: {new Date(course.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => approveCourse(course._id)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#A82030] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#A82030]/20 hover:scale-105 active:scale-95 transition-all"
                          >
                            <CheckCircle size={16} /> Approve & Publish
                          </button>
                          <button 
                            onClick={() => deleteCourse(course._id, true)}
                            className="p-3 bg-white/5 text-red-500 rounded-xl hover:bg-red-500/10 transition-all"
                            title="Reject/Delete"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Service Inquiries</h2>
                    <span className="px-3 py-1 bg-blue-900/20 text-blue-400 rounded-full text-xs font-bold">
                      {requests.length} Total Requests
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 text-[#c5b4b8] text-[10px] uppercase tracking-widest font-bold">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Subject & Level</th>
                          <th className="px-6 py-4">Message</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {requests.map((req) => (
                          <tr key={req._id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-white">{req.studentName}</p>
                              <p className="text-xs text-[#c5b4b8]">{req.email || "No email"}</p>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-sm text-white font-medium">{req.subject}</p>
                              <p className="text-xs text-[#c5b4b8]">{req.level}</p>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-xs text-[#c5b4b8] max-w-xs line-clamp-1">{req.message || "---"}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                req.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'
                              }`}>
                                {req.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right text-xs text-[#c5b4b8]">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5b4b8]" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search courses or instructors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#A82030] transition-all"
                    />
                  </div>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-medium">
                    <Filter size={18} /> Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <motion.div 
                      layout
                      key={course._id}
                      className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#A82030]/60 transition-all group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            course.price === 'Free' ? 'bg-green-900/40 text-green-400' : 'bg-[#A82030]/20 text-[#F8C1B8]'
                          }`}>
                            {course.price === 'Free' ? "FREE" : `৳${course.price}`}
                          </span>
                          <button 
                            onClick={() => deleteCourse(course._id)}
                            className="p-2 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h4 className="text-lg font-bold mb-2 line-clamp-1">{course.title}</h4>
                        <p className="text-sm text-[#c5b4b8] mb-4 flex items-center gap-2">
                           <GraduationCap size={14} /> By {course.uploadedBy}
                        </p>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1 text-[#c5b4b8]">
                            <Users size={12} /> {course.students || 0} Students
                          </span>
                          <span className="flex items-center gap-1 text-[#c5b4b8]">
                            <BookOpen size={12} /> {course.files?.length || 0} Files
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
