const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const UserModel = require("../models/userSchema");
const analyticsDataClient = new BetaAnalyticsDataClient();
const adminAuth = require("../auth/admin.authorization");

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

    console.log("Report result:");
    response.rows.forEach((row) => console.log(row));
  }
  async getUsers(req, res) {
    const authorization = req.headers.authorization;
    let user;
    try {
      user = await adminAuth(authorization);
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ message: "Trang hoặc giới hạn không hợp lệ." });
    }

    const offset = (page - 1) * limit;

    const users = await UserModel.find(
      { _id: { $ne: user._id } },
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
}
module.exports = new AdminController();
