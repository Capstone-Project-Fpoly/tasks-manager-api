const jwt = require('jsonwebtoken');
const UserModel = require('../../models/userSchema');
const auth = async (token) => {
    if(!token) throw new Error('Đăng nhập mới được lấy data');
    const decodedToken = jwt.verify(token, process.env.KEY);
    const uid = decodedToken.uid;
    const user = await UserModel.findOne({ uid });
    return user;
}


module.exports = auth;