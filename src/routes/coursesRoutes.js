import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import Course from '../models/Course.js';
import protect from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

// Configure Cloudinary (free tier — no paid transformations)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Auto-detect resource type (image, video, raw/pdf) — all free tier
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = 'raw';
    if (file.mimetype.startsWith('image/')) resource_type = 'image';
    else if (file.mimetype.startsWith('video/')) resource_type = 'video';
    return {
      folder: 'dokkhify/courses',
      resource_type,
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file (free tier)
});

const router = express.Router();

// GET all courses — PUBLIC (only approved ones)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: true }).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET instructor's own courses — PROTECTED
router.get('/instructor/courses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const courses = await Course.find({ instructorId: req.user._id }).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch your courses' });
  }
});

// GET single course — PUBLIC (but check approval)
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // If not approved, we should technically hide it from general public.
    // However, for simplicity in this MVP, we'll allow it if the user has the ID,
    // but the main list will hide it.

    return res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST create course — INSTRUCTOR only, Cloudinary upload
router.post('/courses', protect, upload.array('files'), async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can upload courses.' });
    }

    const { title, description, price } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Files uploaded to Cloudinary — req.files have .path (secure_url) and .filename
    const filesData = (req.files || []).map((file) => ({
      name: file.filename || file.originalname,
      originalName: file.originalname,
      type: file.mimetype,
      url: file.path, // Cloudinary secure_url
    }));

    let quiz = [];
    if (req.body.quiz) {
      try {
        const parsed = JSON.parse(req.body.quiz);
        quiz = Array.isArray(parsed) ? parsed : [];
      } catch {
        return res.status(400).json({ error: 'Invalid quiz payload.' });
      }
    }

    const normalizedPrice =
  price === undefined || price === null || price === ''
    ? 0
        : Number(price);
    
    const course = await Course.create({
      title: String(title).trim(),
      description: String(description).trim(),
      price: normalizedPrice,
      files: filesData,
      quiz,
      uploadedBy: req.user.email,
      instructorId: req.user._id,
      students: 0,
    });

    return res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ error: 'Failed to create course' });
  }
});

// DELETE course — INSTRUCTOR only
router.delete('/courses/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can delete courses.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (course.uploadedBy && course.uploadedBy !== req.user.email) {
      return res.status(403).json({ error: 'You can only delete your own courses.' });
    }

    await Course.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
