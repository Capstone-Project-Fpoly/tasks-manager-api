class Subscriptions {
  static testSubscription(args, context, pubSub) {
    console.log(args);
    pubSub.publish("abc", { testSubscription: args });
  }
}
module.exports = Subscriptions;
