const auth = require("../../../auth/authorization");
const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");

class CardQueries {
  static async getMyCards(args, context) {
    const user = await auth(context.token);
    const cards = await CardModel.find({
      $and: [{ users: user.uid }, { status: "Active" }],
    }).limit(100);
    const boardIds = cards.map((card) => card.boardId);
    const uniqueBoardIds = [...new Set(boardIds)];
    const boards = await BoardModel.find({
      _id: { $in: uniqueBoardIds },
    });
    const ResultMyCards = {
      cards,
      boards,
    };
    console.log(cards.length, boards.length);
    return ResultMyCards;
  }
}

module.exports = CardQueries;
