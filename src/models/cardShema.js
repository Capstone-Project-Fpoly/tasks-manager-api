const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  list: String,
  title: String,
  description: String,
  users: [String],
  endDate: String,
  startedDate: { type: String, required: true },
  reminder: String, // Enum values are saved as strings in MongoDB
  comments: [String],
  checkLists: [String],
  createdAt: { type: String, required: true },
  createdBy: { type: String, require: true },
  status: {
    type: String,
    enum: ["Active", "Archived", "Deleted"],
    default: "Active",
  },
  updatedAt: { type: String, required: true },
});

const CardModel = mongoose.model("cards", cardSchema);

module.exports = CardModel;
