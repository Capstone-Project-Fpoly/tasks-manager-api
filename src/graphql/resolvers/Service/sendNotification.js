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
    if (uids.length === 0) return;
    const deviceIds = await getDeviceIds(uids);
    await createNotification(idBoard, uid, body, data, topic);
    send(deviceIds, body);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendNotification;
