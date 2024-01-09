const jwt = require('jsonwebtoken');
const UserModel = require('../../models/userSchema');
module.exports = async (token) => {
    if(!token) throw new Error('Đăng nhập mới được lấy data');
    const uid = jwt.verify(token, process.env.KEY);
    const user = await UserModel.findOne({uid});
    return user;
}