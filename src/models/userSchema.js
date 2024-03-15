const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  email: { type: String },
  fullName: { type: String },
  passWord: { type: String },
  role: { type: String, enum: ["admin", "user"] },
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
