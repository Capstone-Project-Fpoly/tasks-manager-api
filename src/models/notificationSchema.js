const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  idBoard: { type: String },
  data: { type: String },
  content: { type: String },
  creator: { type: String },
  topic: {
    type: String,
    enum: [
      "Board",
      "List",
      "Card",
      "CheckList",
      "Comment",
      "InviteUserToBoard",
      "RemoveUserFromBoard",
    ],
  },
  users: { type: [String] },
  seenListUser: { type: [String] },
  updatedAt: { type: String },
  createdAt: { type: String },
});

const NotificationModel = mongoose.model("notifications", notificationSchema);
module.exports = NotificationModel;
