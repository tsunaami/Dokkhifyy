import express from 'express';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/orders', protect, async (req, res) => {
  return res.status(200).json({
    message: 'Authorized access to orders.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    orders: [],
  });
});

router.get('/cart', protect, async (req, res) => {
  return res.status(200).json({
    message: 'Authorized access to cart.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    cart: [],
  });
});

export default router;
