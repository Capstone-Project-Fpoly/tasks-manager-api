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
      $and: [{ _id: { $in: uniqueBoardIds } }, { status: "Active" }],
    });
    // xóa các thẻ không thuộc bảng nào
    cards.forEach((card) => {
      if (!boards.find((board) => board._id == card.boardId)) {
        cards.splice(cards.indexOf(card), 1);
      }
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
