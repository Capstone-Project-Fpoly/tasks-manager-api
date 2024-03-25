const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  ownerUser: { type: String },
  color: String,
  title: String,
  isPublic: { type: Boolean },
  lists: [String],
  users: [String],
  status: {
    type: String,
    enum: ["Active", "Archived", "Deleted"],
    default: "Active",
  },
  inviteUsers: [String],
  updatedAt: { type: String },
  createdAt: { type: String },
});

const BoardModel = mongoose.model("boards", boardSchema);
module.exports = BoardModel;
