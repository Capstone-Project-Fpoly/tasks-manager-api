const jwt = require("jsonwebtoken");
const UserModel = require("../../models/userSchema");
UserModel
module.exports = async (parent, args, token) => {
    if (!args.email) throw new Error('Email không được để trống');
    const email = args.email;
    const user = await UserModel.findOne({ email });
    const uid = user.uid;
    const jwtToken = jwt.sign({ uid }, process.env.KEY);
    return jwtToken;
}