import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  parentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  choice:     { type: String, enum: ['A', 'B'], required: true },
  text:       { type: String, required: true, maxlength: 100 },
  likes:      { type: Number, default: 0 },
  dislikes:   { type: Number, default: 0 },
  createdAt:  { type: Date, default: Date.now },
});

export default mongoose.models.Comment ?? mongoose.model('Comment', CommentSchema);
