const { createPubSub } = require('graphql-yoga');
const me = require('./Queres/me');
const getToken = require('./getToken');
const loginByPhone = require('./login/loginByPhone');
const { PubSub } = require("graphql-subscriptions");
const Query = require('./Service/queryService');
const { createBoard, getBoards } = require('./Mutations/Board.Mutations');
const pubSub = new PubSub();
const resolvers = {
    Query: {
        getToken: getToken,
        me: me,
    },
    Mutation: {
        loginByGoogle: loginByPhone,
        testCallSubscription: () => pubSub.publish("abc", {test:'mmmm'}),
        createBoard: (parent, args, context) => createBoard(args,context),
        getBoards:(parent, args, context) => getBoards(args,context),
    },
    Subscription: {
        test: {
            subscribe: (parent, args, context, info) => {
                return pubSub.asyncIterator("abc");
            },
            resolve: (payload, args, context, info) => {
                console.log("User ID:", payload.userId);
                console.log(args,context,payload);
                return payload.test;
            },
        },
    },
    Board: {
        ownerUser: (parent, args, context) => {
            return Query.getUserById(parent.ownerUser, context.token);
        },
        users: (parent, args, context) => {
            return Query.getAllUsersByIds(parent.users, context.token);
        },
        lists: (parent, args, context) => {
            return Query.getAllListsByIds(parent.lists, context.token);
        },
    },
    List: {
        board: (parent, args, context) => {
            return Query.getBoardById(parent.board, context.token);
        },
        cards: (parent, args, context) => {
            return Query.getAllCardsByIds(parent.cards, context.token);
        },
    },
    Card: {
        list: (parent, args, context) => {
            return Query.getListById(parent.list, context.token);
        },
        users: (parent, args, context) => {
            return Query.getAllUsersByIds(parent.users, context.token);
        },
        comments: (parent, args, context) => {
            return Query.getAllCommentsByIds(parent.comments, context.token);
        },
        checkLists: (parent, args, context) => {
            return Query.getAllCheckListsByIds(parent.checkLists, context.token);
        },
    },
    Comment: {
        user: (parent, args, context) => {
            return Query.getUserById(parent.user, context.token);
        },
        card: (parent, args, context) => {
            return Query.getCardById(parent.card, context.token);
        },
    },
    CheckList: {
        card: (parent, args, context) => {
            return Query.getCardById(parent.card, context.token);
        },
    },
    
}

module.exports = resolvers;
