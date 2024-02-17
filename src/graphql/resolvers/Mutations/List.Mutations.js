const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const ListModel = require("../../../models/listSchema");
const auth = require("../authorization");
class ListMutations {
  static getLists = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const board = await BoardModel.findById(idBoard).catch((err) => {
      throw new Error(err);
    });

    if (!board) {
      throw new Error("Không tìm thấy bảng");
    }

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
  static createList = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const label = args.label;
    const newList = new ListModel({
      board: idBoard,
      label: label,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active",
      cards: [],
    });
    const savedList = await newList.save().catch((err) => {
      throw new Error(err);
    });
    BoardModel.findOneAndUpdate(
      { _id: idBoard },
      { $push: { lists: savedList._id } },
      { new: true }
    ).catch((err) => {
      throw new Error(err);
    });

    return savedList;
  };
  static updateList = async (args, context) => {
    const user = await auth(context.token);
    const idList = args.idList;
    const label = args.label;
    const updatedList = await ListModel.findOneAndUpdate(
      { _id: idList },
      {
        label: label,
        updatedAt: new Date().toISOString(),
      },
      { new: true }
    ).catch((error) => {
      console.error(error);
      throw new Error("Update list thất bại");
    });
    if (!updatedList) {
      throw new Error("Không tìm thấy list này");
    }
    return updatedList;
  };
  static deleteList = async (args, context) => {
    const user = await auth(context.token);
    const idList = args.idList;

    const updatedList = await ListModel.findOneAndUpdate(
      { _id: idList },
      {
        status: "Archived",
        updatedAt: new Date().toISOString(),
      },
      { new: true }
    ).catch((error) => {
      console.error(error);
      throw new Error("Xóa list thất bại");
    });

    if (!updatedList) {
      throw new Error("Không tìm thấy list này");
    }

    return true;
  };

  static moveList = async (args, context) => {
    const user = await auth(context.token);

    const idBoard = args.idBoard;
    const input = args.input;

    if (!idBoard || !input) {
      throw new Error("id bảng không được để trống");
    }

    const { oldListIndex, newListIndex } = input;

    if (
      oldListIndex === undefined ||
      newListIndex === undefined ||
      oldListIndex < 0 ||
      newListIndex < 0 ||
      !Number.isInteger(oldListIndex) ||
      !Number.isInteger(newListIndex)
    ) {
      throw new Error("oldListIndex and newListIndex không hợp lệ");
    }

    const board = await BoardModel.findById(idBoard);

    if (!board) {
      throw new Error("Không tìm thấy bảng");
    }

    if (
      oldListIndex >= board.lists.length ||
      newListIndex >= board.lists.length
    ) {
      throw new Error("Index không hợp lệ");
    }

    const [removedList] = board.lists.splice(oldListIndex, 1);
    board.lists.splice(newListIndex, 0, removedList);

    await board.save();

    return true;
  };
}

module.exports = ListMutations;