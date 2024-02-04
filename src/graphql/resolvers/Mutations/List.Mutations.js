const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const ListModel = require("../../../models/listSchema");
const auth = require("../authorization");
class ListMutations {
  static getLists = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const lists = await ListModel.find({
      board: idBoard,
      status: "Active",
    }).catch((err) => {
      throw new Error(err);
    });
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
}

module.exports = ListMutations;
