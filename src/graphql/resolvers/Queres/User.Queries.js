const { get } = require("mongoose");
const sendNotification = require("../Service/sendNotification");
const auth = require("../authorization");
const UserModel = require("../../../models/userSchema");
const {
  createNotificationForInviteUser,
  getDeviceIds,
  send,
} = require("../Service/notification");
const BoardModel = require("../../../models/boardSchema");
const NotificationModel = require("../../../models/notificationSchema");

class UserQueries {
  static getUsersOfBoard = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const query = args.query;
    const board = await BoardModel.findById(idBoard);
    if (!board) throw new Error("Không tìm thấy bảng này");
    if (!query) {
      const users = await UserModel.find({ uid: { $in: board.users } });
      return users;
    }
    const users = await UserModel.find({
      $and: [
        { uid: { $in: board.users } },
        {
          $or: [
            { email: { $regex: query, $options: "i" } },
            { fullName: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).limit(5);
    return users;
  };
}

module.exports = UserQueries;
