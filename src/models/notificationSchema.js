const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  idBoard: { type: String, require: true },
  data: { type: String, require: true },
  content: { type: String, require: true },
  creater: { type: String, require: true },
  topic: {
    type: String,
    enum: [
      "Board",
      "List",
      "Card",
      "CheckList",
      "Comment",
      "InviteUserToBoard",
    ],
  },
  users: { type: [String], require: true },
  seenListUser: { type: [String], require: true },
  updatedAt: { type: String, required: true },
  createdAt: { type: String, required: true },
});

const NotificationModel = mongoose.model("notifications", notificationSchema);
module.exports = NotificationModel;
