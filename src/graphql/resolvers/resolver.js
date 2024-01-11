const { createPubSub } = require('graphql-yoga');
const me = require('./Queres/me');
const getToken = require('./getToken');
const loginByPhone = require('./login/loginByPhone');
const { PubSub } = require("graphql-subscriptions");
const pubSub = new PubSub();
const resolvers = {
    Query: {
        getToken: getToken,
        me: me,
    },
    Mutation: {
        loginByGoogle: loginByPhone,
        testCallSubscription: () => pubSub.publish("abc", {test:'mmmm'}),
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
    }
}

module.exports = resolvers;
