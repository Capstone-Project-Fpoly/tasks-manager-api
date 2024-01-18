const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  id: { type: String, required: true },
  board: String,
  label: { type: String, required: true },
  createdAt: { type: String, required: true },
  cards: [String],
  createdBy: { type: String, require: true },
});

const ListModel = mongoose.model("lists", listSchema);
module.exports = ListModel;
