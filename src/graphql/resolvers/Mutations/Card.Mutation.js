const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const CheckListModel = require("../../../models/checkListShema");
const ListModel = require("../../../models/listSchema");
const auth = require("../authorization");
class CardService {
  static createCard = async (args, context) => {
    const user = await auth(context.token);
    const newCard = new CardModel({
      title: args.title,
      reminder: "Unknown",
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active",
    });

    const savedCard = await newCard.save().catch((err) => {
      throw new Error(err);
    });

    ListModel.findOneAndUpdate(
      { _id: args.idList },
      { $push: { cards: savedCard._id } },
      { new: true }
    ).catch((err) => {
      throw new Error(err);
    });

    return savedCard;
  };

  static saveCheckLists = async (idCard, checkListInputs) => {
    const checkListIds = [];
    for (const input of checkListInputs) {
      const checkList = new CheckListModel({
        card: idCard,
        content: input.content,
        isChecked: input.isChecked,
      });
      const savedCheckList = await checkList.save().catch((err) => {
        throw new Error(err);
      });
      checkListIds.push(savedCheckList._id);
    }
    return checkListIds;
  };

  // Update a card by id
  static updateCard = async (args, context) => {
    const user = await auth(context.token);
    const input = args.input;
    const cardId = input.idCard;
    const checkListIds = input.checkLists
      ? await this.saveCheckLists(cardId, input.checkLists)
      : [];

    const update = {
      updatedAt: new Date().toISOString(),
    };

    if (input.title !== null) update.title = input.title;
    if (input.description !== null) update.description = input.description;
    if (input.users !== null) update.users = input.users;
    if (input.endDate !== null) update.endDate = input.endDate;
    if (input.startedDate !== null) update.startedDate = input.startedDate;
    update.reminder = input.reminder ?? "Unknown";
    if (checkListIds !== null) update.checkLists = checkListIds;

    const updateCard = await CardModel.findOneAndUpdate(
      { _id: cardId },
      update,
      {
        new: true,
      }
    ).catch((err) => {
      console.log(err);
      throw new Error("Update card thất bại");
    });
    if (!updateCard) {
      throw new Error("Không tìm thấy card này");
    }
    return updateCard;
  };

  static deleteCard = async (args, context) => {
    const user = await auth(context.token);
    const cardId = args.idCard;

    await CardModel.findOneAndUpdate(
      { _id: cardId },
      { status: "Archived", updatedAt: new Date().toISOString() },
      { new: true }
    ).catch((err) => {
      throw new Error(err);
    });
    return true;
  };
  static moveCard = async (args, context) => {
    const user = await auth(context.token);
    try {
      const idBoard = args.idBoard;
      const input = args.input;
      const { oldItemIndex, oldListIndex, newItemIndex, newListIndex } = input;

      const board = await BoardModel.findOne({ _id: idBoard });

      const oldListId = board.lists[oldListIndex];
      const newListId = board.lists[newListIndex];

      const [oldList, newList] = await Promise.all([
        ListModel.findById(oldListId),
        ListModel.findById(newListId),
      ]);

      if (oldListId == newListId) {
        const [card] = oldList.cards.splice(oldItemIndex, 1);
        oldList.cards.splice(newItemIndex, 0, card);
        await oldList.save();
      } else {
        const [card] = oldList.cards.splice(oldItemIndex, 1);
        newList.cards.splice(newItemIndex, 0, card);
        await Promise.all([oldList.save(), newList.save()]);
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
}

module.exports = CardService;
