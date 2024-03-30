const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const ListModel = require("../../../models/listSchema");
const sendNotification = require("../Service/sendNotification");
const auth = require("../../../auth/authorization");
const NotificationModel = require("../../../models/notificationSchema");
const { KEY_BOARD_DETAIL } = require("../../../constant/common");
class ListMutations {
  static getLists = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const board = await BoardModel.findById(idBoard).catch((err) => {
      throw new Error(err);
    });

    if (!board) {
      throw new Error("Không tìm thấy bảng");
    }
    if (board.status !== "Active") {
      throw new Error("Bảng đã bị đóng");
    }
    const lists = await ListModel.find({
      _id: { $in: board.lists },
      status: "Active",
    }).catch((err) => {
      throw new Error(err);
    });

    lists.sort(
      (a, b) =>
        board.lists.indexOf(a._id.toString()) -
        board.lists.indexOf(b._id.toString())
    );
    return lists;
  };
  static createList = async (args, context) => {
    const { pubSub } = context;
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const label = args.label;

    const board = await BoardModel.findById(idBoard).catch((err) => {
      throw new Error(err);
    });
    if (board.status !== "Active") {
      throw new Error("Bảng đã bị đóng");
    }

    const newList = new ListModel({
      board: idBoard,
      label: label,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active",
      cards: [],
    });
    const savedList = await newList.save().catch((err) => {
      throw new Error(err);
    });
    BoardModel.findOneAndUpdate(
      { _id: idBoard },
      { $push: { lists: savedList._id } },
      { new: true }
    )
      .catch((err) => {
        throw new Error(err);
      })
      .then((board) => {
        sendNotification(
          idBoard,
          user.uid,
          `**${user.fullName}** đã tạo danh sách mới **${label}** ở bảng **${board.title}**`,
          idBoard,
          "List"
        );
        pubSub.publish(idBoard + KEY_BOARD_DETAIL, {
          idBoard: idBoard,
          user: user,
        });
      });

    return savedList;
  };
  static updateList = async (args, context) => {
    const { pubSub } = context;
    const user = await auth(context.token);
    const idList = args.idList;
    const label = args.label;
    const updatedList = await ListModel.findOneAndUpdate(
      { _id: idList },
      {
        label: label,
        updatedAt: new Date().toISOString(),
      },
      { new: true }
    ).catch((error) => {
      console.error(error);
      throw new Error("Update list thất bại");
    });
    if (!updatedList) {
      throw new Error("Không tìm thấy list này");
    }
    // tìm bảng theo trường board trong list
    BoardModel.findById(updatedList.board)
      .then((board) => {
        sendNotification(
          updatedList.board,
          user.uid,
          `**${user.fullName}** đã cập nhật danh sách **${label}** trong bảng **${board.title}**`,
          updatedList.board,
          "List"
        );
        pubSub.publish(updatedList.board + KEY_BOARD_DETAIL, {
          idBoard: updatedList.board,
          user: user,
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return updatedList;
  };
  static deleteList = async (args, context) => {
    const { pubSub } = context;
    const user = await auth(context.token);
    const idList = args.idList;

    const list = await ListModel.findById(idList);

    if (!list) {
      throw new Error("Không tìm thấy list");
    }

    const cards = await CardModel.find({ _id: { $in: list.cards } });

    cards.forEach(async (card) => {
      card.status = "Archived";
      card.updatedAt = new Date().toISOString();
      await card.save().catch((error) => {
        console.error(error);
      });
    });

    list.status = "Archived";
    list.updatedAt = new Date().toISOString();
    list.cards = [];
    await list.save().catch((error) => {
      console.error(error);
      throw new Error("Xóa list thất bại");
    });

    const board = await BoardModel.findOne({ lists: idList });
    board.lists = board.lists.filter((id) => id.toString() !== idList);
    // xóa tất cả các thông báo có topic là list và data là listId
    await NotificationModel.deleteMany({
      topic: "List",
      data: idList,
    }).catch((err) => {
      console.log(err);
    });
    await board
      .save()
      .catch((error) => {
        console.error(error);
        throw new Error("Xóa list thất bại");
      })
      .then((board) => {
        sendNotification(
          board._id,
          user.uid,
          `**${user.fullName}** đã xóa danh sách **${list.label}** trong bảng **${board.title}**`,
          board._id,
          "List"
        );
        pubSub.publish(board._id + KEY_BOARD_DETAIL, {
          idBoard: board._id,
          user: user,
        });
      });
    return true;
  };

  static moveList = async (args, context) => {
    const { pubSub } = context;
    const user = await auth(context.token);

    const idBoard = args.idBoard;
    const input = args.input;

    if (!idBoard || !input) {
      throw new Error("id bảng không được để trống");
    }

    const board = await BoardModel.findById(idBoard);
    if (board.status !== "Active") {
      throw new Error("Bảng đã bị đóng");
    }

    const { oldListIndex, newListIndex } = input;

    if (
      oldListIndex === undefined ||
      newListIndex === undefined ||
      oldListIndex < 0 ||
      newListIndex < 0 ||
      !Number.isInteger(oldListIndex) ||
      !Number.isInteger(newListIndex)
    ) {
      throw new Error("oldListIndex and newListIndex không hợp lệ");
    }

    if (!board) {
      throw new Error("Không tìm thấy bảng");
    }

    if (
      oldListIndex >= board.lists.length ||
      newListIndex >= board.lists.length
    ) {
      throw new Error("Index không hợp lệ");
    }

    const [removedList] = board.lists.splice(oldListIndex, 1);
    board.lists.splice(newListIndex, 0, removedList);

    await board.save().then((board) => {
      ListModel.findById(removedList).then((list) => {
        sendNotification(
          idBoard,
          user.uid,
          `**${user.fullName}** đã di chuyển danh sách **${list.label}** trong bảng **${board.title}**`,
          idBoard,
          "List"
        );
        pubSub.publish(idBoard + KEY_BOARD_DETAIL, {
          idBoard: idBoard,
          user: user,
        });
      });
    });

    return true;
  };
}

module.exports = ListMutations;
