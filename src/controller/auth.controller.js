const bcrypt = require("bcrypt");
const UserModel = require("../models/userSchema");
const jwt = require("jsonwebtoken");
class AuthController {
  async login(req, res) {
    if (!req.body) {
      return res.status(400).json({ message: "Vui lòng nhập thông tin" });
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }
    bcrypt.compare(password, user.passWord).then((checkPass) => {
      if (!checkPass) {
        return res.status(401).json({ message: "Mật khẩu không đúng" });
      }
      const token = jwt.sign({ uid: user.uid }, process.env.KEY);
      return res.status(200).json({ token });
    });
  }
}
module.exports = new AuthController();
