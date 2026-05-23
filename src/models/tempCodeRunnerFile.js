import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tran_id: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
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
    },
    gatewayResponse: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);