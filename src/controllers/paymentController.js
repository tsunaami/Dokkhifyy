import { initPayment, validatePayment } from "../services/sslcommerzService.js";
import { v4 as uuidv4 } from "uuid";

import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import MyCourse from "../models/MyCourse.js";
import User from "../models/User.js";

/**
 * =========================
 * CREATE PAYMENT (BEST FIXED VERSION)
 * =========================
 */
export const createPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id;

    if (!courseId || !userId) {
      return res.status(400).json({ message: "Course ID and user required" });
    }

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    /**
     * 🟢 BEST PRACTICE FIX:
     * Only block PENDING payments if they are recent (10 min window)
     */
    const existingPending = await Payment.findOne({
      studentId: user._id,
      courseId: course._id,
      status: "PENDING",
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (existingPending) {
      return res.status(200).json({
        message: "You already have a recent pending payment. Please complete it.",
        gatewayUrl: null,
        alreadyPending: true,
      });
    }

    const tran_id = uuidv4();

    await Payment.create({
      tran_id,
      courseId: course._id,
      studentId: user._id,
      amount: course.price,
      status: "PENDING",
    });

    const paymentData = {
      total_amount: Number(course.price),
      tran_id,

      success_url: `${process.env.BACKEND_URL}/api/payment/success`,
      fail_url: `${process.env.BACKEND_URL}/api/payment/fail`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel`,

      cus_name: user.name,
      cus_email: user.email,
      cus_phone: user.phone || "0000000000",

      product_name: course.title,
    };

    let result;

try {
  result = await initPayment(paymentData);
} catch (err) {
  console.error("INIT PAYMENT FAILED:", err.message);
  return res.status(500).json({
    message: "Payment initialization failed",
  });
}

    console.log("SSL INIT RESPONSE:", result);

    const gatewayUrl = result?.GatewayPageURL || result?.gatewayPageURL;

    if (!gatewayUrl) {
      console.error("❌ Missing Gateway URL:", result);
      return res.status(500).json({
        message: "Payment gateway not found",
        debug: result,
      });
    }

    return res.json({ gatewayUrl });

  } catch (error) {
    console.error("Payment Init Error:", error);
    return res.status(500).json({ message: "Payment init failed" });
  }
};

/**
 * =========================
 * PAYMENT SUCCESS (SAFE VERSION)
 * =========================
 */
export const paymentSuccess = async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;
    const val_id = req.body.val_id || req.query.val_id;

    if (!tran_id || !val_id) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    const payment = await Payment.findOne({ tran_id });

    if (!payment) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    /**
     * 🟢 PREVENT DOUBLE CALLBACK DAMAGE
     */
    if (payment.status === "SUCCESS") {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    }

    const validation = await validatePayment(val_id);

    if (!validation || validation.status !== "VALID") {
      payment.status = "FAILED";
      await payment.save();
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    payment.status = "SUCCESS";
    payment.gatewayResponse = validation;
    await payment.save();

    const existing = await MyCourse.findOne({
      courseId: payment.courseId,
      studentId: payment.studentId,
    });

    if (!existing) {
      const course = await Course.findById(payment.courseId);
      const user = await User.findById(payment.studentId);

      if (course && user) {
        await MyCourse.create({
          courseId: course._id,
          courseTitle: course.title,
          courseDescription: course.description || "",
          files: course.files || [],
          quiz: course.quiz || [],
          price: course.price,
          studentId: user._id,
          studentName: user.name,
          paymentId: payment._id,
          progress: 0,
          completed: false,
          certificate: false,
        });

        await Course.findByIdAndUpdate(course._id, {
          $inc: { students: 1 },
        });
      }
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);

  } catch (error) {
    console.error("Payment Success Error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};

/**
 * =========================
 * PAYMENT FAIL
 * =========================
 */
export const paymentFail = async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;

    if (tran_id) {
      await Payment.findOneAndUpdate(
        { tran_id },
        {
          status: "FAILED",
          gatewayResponse: req.body,
        }
      );
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  } catch (error) {
    console.error("Payment Fail Error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};

/**
 * =========================
 * PAYMENT CANCEL
 * =========================
 */
export const paymentCancel = async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;

    if (tran_id) {
      await Payment.findOneAndUpdate(
        { tran_id },
        {
          status: "CANCELLED",
          gatewayResponse: req.body,
        }
      );
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled`);
  } catch (error) {
    console.error("Payment Cancel Error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled`);
  }
};