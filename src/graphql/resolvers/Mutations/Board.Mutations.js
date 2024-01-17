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
    static leaveBoard = async (args, context) => {
        const user = await auth(context.token);
        const uid = user.uid;
        const idBoard = args.idBoard;
        const board = await BoardModel.findOne({ _id: idBoard });
        const resultBoard = await BoardModel.updateOne(
            { _id: idBoard },
            { $: { lists: uid } }
        );
        console.log(board);
        console.log(resultBoard);
        // const result = await BoardModel.updateOne(
        //     { _id: idBoard },
        //     { $pull: { users: uid } }
        // );
    }

}


module.exports = BoardMutations;