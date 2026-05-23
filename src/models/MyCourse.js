import mongoose from 'mongoose';

const myCourseFileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    originalName: { type: String, trim: true },
    type: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const myCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },

    courseDescription: {
      type: String,
      default: '',
      trim: true,
    },

    files: {
      type: [myCourseFileSchema],
      default: [],
    },

    quiz: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // 🔥 FIXED: numeric only for analytics
    price: {
      type: Number,
      default: 0,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    studentName: {
      type: String,
      trim: true,
      default: '',
    },

    // 🔥 NEW: link to payment
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    certificate: {
      type: Boolean,
      default: false,
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    certificateUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// prevent duplicate enrollment
myCourseSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('MyCourse', myCourseSchema);