const jwt = require("jsonwebtoken");
const UserModel = require("../../models/userSchema");
const admin = require("firebase-admin");
module.exports = async (parent, args, token) => {
  if (!args.email) throw new Error("Email không được để trống");
  const email = args.email;
  const user = await UserModel.findOne({ email });
  const uid = user.uid;
  const userRecord = await admin.app();

  console.log(userRecord);
  // const jwtToken = jwt.sign({ uid }, process.env.KEY);
  // return jwtToken;
};
