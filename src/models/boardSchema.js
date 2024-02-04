const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  ownerUser: { type: String, required: true },
  color: String,
  title: String,
  isPublic: { type: Boolean, required: true },
  lists: [String],
  users: [String],
  status: {
    type: String,
    enum: ["Active", "Archived", "Deleted"],
    default: "Active",
  },
  updatedAt: { type: String, required: true },
  createdAt: { type: String, required: true },
});

const BoardModel = mongoose.model("boards", boardSchema);
module.exports = BoardModel;
