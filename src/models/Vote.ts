import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  ip:         { type: String, required: true },
  choice:     { type: String, enum: ['A', 'B'], required: true },
  createdAt:  { type: Date, default: Date.now },
});

VoteSchema.index({ questionId: 1, ip: 1 }, { unique: true });

export default mongoose.models.Vote ?? mongoose.model('Vote', VoteSchema);
