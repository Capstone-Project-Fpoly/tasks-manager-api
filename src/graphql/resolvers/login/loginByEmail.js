const jwt = require("jsonwebtoken");
const UserModel = require("../../../models/userSchema");

const loginByEmail = async (args, context) => {
  try {
    const idToken = args.idToken;
    const decodedToken = jwt.decode(idToken);
    const uid = decodedToken.user_id;
    const findUser = await UserModel.findOne({ uid });
    if (!findUser) throw new Error("Đăng nhập thất bại hoặc sai mật khẩu!");
    const jwtToken = jwt.sign({ uid }, process.env.KEY);
    return jwtToken;
  } catch (error) {
    throw new Error("Đăng nhập thất bại hoặc sai mật khẩu!");
  }
};

module.exports = loginByEmail;