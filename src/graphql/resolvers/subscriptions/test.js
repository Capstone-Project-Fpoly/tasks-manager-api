class TestSubscriptions {
  static testSubscribe = (parent, args, context, info) => {
    console.log(parent);
    return "abc";
  };
}

module.exports = TestSubscriptions;
