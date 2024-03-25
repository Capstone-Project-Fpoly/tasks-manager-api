const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  board: { type: String },
  label: { type: String },
  status: {
    type: String,
    enum: ["Active", "Archived", "Deleted"],
    default: "Active",
  },
  updatedAt: { type: String },
  createdAt: { type: String },
  cards: [String],
  createdBy: { type: String },
});

const ListModel = mongoose.model("lists", listSchema);
module.exports = ListModel;
