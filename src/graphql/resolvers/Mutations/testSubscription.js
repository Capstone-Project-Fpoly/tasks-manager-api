class MutationSubscriptions {
  static testSubscription(args, context) {
    const { pubSub } = context;
    pubSub.publish("abc", { testSubscription: args });
  }
}
module.exports = MutationSubscriptions;
