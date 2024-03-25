const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const CheckListModel = require("../../../models/checkListShema");
const ListModel = require("../../../models/listSchema");
const sendNotification = require("../Service/sendNotification");
const auth = require("../../../auth/authorization");
class CardMutations {
  static createCard = async (args, context) => {
    const { pubSub } = context;
    const user = await auth(context.token);
    const {
      idList,
      title,
      description,
      users,
      endDate,
      startedDate,
      reminder,
      checkLists,
    } = args.input;
    const list = await ListModel.findById(idList);
    const newCard = new CardModel({
      boardId: list.board,
      title: title,
      description: description,
      users: users,
      endDate: endDate,
      startedDate: startedDate,
      checkLists: checkLists,
      reminder: reminder ?? "Unknown",
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active",
    });

    const savedCard = await newCard.save().catch((err) => {
      throw new Error(err);
    });

    // xong thêm id card vào trường cards của list sau đó save list
    list.cards.push(savedCard._id);
    list.save().catch((err) => {
      console.log(err);
    });

    BoardModel.findById(list.board).then((board) => {
      sendNotification(
        board._id,
        user.uid,
        `**${user.fullName}** đã tạo thẻ mới **${title}** ở bảng **${board.title}**`,
        savedCard._id,
        "Card"
      );
      pubSub.publish(board._id, { idBoard: board._id, user: user });
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
    const { pubSub } = context;
    const user = await auth(context.token);
    const input = args.input;
    const cardId = input.idCard;
    const checkListIds = input.checkLists
      ? await this.saveCheckLists(cardId, input.checkLists)
      : null;

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
    if (input.labels !== null) update.labels = input.labels;

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
    BoardModel.findById(updateCard.boardId).then((board) => {
      sendNotification(
        board._id,
        user.uid,
        `**${user.fullName}** đã thay đổi thẻ **${updateCard.title}** trong bảng **${board.title}**`,
        updateCard._id,
        "Card"
      );
      pubSub.publish(board._id, { idBoard: board._id, user: user });
    });
    return updateCard;
  };

  static deleteCard = async (args, context) => {
    const { pubSub } = context;
    const user = await auth(context.token);
    const cardId = args.idCard;
    const idList = idList;

    const list = await ListModel.findById(idList);

    if (!list) {
      throw new Error("Không tìm thấy thẻ này trong danh sách");
    }

    const cardUpdate = await CardModel.findOneAndUpdate(
      { _id: cardId },
      { status: "Archived", updatedAt: new Date().toISOString() },
      { new: true }
    ).catch((err) => {
      throw new Error(err);
    });

    list.cards = list.cards.filter((id) => id.toString() !== cardId);
    await list.save().catch((err) => {
      console.log(err);
    });
    BoardModel.findById(list.board).then((board) => {
      sendNotification(
        board._id,
        user.uid,
        `**${user.fullName}** đã xóa thẻ **${cardUpdate.title}** trong bảng **${board.title}**`,
        cardId,
        "Card"
      );
      pubSub.publish(board._id, { idBoard: board._id, user: user });
    });
    return true;
  };

  static moveCard = async (args, context) => {
    const { pubSub } = context;
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
    let card;
    if (oldListId.toString() === newListId.toString()) {
      [card] = oldList.cards.splice(oldItemIndex, 1);
      oldList.cards.splice(newItemIndex, 0, card);
      await oldList.save();
    } else {
      [card] = oldList.cards.splice(oldItemIndex, 1);
      newList.cards.splice(newItemIndex, 0, card);
      await Promise.all([oldList.save(), newList.save()]);
    }
    CardModel.findById(card).then((card) => {
      sendNotification(
        idBoard,
        user.uid,
        `**${user.fullName}** đã di chuyển thẻ **${card.title}** trong bảng **${board.title}**`,
        card._id,
        "Card"
      );
      pubSub.publish(board._id, { idBoard: board._id, user: user });
    });

    return true;
  };
}

module.exports = CardMutations;
