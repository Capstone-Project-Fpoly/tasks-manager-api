const jwt = require('jsonwebtoken');
const UserModel = require('../../../models/userSchema')
module.exports = async (parent, args, context) => {
    const re = await context.pubSub.publish("abc", {message: 'abc'});
    // const decodedToken = jwt.decode(args.idToken);
    // if (!decodedToken) throw new Error('Failed to login google');
    // const currentDate = new Date();
    // const uid = decodedToken.user_id;
    // const findUser = await UserModel.findOne({ uid });
    // if (findUser) {
    //     const jwtToken = jwt.sign({ uid }, process.env.KEY);
    //     return jwtToken;
    // }
    // const user = new UserModel({
    //     uid: decodedToken.user_id,
    //     avatar: decodedToken.picture,
    //     email: decodedToken.email,
    //     fullName: decodedToken.name,
    //     createdAt: currentDate,
    //     updatedAt: currentDate,
    // })
    // await user.save().catch((err) => {
    //     throw new Error(err);
    // });
    // const jwtToken = jwt.sign({ uid: uid }, process.env.KEY);
    // return jwtToken;
};