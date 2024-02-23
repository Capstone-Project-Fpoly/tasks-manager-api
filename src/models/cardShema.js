const mongoose = require("mongoose");

const ReminderEnum = {
  Unknown: "Unknown",
  OnDueDate: "OnDueDate",
  FiveMinutesBefore: "FiveMinutesBefore",
  TenMinutesBefore: "TenMinutesBefore",
  FifteenMinutesBefore: "FifteenMinutesBefore",
  OneHourBefore: "OneHourBefore",
  TwoHoursBefore: "TwoHoursBefore",
  OneDayBefore: "OneDayBefore",
  TwoDaysBefore: "TwoDaysBefore",
};

const cardSchema = new mongoose.Schema({
  boardId: { type: String, require: true },
  title: { type: String, require: true },
  description: String,
  users: [String],
  endDate: String,
  startedDate: String,
  reminder: {
    type: String,
    enum: Object.values(ReminderEnum),
    default: ReminderEnum.Unknown,
  },
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
