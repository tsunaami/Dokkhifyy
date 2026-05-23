import mongoose from 'mongoose';

const courseFileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    originalName: { type: String, trim: true },
    type: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },

    a: { type: String, default: '' },
    b: { type: String, default: '' },

    answer: {
      type: String,
      default: '',
    },

    correctAnswer: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🔥 FIXED: always numeric or 0
    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    files: {
      type: [courseFileSchema],
      default: [],
    },

    quiz: {
      type: [quizQuestionSchema],
      default: [],
    },

    // 🔥 FIXED: single source of truth
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    students: {
      type: Number,
      default: 0,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    // instructor email (for legacy compatibility)
    uploadedBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);