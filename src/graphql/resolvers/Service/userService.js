const UserModel = require("../../../models/userSchema");
const getUserById = async (uid) => {
    if(!uid) return null;
    const user = await UserModel.findOne({ uid });
    return user;
};

module.exports = { getUserById };