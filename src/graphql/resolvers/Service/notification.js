const admin = require("firebase-admin");
const BoardModel = require("../../../models/boardSchema");
const NotificationModel = require("../../../models/notificationSchema");
class NotificationService {
  static getDeviceIds = async (uids) => {
    if (!uids || uids.length === 0) return [];
    const db = admin.firestore();
    let deviceIds = [];

    for (let uid of uids) {
      try {
        const snapshot = await db
          .collection("devices")
          .doc(uid)
          .collection("tokens")
          .get();

        snapshot.forEach((doc) => {
          deviceIds.push(doc.data().deviceId);
        });
      } catch (error) {
        console.error(`Error getting documents for uid ${uid}:`, error);
      }
    }
    return deviceIds;
  };
  static send = async (deviceIds, notificationBody = "") => {
    if (deviceIds.length === 0 || !deviceIds) return;
    const tokens = deviceIds.map((token) => token);
    const body = notificationBody.replace(/\*\*/g, "");
    const message = {
      notification: {
        title: "Thông báo",
        body: body,
      },
      tokens: tokens,
    };

    const messaging = admin.messaging();
    messaging
      .sendMulticast(message)
      .then((response) => {
        console.log(response.responses[0].error);
        console.log(response.successCount + " messages were sent successfully");
      })
      .catch((error) => {
        console.log("Lỗi khi gửi thông báo:", error);
      });
  };
  static createNotification = async (
    idBoard,
    creator,
    content,
    data,
    topic
  ) => {
    // truy vấn lấy thông tin board theo id trong mongoese
    const board = await BoardModel.findOne({ _id: idBoard });
    // lấy danh sách user trong board
    const uids = board.users;
    const notification = new NotificationModel({
      idBoard: idBoard,
      data: data,
      content: content,
      creator: creator,
      topic: topic,
      users: uids,
      seenListUser: [],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    notification.save().catch((err) => {
      console.log(err);
    });
  };

  // tạo 1 hàm tạo notification cho trường hợp người dùng thêm người dùng vào bảng
  static createNotificationModelForInviteUser = async (
    creator,
    content,
    data,
    topic,
    uids
  ) => {
    const notification = new NotificationModel({
      data: data,
      content: content,
      creator: creator,
      topic: topic,
      users: uids,
      seenListUser: [],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    notification.save().catch((err) => {
      console.log(err);
    });
  };

  static createNotificationModelForRemoveUser = async (
    creator,
    content,
    data,
    topic,
    uids
  ) => {
    const notification = new NotificationModel({
      data: data,
      content: content,
      creator: creator,
      topic: topic,
      users: uids,
      seenListUser: [],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    notification.save().catch((err) => {
      console.log(err);
    });
  };
}

module.exports = NotificationService;
