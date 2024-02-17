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

    const idBoard = args.idBoard;
    const input = args.input;

    if (!idBoard || !input) {
      throw new Error("idBoard không được để trống");
    }

    const { oldItemIndex, oldListIndex, newItemIndex, newListIndex } = input;

    if (
      oldItemIndex === undefined ||
      oldListIndex === undefined ||
      newItemIndex === undefined ||
      newListIndex === undefined ||
      oldItemIndex < 0 ||
      oldListIndex < 0 ||
      newItemIndex < 0 ||
      newListIndex < 0 ||
      !Number.isInteger(oldItemIndex) ||
      !Number.isInteger(oldListIndex) ||
      !Number.isInteger(newItemIndex) ||
      !Number.isInteger(newListIndex)
    ) {
      throw new Error("Input không hợp lệ");
    }

    const board = await BoardModel.findById(idBoard);

    if (!board) {
      throw new Error("Không tìm thấy bảng này");
    }

    if (
      oldListIndex >= board.lists.length ||
      newListIndex >= board.lists.length
    ) {
      throw new Error("Index danh sách không hợp lệ");
    }

    const oldListId = board.lists[oldListIndex];
    const newListId = board.lists[newListIndex];

    const [oldList, newList] = await Promise.all([
      ListModel.findById(oldListId),
      ListModel.findById(newListId),
    ]);

    if (
      oldItemIndex >= oldList.cards.length ||
      newItemIndex > newList.cards.length
    ) {
      throw new Error("Index thẻ không hợp lệ");
    }

    if (oldListId.toString() === newListId.toString()) {
      const [card] = oldList.cards.splice(oldItemIndex, 1);
      oldList.cards.splice(newItemIndex, 0, card);
      await oldList.save();
    } else {
      const [card] = oldList.cards.splice(oldItemIndex, 1);
      newList.cards.splice(newItemIndex, 0, card);
      await Promise.all([oldList.save(), newList.save()]);
    }

    return true;
  };
}

module.exports = CardService;
