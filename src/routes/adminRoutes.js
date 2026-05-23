import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ServiceRequest from '../models/ServiceRequest.js';

const router = express.Router();

// Middleware: Admin verification check
const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Admin Stats Endpoint
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalServiceRequests = await ServiceRequest.countDocuments();
    const pendingCourses = await Course.countDocuments({ isApproved: false });

    res.status(200).json({
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        totalServiceRequests,
        pendingCourses,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch platform stats.' });
  }
});

// Admin Pending Courses Endpoint
router.get('/pending-courses', isAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false }).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending courses.' });
  }
});

// Approve Course Endpoint
router.patch('/courses/:id/approve', isAdmin, async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByIdAndUpdate(courseId, { isApproved: true }, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.status(200).json({ message: 'Course approved successfully.', course });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve course.' });
  }
});

// Admin Service Requests Endpoint
router.get('/service-requests', isAdmin, async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service requests.' });
  }
});

// Delete any Course Endpoint (Admin only)
router.delete('/courses/:id', isAdmin, async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    // Cleanup related data
    await Enrollment.deleteMany({ courseId });
    res.status(200).json({ message: 'Course deleted successfully by admin.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

export default router;
