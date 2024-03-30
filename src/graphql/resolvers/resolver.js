const me = require("./Queres/me");
const getToken = require("./getToken");
const loginByGoogle = require("./login/loginByGoogle");
const { PubSub } = require("graphql-subscriptions");
const Query = require("./Service/queryService");
const {
  createBoard,
  getBoards,
  leaveBoard,
  updateBoard,
  removeUserFromBoard,
  closeBoard,
  openBoard,
  deleteBoard,
  checkBoard,
} = require("./Mutations/Board.Mutations");
const loginByEMail = require("./login/loginByEmail");
const registerByEmail = require("./login/registerByEmail");
const sendOTPEmail = require("./login/sendOTPEmail");
const verifyEmail = require("./login/verifyEmail");
const logout = require("./login/logout");
const {
  getLists,
  createList,
  updateList,
  deleteList,
  moveList,
} = require("./Mutations/List.Mutations");

const auth = require("../../auth/authorization");
const {
  updateCard,
  createCard,
  deleteCard,
  moveCard,
} = require("./Mutations/Card.Mutation");
const {
  getNotifications,
  seenNotification,
} = require("./Mutations/Notification.Mutation");
const {
  inviteUsersToBoard,
  getUsersInviteToBoard,
  acceptInviteToBoard,
} = require("./Mutations/User.Mutation");
const { getUsersOfBoard } = require("./Queres/User.Queries");
const { testSubscription } = require("./Mutations/testSubscription");
const {
  createComment,
  updateComment,
  deleteComment,
  getComments,
} = require("./Mutations/Comment.Mutation");
const { testSubscribe } = require("./subscriptions/test");
const DetailBoardSubscription = require("./subscriptions/Detail.Board.Subscription");
const {
  getLabelsOfBoard,
  createLabelOfBoard,
  updateLabelOfBoard,
  deleteLabelOfBoard,
} = require("./Mutations/LabelCard.Mutation");
const { getMyCards } = require("./Queres/Card.Queries");
const { KEY_BOARD_DETAIL, KEY_CLOSE_BOARD } = require("../../constant/common");
const { checkCloseBoard } = require("./subscriptions/Board.Subscription");

// const pubSub = new PubSub();

const resolvers = {
  Query: {
    getToken: getToken,
    me: me,
    notificationCollection: (_, args, context) =>
      getNotifications(args, context),
    getUsersInviteToBoard: (_, args, context) =>
      getUsersInviteToBoard(args, context),
    getUsersOfBoard: (_, args, context) => getUsersOfBoard(args, context),
    getMyCards: (_, args, context) => getMyCards(args, context),
  },
  Mutation: {
    loginByGoogle: loginByGoogle,
    testCallSubscription: (parent, args, context) =>
      testSubscription(args, context),
    createBoard: (parent, args, context) => createBoard(args, context),
    getBoards: (parent, args, context) => getBoards(args, context),
    leaveBoard: (_, args, context) => leaveBoard(args, context),
    loginByEmail: (_, args, context) => loginByEMail(args, context),
    registerByEmail: (_, args, context) => registerByEmail(args, context),
    sendOTPEmail: (_, args, context) => sendOTPEmail(args, context),
    verifyEmail: (_, args, context) => verifyEmail(args, context),
    logout: (_, args, context) => logout(context),
    getLists: (_, args, context) => getLists(args, context),
    createList: (_, args, context) => createList(args, context),
    updateList: (_, args, context) => updateList(args, context),
    deleteList: (_, args, context) => deleteList(args, context),
    getCard: async (_, args, context) => {
      await auth(context.token);
      return Query.getCardById(args.idCard);
    },
    createCard: (_, args, context) => createCard(args, context),
    updateCard: (_, args, context) => updateCard(args, context),
    deleteCard: (_, args, context) => deleteCard(args, context),
    moveList: (_, args, context) => moveList(args, context),
    moveCard: (_, args, context) => moveCard(args, context),
    inviteUsersToBoard: (_, args, context) => inviteUsersToBoard(args, context),
    acceptInviteToBoard: (_, args, context) =>
      acceptInviteToBoard(args, context),
    seenNotification: (_, args, context) => seenNotification(args, context),
    updateBoard: (_, args, context) => updateBoard(args, context),
    removeUserFromBoard: (_, args, context) =>
      removeUserFromBoard(args, context),
    createComment: (_, args, context) => createComment(args, context),
    updateComment: (_, args, context) => updateComment(args, context),
    deleteComment: (_, args, context) => deleteComment(args, context),
    getComments: (_, args, context) => getComments(args, context),
    getLabelsOfBoard: (_, args, context) => getLabelsOfBoard(args, context),
    createLabelOfBoard: (_, args, context) => createLabelOfBoard(args, context),
    updateLabelOfBoard: (_, args, context) => updateLabelOfBoard(args, context),
    deleteLabelOfBoard: (_, args, context) => deleteLabelOfBoard(args, context),
    closeBoard: (_, args, context) => closeBoard(args, context),
    openBoard: (_, args, context) => openBoard(args, context),
    deleteBoard: (_, args, context) => deleteBoard(args, context),
    checkBoard: (_, args, context) => checkBoard(args, context),
  },
  Subscription: {
    test: {
      subscribe: (parent, args, context, info) => {
        const { pubSub } = context;
        return pubSub.asyncIterator(args.id);
      },
      resolve: testSubscribe,
    },
    detailBoard: {
      subscribe: (parent, args, context, info) => {
        const { pubSub } = context;
        return pubSub.asyncIterator(args.idBoard + KEY_BOARD_DETAIL);
      },
      resolve: DetailBoardSubscription,
    },
    checkCloseBoard: {
      subscribe: (parent, args, context, info) => {
        const { pubSub } = context;
        return pubSub.asyncIterator(args.idBoard + KEY_CLOSE_BOARD);
      },
      resolve: checkCloseBoard,
    },
  },
  Board: {
    id: (parent) => parent._id.toString(),
    ownerUser: (parent, args, context) => {
      return Query.getUserById(parent.ownerUser);
    },
    // users: (parent, args, context) => {
    //   return Query.getAllUsersByIds(parent.users);
    // },
    // lists: (parent, args, context) => {
    //   return Query.getAllListsByIds(parent.lists);
    // },
  },
  List: {
    // board: (parent, args, context) => {
    //   return Query.getBoardById(parent.board);
    // },
    id: (parent) => parent._id.toString(),
    cards: (parent, args, context) => {
      return Query.getAllCardsByIds(parent.cards);
    },
    createdBy: (parent, args, context) => {
      return Query.getUserById(parent.createdBy);
    },
  },
  Card: {
    // list: (parent, args, context) => {
    //   return Query.getListById(parent.list);
    // },
    id: (parent) => parent._id.toString(),
    users: (parent, args, context) => {
      return Query.getAllUsersByIds(parent.users);
    },
    comments: (parent, args, context) => {
      return Query.getAllCommentsByIds(parent.comments);
    },
    checkLists: (parent, args, context) => {
      return Query.getAllCheckListsByIds(parent.checkLists);
    },
    createdBy: (parent, args, context) => {
      return Query.getUserById(parent.createdBy);
    },
    labels: (parent, args, context) => {
      return Query.getAllLabelCardsByIds(parent.labels);
    },
  },
  Comment: {
    id: (parent) => parent._id.toString(),
    user: (parent, args, context) => {
      return Query.getUserById(parent.user);
    },
    // card: (parent, args, context) => {
    //   return Query.getCardById(parent.card);
    // },
  },
  CheckList: {
    id: (parent) => parent._id.toString(),
    // card: (parent, args, context) => {
    //   return Query.getCardById(parent.card);
    // },
  },
  Notification: {
    creator: (parent, args, context) => {
      return Query.getUserById(parent.creator);
    },
  },
  LabelCard: {
    id: (parent) => parent._id.toString(),
  },
};

module.exports = resolvers;
