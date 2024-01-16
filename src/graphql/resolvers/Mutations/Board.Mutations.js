const BoardModel = require("../../../models/boardSchema");
const auth = require("../authorization");

class BoardMutations {


    static createBoard = async (args, context) => {
        const user = await auth(context.token);
        const board = new BoardModel({
            title: args.title,
            isPublic: args.isPublic,
            lists: [],
            createdAt: new Date(),
            users: [],
            color: args.color ?? '168CD5',
            ownerUser: user.uid,
        })

        board.save()
            .catch(err => { throw new Error(err) });
        return board;
    }

    static getBoards = async (args, context) => {
        const user = await auth(context.token);
        const boards = await BoardModel.find({
            $or: [
                { ownerUser: user.uid },
                { users: user.uid }
            ]
        });

        return boards;

    }


}


module.exports = BoardMutations;