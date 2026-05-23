import express from "express";
import { createPayment, paymentSuccess, paymentFail, paymentCancel } from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // ✅ ADD THIS

const router = express.Router();

// ✅ PROTECTED ROUTE
router.post("/init", authMiddleware, createPayment);

// SSL ROUTES
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);

export default router;