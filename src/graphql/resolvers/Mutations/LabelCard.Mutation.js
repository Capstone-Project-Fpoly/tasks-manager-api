const auth = require("../../../auth/authorization");
const { KEY_BOARD_DETAIL } = require("../../../constant/common");
const CardModel = require("../../../models/cardShema");
const LabelCardModel = require("../../../models/labelCardSchema");
class LabelCardMutations {
  static getLabelsOfBoard = async (args, context) => {
    await auth(context.token);
    const { idBoard } = args;
    try {
      const labelCards = await LabelCardModel.find({ board: idBoard });
      return labelCards;
    } catch (error) {
      throw new Error("Đã xảy ra lỗi khi lấy nhãn của bảng.");
    }
  };

  static createLabelOfBoard = async (args, context) => {
    await auth(context.token);
    const { idBoard, title, color } = args;
    try {
      const labelCard = new LabelCardModel({
        board: idBoard,
        title,
        color,
      });
      await labelCard.save();
      return labelCard;
    } catch (error) {
      throw new Error("Đã xảy ra lỗi khi tạo nhãn cho bảng.");
    }
  };

  static updateLabelOfBoard = async (args, context) => {
    const user = await auth(context.token);
    const { pubSub } = context;
    const { idLabel, title, color } = args;
    try {
      const labelCard = await LabelCardModel.findById(idLabel);
      if (!labelCard) {
        throw new Error("Nhãn không tồn tại.");
      }
      labelCard.title = title;
      labelCard.color = color;
      await labelCard.save();
      pubSub.publish(labelCard.board + KEY_BOARD_DETAIL, {
        idBoard: labelCard.board,
        user: user,
      });
      return labelCard;
    } catch (error) {
      console.log(error);
      throw new Error("Đã xảy ra lỗi khi cập nhật nhãn của bảng.");
    }
  };

  static deleteLabelOfBoard = async (args, context) => {
    const user = await auth(context.token);
    const { pubSub } = context;
    const { idLabel } = args;
    try {
      const labelCard = await LabelCardModel.findById(idLabel);
      if (!labelCard) {
        throw new Error("Nhãn không tồn tại.");
      }
      const cards = await CardModel.find({ labels: idLabel });
      for (let card of cards) {
        card.labels = card.labels.filter((id) => id.toString() !== idLabel);
        await card.save();
      }
      await labelCard.deleteOne();
      pubSub.publish(labelCard.board + KEY_BOARD_DETAIL, {
        idBoard: labelCard.board,
        user: user,
      });
      return true;
    } catch (error) {
      console.log(error);
      throw new Error("Đã xảy ra lỗi khi xóa nhãn của bảng.");
    }
  };
}

module.exports = LabelCardMutations;
