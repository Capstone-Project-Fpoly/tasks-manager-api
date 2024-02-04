const BoardModel = require("../../../models/boardSchema");
const { getDeviceIds, sendNotification } = require("../Service/notification");

const sendNotification = async (idBoard, uid) => {
  try {
    const board = await BoardModel.findOne({ _id: idBoard });
    const uids = board.users;
    uids.push(board.ownerUser);
    const deviceIds = await getDeviceIds(uids);
    sendNotification(deviceIds, "Đây là test thông báo");
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendNotification;
