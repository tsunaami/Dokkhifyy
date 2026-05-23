import express from 'express';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// POST - Create enrollment
router.post('/enrollments', async (req, res) => {
  try {
    const { courseTitle, studentEmail } = req.body;

    if (!courseTitle || !studentEmail) {
      return res.status(400).json({
        error: 'courseTitle and studentEmail are required',
      });
    }

    const normalizedEmail = studentEmail.trim().toLowerCase();
    const normalizedCourseTitle = courseTitle.trim();

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({
      courseTitle: normalizedCourseTitle,
      studentEmail: normalizedEmail,
    });

    if (enrollment) {
      return res.status(200).json({
        message: 'Already enrolled',
        enrollment,
      });
    }

    // Create new enrollment
    enrollment = new Enrollment({
      courseTitle: normalizedCourseTitle,
      studentEmail: normalizedEmail,
      certificate: false,
    });

    await enrollment.save();
    return res.status(201).json({
      message: 'Enrollment successful',
      enrollment,
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    return res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

// GET - Get enrollments by email
router.get('/enrollments', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'email query parameter is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const enrollments = await Enrollment.find({
      studentEmail: normalizedEmail,
    });

    return res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    return res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// PATCH - Update certificate status
router.patch('/enrollments/certificate', async (req, res) => {
  try {
    const { courseTitle, studentEmail } = req.body;

    if (!courseTitle || !studentEmail) {
      return res.status(400).json({
        error: 'courseTitle and studentEmail are required',
      });
    }

    const normalizedEmail = studentEmail.trim().toLowerCase();
    const normalizedCourseTitle = courseTitle.trim();

    const enrollment = await Enrollment.findOneAndUpdate(
      {
        courseTitle: normalizedCourseTitle,
        studentEmail: normalizedEmail,
      },
      {
        certificate: true,
        certificateUpdatedAt: new Date(),
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    return res.json({ message: 'Certificate updated successfully' });
  } catch (error) {
    console.error('Update certificate error:', error);
    return res.status(500).json({ error: 'Failed to update certificate' });
  }
});

export default router;
