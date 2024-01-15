const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type:String, required: true },
    card: { type:String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: String, required: true }
});

const CommentModel = mongoose.model('comments', commentSchema);

module.exports = CommentModel;
