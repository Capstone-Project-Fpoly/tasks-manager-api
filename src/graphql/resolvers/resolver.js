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

const auth = require("./authorization");
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

const pubSub = new PubSub();

const resolvers = {
  Query: {
    getToken: getToken,
    me: me,
    notificationCollection: (_, args, context) =>
      getNotifications(args, context),
    getUsersInviteToBoard: (_, args, context) =>
      getUsersInviteToBoard(args, context),
    getUsersOfBoard: (_, args, context) => getUsersOfBoard(args, context),
  },
  Mutation: {
    loginByGoogle: loginByGoogle,
    testCallSubscription: () =>
      pubSub.publish("123", { abc: "mmmm", ayx: "hhhhh" }),
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
  },
  Subscription: {
    test: {
      subscribe: (parent, args, context, info) => {
        console.log("args", args);
        return pubSub.asyncIterator(args.id);
      },
      resolve: (payload, args, context, info) => {
        console.log("User ID:", payload.userId);
        console.log(args, context, payload);
        return payload.abc;
      },
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
};

module.exports = resolvers;
