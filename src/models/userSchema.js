const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  avatar: {type:String,unique: true},
  createdAt: {type:String,unique: true},
  updatedAt: {type:String,unique: true},
  email: {type:String,unique: true},
  fullName: {type:String,unique: true},
});

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;