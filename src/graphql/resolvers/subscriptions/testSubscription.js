class Subscriptions {
  static testSubscription(args, context, pubSub) {
    console.log(args);
    pubSub.publish("123", { testSubscription: args });
  }
}
module.exports = Subscriptions;
