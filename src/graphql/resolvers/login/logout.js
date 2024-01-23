const auth = require("../authorization");
const admin = require("firebase-admin");

module.exports = async (context) => {
  try {
    const token = context.token;
    const user = await auth(context.token);

    const uid = user.uid; // Đặt giả sử rằng user object có thuộc tính 'uid'
    const db = admin.firestore();
    const userDeviceRef = db
      .collection("devices")
      .doc(uid)
      .collection("tokens");

    // Xóa tài liệu trong collection "tokens"
    await userDeviceRef.doc(token).delete();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
