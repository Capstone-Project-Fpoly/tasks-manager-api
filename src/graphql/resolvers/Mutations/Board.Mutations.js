const BoardModel = require("../../../models/boardSchema");
const CardModel = require("../../../models/cardShema");
const ListModel = require("../../../models/listSchema");
const UserModel = require("../../../models/userSchema");
const {
  createNotificationModelForRemoveUser,
  getDeviceIds,
  send,
} = require("../Service/notification");
const sendNotification = require("../Service/sendNotification");
const auth = require("../../../auth/authorization");
const { KEY_CLOSE_BOARD } = require("../../../constant/common");
const NotificationModel = require("../../../models/notificationSchema");
const LabelCardModel = require("../../../models/labelCardSchema");

const sendNotificationForRemoveUser = async (idBoard, creator, users) => {
  try {
    const board = await BoardModel.findOne({ _id: idBoard });
    const deviceIds = await getDeviceIds(users);
    await createNotificationModelForRemoveUser(
      creator.uid,
      `**${creator.fullName}** đã xóa bạn khỏi bảng **${board.title}**`,
      idBoard,
      "RemoveUserFromBoard",
      users
    );
    if (deviceIds == null || deviceIds.length == 0) return;
    send(deviceIds, `**Bạn** đã được mời vào bảng **${board.title}**`);
  } catch (err) {
    console.log(err);
  }
};

class BoardMutations {
  static createBoard = async (args, context) => {
    const user = await auth(context.token);
    const board = new BoardModel({
      title: args.title,
      isPublic: args.isPublic,
      lists: [],
      createdAt: new Date().toISOString(),
      users: [user.uid],
      color: args.color ?? "168CD5",
      ownerUser: user.uid,
      updatedAt: new Date().toISOString(),
      inviteUsers: [],
      status: "Active",
    });
    board.save().catch((err) => {
      throw new Error(err);
    });
    return board;
  };

  static getBoards = async (args, context) => {
    const user = await auth(context.token);
    const boards = await BoardModel.find({
      $or: [{ ownerUser: user.uid }, { users: user.uid }],
      status: "Active",
    });
    // hãy sắp xếp lại boards theo thứ tự theo thời gian tạo mới nhất xuống cũ nhất
    boards.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return boards;
  };
  static leaveBoard = async (args, context) => {
    try {
      const { pubSub, token } = context;
      const user = await auth(token);
      const uid = user.uid;
      const idBoard = args.idBoard;
      const board = await BoardModel.findOne({ _id: idBoard });
      if (board.ownerUser === uid) {
        throw new Error("Bạn không thể rời bảng khi bạn là người tạo bảng");
      }
      if (board.users != 0) {
        await BoardModel.updateOne({ _id: idBoard }, { $pull: { users: uid } });
      }
      if (board.lists.length == 0) return true;

      const lists = await ListModel.find({ _id: { $in: board.lists } });

      let allListIdCards = [];

      for (const list of lists) {
        if (list.cards && list.cards.length > 0) {
          allListIdCards = allListIdCards.concat(list.cards);
        }
      }

      if (allListIdCards.length == 0) return true;
      await CardModel.updateMany(
        { _id: { $in: allListIdCards } },
        { $pull: { users: uid } }
      );
      sendNotification(
        idBoard,
        uid,
        `**${user.fullName}** đã rời khỏi bảng **${board.title}**`,
        "Board",
        idBoard,
        "Board"
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  static updateBoard = async (args, context) => {
    const { pubSub, token } = context;
    const user = await auth(token);
    const idBoard = args.idBoard;
    const input = args.input;
    const color = input.color;
    const title = input.title;
    const isPublic = input.isPublic;
    const board = await BoardModel.findOne({ _id: idBoard });
    if (board.ownerUser !== user.uid) {
      throw new Error("Bạn không có quyền sửa bảng này");
    }
    if (board.status !== "Active") {
      throw new Error("Bảng đã bị đóng");
    }
    const updateInput = {
      updatedAt: new Date().toISOString(),
    };
    if (color != null) updateInput.color = color;
    if (title != null) updateInput.title = title;
    if (isPublic != null) updateInput.isPublic = isPublic;
    const updateNewBoard = await BoardModel.findOneAndUpdate(
      { _id: idBoard },
      updateInput,
      { new: true }
    ).catch((err) => {
      throw new Error(err);
    });
    //kiểm tra xem bảng thay đổi cái gì thì gửi thông báo chi tiết
    // nếu chỉ thay đổi 1 trường thì gửi thông báo về trường đó còn nếu thay đổi nhiều trường thì gửi thông báo về tất cả
    if (color != null && title == null && isPublic == null) {
      sendNotification(
        idBoard,
        user.uid,
        `**${user.fullName}** đã thay đổi màu của bảng **${board.title}** thành **${color}**`,
        idBoard,
        "UpdateBoard"
      );
    } else if (color == null && title != null && isPublic == null) {
      sendNotification(
        idBoard,
        user.uid,
        `**${user.fullName}** đã thay đổi tên của bảng **${board.title}** thành **${title}**`,
        idBoard,
        "UpdateBoard"
      );
    } else if (color == null && title == null && isPublic != null) {
      sendNotification(
        idBoard,
        user.uid,
        `**${user.fullName}** đã thay đổi quyền truy cập của bảng **${board.title}** thành **${isPublic}**`,
        idBoard,
        "UpdateBoard"
      );
    } else {
      sendNotification(
        idBoard,
        user.uid,
        `**${user.fullName}** đã thay đổi thông tin của bảng **${board.title}**`,
        idBoard,
        "UpdateBoard"
      );
    }
    return updateNewBoard;
  };

  static removeUserFromBoard = async (args, context) => {
    const { pubSub, token } = context;
    const user = await auth(token);
    const uid = args.uid;
    const idBoard = args.idBoard;
    const board = await BoardModel.findOne({ _id: idBoard });
    if (board.status !== "Active") {
      throw new Error("Bảng đã bị đóng");
    }
    // nếu user không có trong bảng thì trả về lỗi
    if (!board.users.includes(uid)) {
      throw new Error("Người dùng không có trong bảng");
    }
    // nếu uid == user.uid thì trả về lỗi
    if (uid === user.uid) {
      throw new Error("Bạn không thể xóa chính mình ra khỏi bảng");
    }
    // nếu user là người tạo bảng thì trả về lỗi
    if (board.ownerUser === uid) {
      throw new Error("Bạn không thể xóa quản trị viên ra khỏi bảng");
    }
    // nếu user không là người tạo bảng thì không có quyền xóa user khác
    if (board.ownerUser !== user.uid) {
      throw new Error("Bạn không có quyền xóa người dùng khác");
    }

    if (board.users != 0) {
      await BoardModel.updateOne({ _id: idBoard }, { $pull: { users: uid } });
    }
    if (board.lists.length == 0) return true;

    const lists = await ListModel.find({ _id: { $in: board.lists } });

    let allListIdCards = [];

    for (const list of lists) {
      if (list.cards && list.cards.length > 0) {
        allListIdCards = allListIdCards.concat(list.cards);
      }
    }

    if (allListIdCards.length == 0) return true;
    await CardModel.updateMany(
      { _id: { $in: allListIdCards } },
      { $pull: { users: uid } }
    );
    sendNotificationForRemoveUser(idBoard, user, [uid]);
    const userIsDeleted = await UserModel.findOne({ uid: uid });
    sendNotification(
      idBoard,
      user.uid,
      `**${user.fullName}** đã xóa **${userIsDeleted.fullName}** ra khỏi bảng **${board.title}**`,
      idBoard,
      "RemoveUserFromBoard"
    );
    return true;
  };
  static closeBoard = async (args, context) => {
    const { pubSub, token } = context;
    const user = await auth(token);
    const idBoard = args.idBoard;
    const board = await BoardModel.findOne({
      _id: idBoard,
    }).catch((err) => {
      throw new Error("Không tìm thấy bảng này");
    });
    if (board.ownerUser !== user.uid) {
      throw new Error("Bạn không có quyền đóng bảng này");
    }
    if (board.status === "Archived") {
      throw new Error("Bảng này đã bị đóng");
    }
    if (board.status === "Deleted") {
      throw new Error("Bảng này đã bị xóa");
    }
    await BoardModel.updateOne({ _id: idBoard }, { status: "Archived" }).catch(
      (err) => {
        console.log(err);
        throw new Error(err);
      }
    );
    sendNotification(
      idBoard,
      user.uid,
      `**${user.fullName}** đã đóng bảng **${board.title}**`,
      idBoard,
      "Board"
    );
    pubSub.publish(idBoard + KEY_CLOSE_BOARD, { isClose: true, user: user });
    return true;
  };
  static openBoard = async (args, context) => {
    const { pubSub, token } = context;
    const user = await auth(token);
    const idBoard = args.idBoard;
    const board = await BoardModel.findOne({
      _id: idBoard,
      ownerUser: user.uid,
    });
    if (!board) {
      throw new Error("Bạn không có quyền mở bảng này");
    }
    await BoardModel.updateOne({ _id: idBoard }, { status: "Active" }).catch(
      (err) => {
        throw new Error(err);
      }
    );
    sendNotification(
      idBoard,
      user.uid,
      `**${user.fullName}** đã mở bảng **${board.title}**`,
      idBoard,
      "Board"
    );
    pubSub.publish(idBoard + KEY_CLOSE_BOARD, { isClose: false, user: user });
    return true;
  };
  static deleteBoard = async (args, context) => {
    const { pubSub, token } = context;
    const user = await auth(token);
    const idBoard = args.idBoard;
    const board = await BoardModel.findOne({
      _id: idBoard,
    });
    if (!board) {
      throw new Error("Bảng không tồn tại");
    }
    if (board.ownerUser !== user.uid) {
      throw new Error("Bạn không có quyền xóa bảng này");
    }
    await ListModel.deleteMany({ board: idBoard }).catch((err) => {
      throw new Error(err);
    });
    await CardModel.deleteMany({ boardId: idBoard }).catch((err) => {
      throw new Error(err);
    });
    await NotificationModel.deleteMany({ idBoard: idBoard }).catch((err) => {
      throw new Error(err);
    });
    await LabelCardModel.deleteMany({ board: idBoard }).catch((err) => {
      throw new Error(err);
    });
    await sendNotification(
      idBoard,
      user.uid,
      `**${user.fullName}** đã xóa bảng **${board.title}**`,
      idBoard,
      "Board"
    );
    await BoardModel.deleteOne({ _id: idBoard }).catch((err) => {
      throw new Error(err);
    });
    pubSub.publish(idBoard + KEY_CLOSE_BOARD, { isClose: true, user: user });
    return true;
  };
  static checkBoard = async (args, context) => {
    const user = await auth(context.token);
    const idBoard = args.idBoard;
    const board = await BoardModel.findOne({ _id: idBoard });
    if (!board) return null;
    if (board.status !== "Active") return false;
    if (!board.users.includes(user.uid)) return null;
    return true;
  };

  static getBoardsClosed = async (args, context) => {
    const user = await auth(context.token);
    const boards = await BoardModel.find({
      ownerUser: user.uid,
      status: "Archived",
    });
    return boards;
  };
}

module.exports = BoardMutations;
