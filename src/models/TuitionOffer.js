import mongoose from 'mongoose';

// Teacher posts a tuition offer ("I want to teach this")
const tuitionOfferSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: { type: String, required: true, trim: true },
    teacherEmail: { type: String, trim: true, lowercase: true },
    subject: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String },
    rate: { type: String, default: 'Negotiable' }, // e.g. "500 BDT/hr"
    availability: { type: String, default: '' }, // e.g. "Weekends, Evenings"
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('TuitionOffer', tuitionOfferSchema);
