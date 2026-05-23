import express from 'express';
import TuitionRequest from '../models/TuitionRequest.js';
import TuitionOffer from '../models/TuitionOffer.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// =============================================
// STUDENT TUITION REQUESTS
// =============================================

// PUBLIC or LOGGED-IN: Submit a tuition request
router.post('/request', async (req, res) => {
  try {
    const { studentName, subject, level, message, email, phone } = req.body;

    if (!studentName || !subject || !level) {
      return res.status(400).json({ error: 'Name, subject, and level are required.' });
    }

    let studentId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
        studentId = decoded.id;
      } catch {}
    }

    const request = new TuitionRequest({ studentId, studentName, subject, level, message, email, phone });
    await request.save();
    res.status(201).json({ message: 'Tuition request submitted successfully!' });
  } catch (err) {
    console.error('Error submitting tuition request:', err.message);
    res.status(500).json({ error: 'Failed to submit request.' });
  }
});

// STUDENT: Get own tuition requests (logged in)
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const requests = await TuitionRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your requests.' });
  }
});

// =============================================
// TEACHER (INSTRUCTOR) ENDPOINTS
// =============================================

// TEACHER: Get all tuition requests
router.get('/all-requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can view tuition requests.' });
    }
    const requests = await TuitionRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});

// TEACHER: Accept a tuition request
router.patch('/request/:id/accept', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can accept requests.' });
    }
    const { teacherResponse } = req.body;
    const request = await TuitionRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted', assignedTeacherId: req.user._id, assignedTeacherName: req.user.name, teacherResponse: teacherResponse || '' },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json({ message: 'Tuition request accepted!', request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept request.' });
  }
});

// TEACHER: Decline a tuition request
router.patch('/request/:id/decline', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can decline requests.' });
    }
    const { teacherResponse } = req.body;
    const request = await TuitionRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'declined', teacherResponse: teacherResponse || '' },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json({ message: 'Tuition request declined.', request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline request.' });
  }
});

// =============================================
// TEACHER TUITION OFFERS
// =============================================

// PUBLIC: Get all active teacher tuition offers
router.get('/offers', async (req, res) => {
  try {
    const offers = await TuitionOffer.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers.' });
  }
});

// TEACHER: Post a tuition offer
router.post('/offer', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can post tuition offers.' });
    }
    const { subject, level, description, rate, availability, contactEmail, contactPhone } = req.body;
    if (!subject || !level) return res.status(400).json({ error: 'Subject and level are required.' });

    const offer = new TuitionOffer({
      teacherId: req.user._id, teacherName: req.user.name, teacherEmail: req.user.email,
      subject, level, description, rate: rate || 'Negotiable', availability: availability || '',
      contactEmail: contactEmail || req.user.email, contactPhone: contactPhone || '',
    });
    await offer.save();
    res.status(201).json({ message: 'Tuition offer posted!', offer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post offer.' });
  }
});

// TEACHER: Get own offers
router.get('/my-offers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can view their offers.' });
    }
    const offers = await TuitionOffer.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your offers.' });
  }
});

// TEACHER: Delete own offer
router.delete('/offer/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can delete offers.' });
    }
    const offer = await TuitionOffer.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    await TuitionOffer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer.' });
  }
});

// TEACHER: Toggle offer active/inactive
router.patch('/offer/:id/toggle', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can update offers.' });
    }
    const offer = await TuitionOffer.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    offer.isActive = !offer.isActive;
    await offer.save();
    res.json({ message: `Offer ${offer.isActive ? 'activated' : 'deactivated'}.`, offer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer.' });
  }
});

export default router;
