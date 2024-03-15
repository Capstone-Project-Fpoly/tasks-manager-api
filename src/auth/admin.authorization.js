const auth = require("./authorization");
const adminAuth = async (authorization) => {
  const token = authorization.toString().split(" ")[1];
  var user;
  try {
    user = await auth(token);
  } catch (error) {
    throw new Error("Token không hợp lệ. Đăng nhập lại.");
  }
  if (user.role !== "admin") {
    throw new Error("Bạn không có quyền truy cập.");
  }
  return user;
};
module.exports = adminAuth;
