const BoardModel = require("../../../models/boardSchema");
const {
  getDeviceIds,
  send,
  createNotification,
} = require("../Service/notification");

const sendNotification = async (idBoard, uid, body, data, topic) => {
  try {
    const board = await BoardModel.findOne({ _id: idBoard });
    const uids = board.users;
    // bỏ đi user tạo thông báo
    const index = uids.indexOf(uid);
    if (index > -1) {
      uids.splice(index, 1);
    }
    await createNotification(idBoard, uid, body, data, topic);
    if (uids.length === 0) return;
    const deviceIds = await getDeviceIds(uids);
    send(deviceIds, body);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendNotification;
