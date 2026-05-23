import express from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import MyCourse from '../models/MyCourse.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * =========================
 * NORMALIZERS (UNCHANGED)
 * =========================
 */
const normalizeFiles = (files = []) =>
  (Array.isArray(files) ? files : []).map((file) => ({
    name: file?.name || '',
    originalName: file?.originalName || file?.name || '',
    type: file?.type || '',
    url: file?.url || file?.content || '',
  }));

const normalizeQuiz = (quiz = []) =>
  (Array.isArray(quiz) ? quiz : []).map((item) => ({
    question: item?.question || '',
    options:
      Array.isArray(item?.options) && item.options.length > 0
        ? item.options.filter(Boolean)
        : [item?.a, item?.b].filter(Boolean),
    a: item?.a || item?.options?.[0] || '',
    b: item?.b || item?.options?.[1] || '',
    answer: item?.answer || '',
  }));

/**
 * =========================
 * FREE COURSE ENROLLMENT
 * =========================
 * Only allowed for free (price = 0) courses.
 * Paid courses must come through payment gateway.
 */
router.post('/myCourses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can enroll.' });
    }

    const { courseId } = req.body;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Valid courseId is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (!course.isApproved) return res.status(403).json({ error: 'Course is not yet approved.' });

    // Only allow free enrollment for free courses
    const isFree = !course.price || Number(course.price) === 0 || course.price === 'Free';
    if (!isFree) {
      return res.status(403).json({
        error: 'This is a paid course. Please purchase via payment.'
      });
    }

    // Prevent duplicate enrollment
    const existing = await MyCourse.findOne({
      courseId: course._id,
      studentId: req.user._id,
    });
    if (existing) {
      return res.status(200).json({ message: 'Already enrolled.', myCourse: existing });
    }

    const myCourse = await MyCourse.create({
      courseId: course._id,
      courseTitle: course.title,
      courseDescription: course.description || '',
      files: course.files || [],
      quiz: course.quiz || [],
      price: 0,
      studentId: req.user._id,
      studentName: req.user.name,
      paymentId: null,
      progress: 0,
      completed: false,
      certificate: false,
    });

    await Course.findByIdAndUpdate(course._id, { $inc: { students: 1 } });

    return res.status(201).json({ message: 'Enrolled successfully!', myCourse });

  } catch (error) {
    console.error('Free enrollment error:', error);
    return res.status(500).json({ error: 'Failed to enroll.' });
  }
});

/**
 * =========================
 * GET MY COURSES (KEEP)
 * =========================
 */
router.get('/myCourses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        error: 'Only students can view enrolled courses.'
      });
    }

    const myCourses = await MyCourse.find({
      studentId: req.user._id
    }).sort({ createdAt: -1 });

    return res.json(myCourses);

  } catch (error) {
    console.error('Get myCourses error:', error);
    return res.status(500).json({
      error: 'Failed to fetch enrolled courses.'
    });
  }
});

/**
 * =========================
 * UPDATE PROGRESS (KEEP)
 * =========================
 */
router.put('/myCourses/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        error: 'Only students can update course progress.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid myCourse ID.'
      });
    }

    const myCourse = await MyCourse.findOne({
      _id: req.params.id,
      studentId: req.user._id
    });

    if (!myCourse) {
      return res.status(404).json({
        error: 'Enrolled course not found.'
      });
    }

    const nextProgress = Number(req.body.progress);

    myCourse.progress = Number.isFinite(nextProgress)
      ? Math.min(100, Math.max(0, nextProgress))
      : myCourse.progress;

    myCourse.completed =
      typeof req.body.completed === 'boolean'
        ? req.body.completed
        : myCourse.completed;

    myCourse.certificate =
      typeof req.body.certificate === 'boolean'
        ? req.body.certificate
        : myCourse.completed
        ? true
        : myCourse.certificate;

    if (myCourse.completed) myCourse.completedAt = new Date();
    if (myCourse.certificate) myCourse.certificateUpdatedAt = new Date();

    await myCourse.save();

    return res.json({
      message: 'Progress updated.',
      myCourse
    });

  } catch (error) {
    console.error('Update myCourse error:', error);
    return res.status(500).json({
      error: 'Failed to update course progress.'
    });
  }
});

export default router;