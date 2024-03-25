const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: String },
  card: { type: String },
  comment: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

const CommentModel = mongoose.model("comments", commentSchema);

module.exports = CommentModel;
