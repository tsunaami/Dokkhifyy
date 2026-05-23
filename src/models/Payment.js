import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tran_id: {
      type: String,
      required: true,
      unique: true,
    },

    val_id: {
      type: String,
      default: null,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    gatewayResponse: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

/**
 * 🟢 STEP 8 — DATABASE CLEAN RULE (CRITICAL FIX)
 * Prevent duplicate PENDING payments per student-course pair
 */
paymentSchema.index(
  { studentId: 1, courseId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "PENDING",
    },
  }
);

export default mongoose.model("Payment", paymentSchema);