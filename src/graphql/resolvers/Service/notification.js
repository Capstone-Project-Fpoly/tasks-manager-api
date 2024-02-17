const admin = require("firebase-admin");
class NotificationService {
  static getDeviceIds = async (uids) => {
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
  static send = async (deviceIds, notificationBody) => {
    const tokens = deviceIds.map((token) => token);
    const message = {
      notification: {
        title: "Thông báo",
        body: notificationBody,
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
}

module.exports = NotificationService;
