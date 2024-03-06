const { get } = require("mongoose");
const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const ListModel = require("../../../models/listSchema");
const NotificationModel = require("../../../models/notificationSchema");
const sendNotification = require("../Service/sendNotification");
const auth = require("../authorization");

const getAllNotifications = async (uid) => {
  const notifications = await NotificationModel.find({ users: uid }).sort({
    createdAt: -1,
  });
  return notifications;
};
const getNotificationsOfBoard = async (idBoard) => {
  const notifications = await NotificationModel.find({
    idBoard: idBoard,
    topic: { $ne: "InviteUserToBoard" },
  }).sort({
    createdAt: -1,
  });
  return notifications;
};

const formattedNotification = async (uid, notifications) => {
  const listFormatted = await Promise.all(
    notifications.map(async (notification) => {
      return {
        id: notification._id,
        createdAt: notification.createdAt,
        is_seen: notification.seenListUser.includes(uid),
        creator: notification.creator,
        title: "Thông báo",
        content: notification.content,
        topic: notification.topic,
        data: notification.data,
      };
    })
  );
  return listFormatted;
};

class NotificationMutations {
  static getNotifications = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    // nếu idBoard không có thì trả về tất cả thông báo liên quan đến user đó
    // nếu có thì trả về thông báo liên quan đến bảng đó
    if (!idBoard) {
      const notificationsModel = await getAllNotifications(user.uid);
      const notifications = await formattedNotification(
        user.uid,
        notificationsModel
      );
      return notifications;
    }
    const notificationsModel = await getNotificationsOfBoard(idBoard);
    const notifications = await formattedNotification(
      user.uid,
      notificationsModel
    );
    return notifications;
  };

  static seenNotification = async (args, context) => {
    const user = await auth(context.token);
    const idNotification = args.idNotification;
    const notification = await NotificationModel.findById(idNotification);
    if (!notification) throw new Error("Không tìm thấy thông báo này");
    if (!notification.users.includes(user.uid)) {
      throw new Error("Không có quyền truy cập thông báo này");
    }
    if (notification.seenListUser.includes(user.uid)) {
      throw new Error("Thông báo này đã được đánh dấu là đã đọc");
    }
    notification.seenListUser.push(user.uid);
    await notification.save();
    return true;
  };
}

module.exports = NotificationMutations;
