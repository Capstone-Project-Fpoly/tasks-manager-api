class Subscriptions {
  static testSubscription(args, context, pubSub) {
    pubSub.publish("abc", { testSubscription: args });
  }
}
module.exports = Subscriptions;
