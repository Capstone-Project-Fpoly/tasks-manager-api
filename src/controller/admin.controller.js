const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const UserModel = require("../models/userSchema");
const analyticsDataClient = new BetaAnalyticsDataClient();
const adminAuth = require("../auth/admin.authorization");
const admin = require("firebase-admin");
const hashText = require("../utils/hash-text");
const { regexEmail } = require("../graphql/resolvers/Service/regex");

class AdminController {
  async index(req, res) {
    const [response] = await analyticsDataClient.runReport({
      property: "properties/6522057001",
      dateRanges: [
        {
          startDate: "2020-03-31",
          endDate: "today",
        },
      ],
      dimensions: [
        {
          name: "city",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
      ],
    });
    response.rows.forEach((row) => console.log(row));
  }
  async getUsers(req, res) {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập. Hãy thử lại." });
    }
    let user;
    try {
      user = await adminAuth(authorization);
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const query = req.query.query || "";

    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ message: "Trang hoặc giới hạn không hợp lệ." });
    }

    const offset = (page - 1) * limit;

    const users = await UserModel.find(
      {
        $or: [
          { email: { $regex: query, $options: "i" } },
          { fullName: { $regex: query, $options: "i" } },
        ],
      },
      { passWord: 0, _id: 0, __v: 0 }
    )
      .limit(limit)
      .skip(offset)
      .exec();

    if (!users) {
      throw new Error("Không tìm thấy người dùng nào.");
    }

    const totalUser = await UserModel.countDocuments();
    const totalPage = Math.ceil(totalUser / limit);

    res.json({ page, limit, totalPage, totalUser, users });
  }

  async accountDetail(req, res) {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập. Hãy thử lại." });
    }
    let userModel;
    try {
      userModel = await adminAuth(authorization);
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
    res.json(userModel);
  }

  async createUsers(req, res) {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập. Hãy thử lại." });
    }
    let user;
    try {
      user = await adminAuth(authorization);
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền tạo người dùng." });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Vui lòng nhập thông tin." });
    }

    const { email, fullname, password, role, is_banned } = req.body;

    if (!email || !fullname || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    if (!regexEmail(email)) {
      throw new Error("Email không đúng định dạng");
    }

    const userRecord = await UserModel.findOne({ email: email });
    if (userRecord) {
      return res.status(400).json({ message: "Người dùng đã tồn tại." });
    }

    const newUser = await admin.auth().createUser({
      email,
      password: password,
      displayName: fullname,
      photoURL:
        "https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg",
    });
    const hashPass = await hashText(password);

    const newUserModel = new UserModel({
      uid: newUser.uid,
      avatar: newUser.photoURL,
      email: newUser.email,
      fullName: newUser.displayName,
      passWord: hashPass,
      role: role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBanned: is_banned || false,
    });
    await newUserModel.save();

    res.json({ message: "Tạo người dùng thành công.", newUserModel });
  }

  async banUser(req, res) {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập. Hãy thử lại." });
    }
    let user;
    try {
      user = await adminAuth(authorization);
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cấm người dùng." });
    }

    const { uid } = req.body;
    if (!uid) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn người muốn khóa." });
    }

    const userRecord = await UserModel.findOne({ uid: uid });
    if (!userRecord) {
      return res.status(400).json({ message: "Người dùng không tồn tại." });
    }

    userRecord.isBanned = true;
    await userRecord.save();

    res.json({ message: "Khóa người dùng thành công." });
  }
}
module.exports = new AdminController();
