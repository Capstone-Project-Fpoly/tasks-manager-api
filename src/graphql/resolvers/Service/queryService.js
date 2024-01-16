const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const CheckListModel = require("../../../models/checkListShema");
const CommentModel = require("../../../models/commentSchema");
const ListModel = require("../../../models/listSchema");
const UserModel = require("../../../models/userSchema");
const auth = require('../authorization');

class Query {
    static getUserById = async (uid, token) => {
        auth(token);
        if (!uid) return null;
        const user = await UserModel.findOne({ uid });
        return user;
    };

    static getBoardById = async (id, token) => {
        auth(token);
        if (!id) return null;
        const result = await BoardModel.findOne({ id });
        return result;
    };

    static getCardById = async (id, token) => {
        auth(token);
        if (!id) return null;
        const result = await CardModel.findOne({ id });
        return result;
    };

    static getCheckListById = async (id, token) => {
        auth(token);
        if (!id) return null;
        const result = await CheckListModel.findOne({ id });
        return result;
    };

    static getCommentById = async (id, token) => {
        auth(token);
        if (!id) return null;
        const result = await CommentModel.findOne({ id });
        return result;
    };

    static getListById = async (id, token) => {
        auth(token);
        if (!id) return null;
        const result = await ListModel.findOne({ id });
        return result;
    };

    static getAllUsersByIds = async (uids, token) =>{
        auth(token);
        const users = await UserModel.find({ uid: { $in: uids } });
        return users;

    };

    static getAllBoardsByIds = async (ids, token) => {
        auth(token);
        const boards = await BoardModel.find({ id: { $in: ids } });
        return boards;
    };

    static getAllCardsByIds = async (ids, token) => {
        auth(token);
        const cards = await CardModel.find({ id: { $in: ids } });
        return cards;
    };

    static getAllCheckListsByIds = async (ids, token) => {
        auth(token);
        const checkLists = await CheckListModel.find({ id: { $in: ids } });
        return checkLists;
    };

    static getAllCommentsByIds = async (ids, token) => {
        auth(token);
        const comments = await CommentModel.find({ id: { $in: ids } });
        return comments;
    };

    static getAllListsByIds = async (ids, token) => {
        auth(token);
        const lists = await ListModel.find({ id: { $in: ids } });
        return lists;
    };
}

module.exports = Query;
