const BoardModel = require("../../../models/boardSchema");
const ListModel = require("../../../models/listSchema");

module.exports = async (parent, args, context, info) => {
  const { idBoard, user } = parent;
  // hãy lấy tất cả các list của trường lists trong bảng có idBoard
  // sau đó lấy tất cả các list theo id của list trong trường lists
  const board = await BoardModel.findById(idBoard);
  if (board.status !== "Active") return null;
  const lists = await ListModel.find({
    _id: { $in: board.lists },
    status: "Active",
  }).catch((err) => {
    throw new Error(err);
  });
  lists.sort(
    (a, b) =>
      board.lists.indexOf(a._id.toString()) -
      board.lists.indexOf(b._id.toString())
  );
  return lists;
};
