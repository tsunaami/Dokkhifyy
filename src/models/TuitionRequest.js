import mongoose from 'mongoose';

// Student submits a tuition request (wants tuition)
const tuitionRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    subject: { type: String, required: true },
    level: { type: String, required: true },
    message: { type: String },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    assignedTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedTeacherName: { type: String, default: '' },
    teacherResponse: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('TuitionRequest', tuitionRequestSchema);
