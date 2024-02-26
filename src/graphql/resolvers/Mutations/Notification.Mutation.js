const { get } = require("mongoose");
const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const ListModel = require("../../../models/listSchema");
const NotificationModel = require("../../../models/notificationSchema");
const sendNotification = require("../Service/sendNotification");
const auth = require("../authorization");

const getAllNotifications = async (uid) => {
  const notifications = await NotificationModel.find({ users: uid });
  return notifications;
};
const getNotificationsOfBoard = async (idBoard) => {
  const notifications = await NotificationModel.find({ idBoard: idBoard });
  return notifications;
};

const formattedNotification = async (uid, notifications) => {
  const listFormatted = await Promise.all(
    notifications.map(async (notification) => {
      return {
        id: notification._id,
        createdAt: notification.createdAt,
        is_seen: notification.seenListUser.includes(uid),
        creater: notification.creater,
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
}

module.exports = NotificationMutations;
