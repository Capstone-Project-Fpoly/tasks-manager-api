const jwt = require("jsonwebtoken");
const UserModel = require("../../../models/userSchema");
const authDeviceId = require("../Service/authDeviceId");

const loginByEmail = async (args, context) => {
  const input = args.input;
  const idToken = input.idToken;
  const deviceId = input.deviceId;
  try {
    const decodedToken = jwt.decode(idToken);
    const uid = decodedToken.user_id;
    const findUser = await UserModel.findOne({ uid });
    if (!findUser) throw new Error("Đăng nhập thất bại hoặc sai mật khẩu!");
    const jwtToken = jwt.sign({ uid }, process.env.KEY);
    authDeviceId(uid, jwtToken, deviceId);
    return jwtToken;
  } catch (error) {
    throw new Error("Đăng nhập thất bại hoặc sai mật khẩu!");
  }
};

module.exports = loginByEmail;
