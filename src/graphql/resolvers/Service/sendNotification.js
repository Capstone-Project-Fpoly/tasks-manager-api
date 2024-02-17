const BoardModel = require("../../../models/boardSchema");
const { getDeviceIds, send } = require("../Service/notification");

const sendNotification = async (idBoard, uid, body) => {
  try {
    const board = await BoardModel.findOne({ _id: idBoard });
    const uids = board.users;
    uids.push(board.ownerUser);
    const deviceIds = await getDeviceIds(uids);
    send(deviceIds, body);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendNotification;
