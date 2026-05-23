import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    level: {
      type: String,
      required: [true, 'Academic level is required'],
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'contacted', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;
