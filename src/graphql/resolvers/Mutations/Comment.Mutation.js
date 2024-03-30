const auth = require("../../../auth/authorization");
const { KEY_BOARD_DETAIL } = require("../../../constant/common");
const CardModel = require("../../../models/cardShema");
const CommentModel = require("../../../models/commentSchema");
const NotificationModel = require("../../../models/notificationSchema");
const { send } = require("../Service/notification");
const sendNotification = require("../Service/sendNotification");

class CommentMutation {
  static async createComment(args, context) {
    const { pubSub } = context;
    const user = await auth(context.token);
    const { idCard, content } = args;
    const card = await CardModel.findById(idCard);
    const comment = new CommentModel({
      card: idCard,
      user: user.uid,
      comment: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const savedComment = await comment.save().catch((err) => {
      throw new Error(err);
    });
    card.comments.push(savedComment._id);
    card.save().catch((err) => {
      console.log(err);
    });
    sendNotification(
      card.boardId,
      user.uid,
      `**${user.fullName}** đã thêm nhận xét **${content}** vào thẻ **${card.title}**`,
      card.id,
      "Comment"
    );
    pubSub.publish(card.boardId + KEY_BOARD_DETAIL, {
      idBoard: card.boardId,
      user: user,
    });
    return savedComment;
  }

  static async updateComment(args, context) {
    const user = await auth(context.token);
    const { idComment, content } = args;
    const comment = await CommentModel.findById(idComment).catch((err) => {
      throw new Error(err);
    });
    if (!comment) {
      throw new Error("Không tìm thấy comment này");
    }
    if (comment.user !== user.uid) {
      throw new Error("Bạn không có quyền chỉnh sửa comment này");
    }
    comment.comment = content;
    comment.updatedAt = new Date().toISOString();
    sendNotification(
      comment.card.boardId,
      user.uid,
      `**${user.fullName}** đã chỉnh sửa nhận xét **${content}** trong thẻ **${comment.card.title}**`,
      comment._id,
      "Comment"
    );

    return comment.save().catch((err) => {
      throw new Error(err);
    });
  }
  static async deleteComment(args, context) {
    const user = await auth(context.token);
    const { idComment } = args;
    const comment = await CommentModel.findById(idComment).catch((err) => {
      throw new Error(err);
    });
    if (!comment) {
      throw new Error("Không tìm thấy comment này");
    }
    if (comment.user !== user.uid) {
      throw new Error("Bạn không có quyền xóa comment này");
    }
    const card = await CardModel.findById(comment.card).catch((err) => {
      throw new Error(err);
    });
    card.comments = card.comments.filter(
      (id) => id.toString() !== idComment.toString()
    );
    card.save().catch((err) => {
      console.log(err);
    });
    // xóa thông báo có topic là comment và data là idComment
    await NotificationModel.deleteMany({
      topic: "Comment",
      data: idComment,
    }).catch((err) => {
      console.log(err);
    });
    sendNotification(
      card.boardId,
      user.uid,
      `**${user.fullName}** đã xóa nhận xét **${comment.comment}** trong thẻ **${card.title}**`,
      comment._id,
      "Comment"
    );
    await CommentModel.findByIdAndDelete(idComment).catch((err) => {
      throw new Error(err);
    });
    return true;
  }
  static async getComments(args, context) {
    const user = await auth(context.token);
    const { idCard } = args;
    // sắp xếp theo thời gian tạo mới nhất thì sẽ lên đầu
    return CommentModel.find({ card: idCard }).sort({ createdAt: -1 });
  }
}

module.exports = CommentMutation;
