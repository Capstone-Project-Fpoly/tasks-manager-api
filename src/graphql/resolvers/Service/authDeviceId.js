const admin = require("firebase-admin");

const authDeviceId = async (uid, token, deviceId) => {
  try {
    const db = admin.firestore();
    const userDeviceRef = db
      .collection("devices")
      .doc(uid)
      .collection("tokens");

    // Kiểm tra và tạo collection "tokens" nếu nó chưa tồn tại
    await userDeviceRef.doc(token).set({});

    // Thêm thông tin deviceId vào collection "tokens"
    await userDeviceRef.doc(token).set({
      deviceId: deviceId,
    });

    console.log("DeviceId authenticated successfully!");
  } catch (error) {
    console.error("Error authenticating deviceId:", error.message);
    throw error;
  }
};

module.exports = authDeviceId;
