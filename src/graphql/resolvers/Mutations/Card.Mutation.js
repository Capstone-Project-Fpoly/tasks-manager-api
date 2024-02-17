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
    )
      .catch((err) => {
        throw new Error(err);
      })
      .then((res) => console.log(res));

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

  // Delete (archive) a card by id
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
}

module.exports = CardService;
