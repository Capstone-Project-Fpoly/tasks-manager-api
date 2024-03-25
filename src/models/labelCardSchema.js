const mongoose = require("mongoose");

const labelCardSchema = new mongoose.Schema({
  color: String,
  title: String,
  board: String,
});

const LabelCardModel = mongoose.model("labels", labelCardSchema);
module.exports = LabelCardModel;
