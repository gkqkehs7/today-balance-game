import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  optionA:  { type: String, required: true },
  optionB:  { type: String, required: true },
  tag:      { type: String, default: '일상' },
  date:     { type: String, required: true },
  isAI:     { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now },
});

export default mongoose.models.Question ?? mongoose.model('Question', QuestionSchema);
