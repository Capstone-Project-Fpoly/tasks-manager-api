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
  boardId: { type: String },
  title: { type: String },
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
  createdAt: { type: String },
  createdBy: { type: String },
  status: {
    type: String,
    enum: ["Active", "Archived", "Deleted"],
    default: "Active",
  },
  updatedAt: { type: String },
});

const CardModel = mongoose.model("cards", cardSchema);

module.exports = CardModel;
