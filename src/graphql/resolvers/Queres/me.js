const auth = require("../authorization");

module.exports = async (parent, args, context) => {
  const user = await auth(context.token);
  return user;
};
