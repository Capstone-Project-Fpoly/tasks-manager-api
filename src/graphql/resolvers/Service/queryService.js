const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const CheckListModel = require("../../../models/checkListShema");
const CommentModel = require("../../../models/commentSchema");
const ListModel = require("../../../models/listSchema");
const UserModel = require("../../../models/userSchema");
const auth = require("../authorization");

class Query {
  static getUserById = async (uid) => {
    if (!uid) return null;
    const user = await UserModel.findOne({ uid });
    return user;
  };

  static getBoardById = async (id) => {
    if (!id) return null;
    const result = await BoardModel.findOne({ _id: id, status: "Active" });
    return result;
  };

  static getCardById = async (id) => {
    if (!id) return null;
    const result = await CardModel.findOne({ _id: id, status: "Active" });
    return result;
  };

  static getCheckListById = async (id) => {
    if (!id) return null;
    const result = await CheckListModel.findOne({ _id: id });
    return result;
  };

  static getCommentById = async (id) => {
    if (!id) return null;
    const result = await CommentModel.findOne({ _id: id });
    return result;
  };

  static getListById = async (id) => {
    if (!id) return null;
    const result = await ListModel.findOne({ _id: id, status: "Active" });
    return result;
  };

  static getAllUsersByIds = async (uids) => {
    const users = await UserModel.find({ uid: { $in: uids } });
    return users;
  };

  static getAllBoardsByIds = async (ids) => {
    const boards = await BoardModel.find({
      _id: { $in: ids },
      status: "Active",
    });
    return boards;
  };

  static getAllCardsByIds = async (ids) => {
    const cards = await CardModel.find({ _id: { $in: ids }, status: "Active" });
    cards.sort(
      (a, b) => ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString())
    );
    return cards;
  };

  static getAllCheckListsByIds = async (ids) => {
    const checkLists = await CheckListModel.find({ _id: { $in: ids } });
    return checkLists;
  };

  static getAllCommentsByIds = async (ids) => {
    const comments = await CommentModel.find({ _id: { $in: ids } });
    return comments;
  };

  static getAllListsByIds = async (ids) => {
    const lists = await ListModel.find({ _id: { $in: ids }, status: "Active" });
    return lists;
  };
}

module.exports = Query;
