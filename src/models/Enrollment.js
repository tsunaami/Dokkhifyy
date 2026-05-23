import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    studentEmail: {
      type: String,
      required: [true, 'Student email is required'],
      trim: true,
      lowercase: true,
    },
    certificate: {
      type: Boolean,
      default: false,
    },
    certificateUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique enrollments
enrollmentSchema.index({ courseTitle: 1, studentEmail: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
