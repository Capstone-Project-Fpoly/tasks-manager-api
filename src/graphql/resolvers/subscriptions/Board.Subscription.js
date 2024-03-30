class BoardSubscriptions {
  static checkCloseBoard = (parent, args, context, info) => {
    const { isClose, user } = parent;

    return isClose;
  };
}

module.exports = BoardSubscriptions;
