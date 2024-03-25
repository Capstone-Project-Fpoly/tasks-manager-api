const mongoose = require("mongoose");

const checkListSchema = new mongoose.Schema({
  card: { type: String },
  content: { type: String },
  isChecked: { type: Boolean },
});

const CheckListModel = mongoose.model("checkLists", checkListSchema);

module.exports = CheckListModel;
