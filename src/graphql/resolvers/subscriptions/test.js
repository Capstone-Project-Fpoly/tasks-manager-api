const { PubSub } = require("graphql-subscriptions");

const pubSub = new PubSub();
const test = {
  subscribe: (parent, args, context, info) => {
    console.log("sssssssssss", info);
    return pubSub.asyncIterator(args.id);
  },
  resolve: (payload, args, context, info) => {
    console.log("User ID:", payload.context);
    console.log(args, context, payload);
    return payload.abc;
  },
};

module.exports = test;
