import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    page: { type: String, required: true },
    timeSpent: { type: Number, default: 0 }, // seconds
    isEntry: { type: Boolean, default: false }, // first page of session
    isExit: { type: Boolean, default: false },  // last page before leaving
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Composite index for fast aggregation
PageViewSchema.index({ page: 1, createdAt: -1 });
PageViewSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.PageView || mongoose.model('PageView', PageViewSchema);
