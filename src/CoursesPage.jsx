import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API = '/api';

function CoursesPage({ loggedUser }) {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [purchasingId, setPurchasingId] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // =========================
  // FREE CHECK
  // =========================
  const isFreeCourse = (course) =>
    !course.price || Number(course.price) === 0;

  // =========================
  // LOAD COURSES
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // =========================
  // LOAD MY COURSES
  // =========================
  useEffect(() => {
    if (!loggedUser || !token) return;

    const load = async () => {
      try {
        const res = await fetch(`${API}/myCourses`, {
          headers: authHeaders
        });

        const data = await res.json();
        if (res.ok) setMyCourses(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load enrolled courses');
      }
    };

    load();
  }, [loggedUser, token, authHeaders]);

  const enrolled = (id) =>
    myCourses.some((m) =>
      String(m.courseId?._id || m.courseId) === String(id)
    );

  // =========================
  // FREE ENROLL
  // =========================
  const handleEnrollFree = async (course) => {
    setPurchasingId(course._id);

    try {
      const res = await fetch(`${API}/myCourses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ courseId: course._id })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || data.message || 'Enrollment failed');
        return;
      }

      // 200 = already enrolled, 201 = newly enrolled
      toast.success(res.status === 201 ? 'Enrolled successfully!' : 'Already enrolled!');
      navigate('/my-learning');

    } catch {
      toast.error('Server error');
    } finally {
      setPurchasingId('');
    }
  };

  // =========================
  // 🟢 FIXED PAYMENT HANDLER
  // =========================
  const handleBuyCourse = async (course) => {
    if (!loggedUser) {
      toast.error('Login required');
      return navigate('/login');
    }

    if (enrolled(course._id)) {
      toast.error('Already enrolled');
      return;
    }

    if (isFreeCourse(course)) {
      return handleEnrollFree(course);
    }

    setPurchasingId(course._id);

    try {
      const res = await fetch(`${API}/payment/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ courseId: course._id })
      });

      const data = await res.json();

      // =========================
      // ✅ SUCCESS CASE
      // =========================
      if (data?.gatewayUrl && typeof data.gatewayUrl === 'string') {
        window.location.href = data.gatewayUrl;
        return;
      }

      // =========================
      // ⚠️ ALREADY PENDING CASE
      // =========================
      if (data?.alreadyPending) {
        toast.error('Please complete your previous payment first.');
        return;
      }

      // =========================
      // ❌ SERVER ERROR CASE
      // =========================
      if (!res.ok) {
        toast.error(data?.message || 'Payment request failed');
        return;
      }

      // =========================
      // ❌ FALLBACK ERROR
      // =========================
      toast.error(data?.message || 'Payment gateway not available');

    } catch (err) {
      toast.error('Payment error');
    } finally {
      setPurchasingId('');
    }
  };

  // =========================
  // FILTER
  // =========================
  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'free'
        ? isFreeCourse(c)
        : !isFreeCourse(c));

    return matchSearch && matchFilter;
  });

  // =========================
  // UI
  // =========================
  return (
    <div className="pt-16 min-h-screen px-4 py-12 max-w-7xl mx-auto">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-bold text-white mb-2">
          Explore <span className="text-[#A82030]">Courses</span>
        </h1>
      </motion.div>

      <div className="flex gap-3 my-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 bg-white/5 text-white rounded-xl"
          placeholder="Search courses..."
        />

        {['all', 'free', 'paid'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl bg-[#6B0F1A] text-white"
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => {
          const isEnrolled = enrolled(course._id);

          return (
            <motion.div
              key={course._id}
              className="bg-[#1a0f12] border border-white/10 rounded-2xl p-6"
              whileHover={{ y: -5 }}
            >
              <h2 className="text-white font-bold">{course.title}</h2>

              <p className="text-gray-400 text-sm mt-1">
                {course.description}
              </p>

              <p className="text-[#A82030] mt-3 font-semibold">
                {isFreeCourse(course) ? 'FREE' : `৳${course.price}`}
              </p>

              {!isEnrolled ? (
                <button
                  onClick={() => handleBuyCourse(course)}
                  disabled={purchasingId === course._id}
                  className="w-full mt-4 bg-[#6B0F1A] text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {purchasingId === course._id
                    ? 'Processing...'
                    : isFreeCourse(course)
                    ? 'Enroll Free'
                    : 'Buy Course'}
                </button>
              ) : (
                <p className="text-green-400 mt-4 flex items-center gap-2">
                  <CheckCircle size={14} /> Enrolled
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default CoursesPage;