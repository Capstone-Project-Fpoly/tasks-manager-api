const jwt = require("jsonwebtoken");
const UserModel = require("../models/userSchema");
const auth = async (token) => {
  if (!token) {
    throw new Error("Đăng nhập mới được lấy data");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.KEY);
  } catch (err) {
    throw new Error("Token không hợp lệ. Đăng nhập lại.");
  }

  const uid = decodedToken.uid;
  const user = await UserModel.findOne({ uid });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  if (user.isBanned) {
    throw new Error("Tài khoản của bạn đã bị khóa!");
  }

  return user;
};

module.exports = auth;
