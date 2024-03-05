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

const sendNotificationForInviteUser = async (idBoard, creater, users) => {
  try {
    const board = await BoardModel.findOne({ _id: idBoard });
    const deviceIds = await getDeviceIds(users);
    await createNotificationForInviteUser(
      creater,
      `Bạn đã được mời vào bảng ${board.title}`,
      idBoard,
      "InviteUserToBoard",
      users
    );
    send(deviceIds, `Bạn đã được mời vào bảng "${board.title}"`);
  } catch (err) {
    console.log(err);
  }
};

class UserMutations {
  static getUsersInviteToBoard = async (args, context) => {
    const user = await auth(context.token);
    const boardId = args.idBoard;
    const query = args.query;
    const board = await BoardModel.findById(boardId);
    if (!board) throw new Error("Không tìm thấy bảng này");

    const users = await UserModel.find({
      $and: [
        { uid: { $nin: board.users } },
        { uid: { $nin: board.inviteUsers } },
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

  static inviteUsersToBoard = async (args, context) => {
    const user = await auth(context.token);
    const boardId = args.idBoard;
    const users = args.idUsers;
    const board = await BoardModel.findById(boardId);
    if (!board) throw new Error("Không tìm thấy bảng này");
    const newUsers = users.filter((id) => !board.users.includes(id));
    if (newUsers.length === 0) throw new Error("Người dùng đã có trong bảng");
    const inviteUsers = !board.inviteUsers ? [] : board.inviteUsers;
    const newInviteUsers = newUsers.filter((id) => !inviteUsers.includes(id));
    if (newInviteUsers.length === 0)
      throw new Error("Người dùng đã được mời vào bảng");
    board.inviteUsers.push(...users);
    board.save().catch((err) => {
      throw new Error(err);
    });
    sendNotificationForInviteUser(boardId, user.uid, users);
    return true;
  };

  static acceptInviteToBoard = async (args, context) => {
    const user = await auth(context.token);
    const boardId = args.idBoard;
    const idNotification = args.idNotification;
    const board = await BoardModel.findById(boardId);
    if (!board) throw new Error("Không tìm thấy bảng này");
    if (!board.inviteUsers)
      throw new Error("Bạn không có lời mời vào bảng này");
    if (!board.inviteUsers.includes(user.uid))
      throw new Error("Bạn không có lời mời vào bảng này");
    if (board.users.includes(user.uid))
      throw new Error("Bạn đã có trong bảng này");
    board.inviteUsers = board.inviteUsers.filter((id) => id !== user.uid);
    board.users.push(user.uid);
    await board
      .save()
      .catch((err) => {
        throw new Error(err);
      })
      .then(() => {
        NotificationModel.findByIdAndDelete(idNotification).catch((err) => {
          throw new Error(err);
        });
      });
    sendNotification(
      board._id,
      user.uid,
      `Người dùng "${user.fullName}" đã tham gia vào bảng "${board.title}"`,
      board._id,
      "Board"
    );
    return true;
  };
}

module.exports = UserMutations;
