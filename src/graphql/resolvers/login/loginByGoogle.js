const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const UserModel = require("../../../models/userSchema");
const authDeviceId = require("../Service/authDeviceId");

const linkGoogleWithEmail = async (decodedToken) => {
  const existingUser = await admin.auth().getUserByEmail(decodedToken.email);
  if (!existingUser) return;
  const uid = existingUser.uid;
  await admin.auth().updateUser(uid, {
    email: existingUser.email,
    emailVerified: true,
    displayName: decodedToken.name,
    photoURL: decodedToken.picture,
  });
  await UserModel.updateOne(
    { uid },
    {
      email: existingUser.email,
      avatar: decodedToken.picture,
      fullName: decodedToken.name,
      updatedAt: new Date().toISOString(),
    }
  );
};

module.exports = async (parent, args, context) => {
  const input = args.input;
  const idToken = input.idToken;
  const deviceId = input.deviceId;

  const decodedToken = jwt.decode(idToken);
  if (!decodedToken) throw new Error("Failed to login google");
  const currentDate = new Date().toISOString();
  const uid = decodedToken.user_id;
  const findUser = await UserModel.findOne({ uid });
  if (findUser.isBanned) throw new Error("Tài khoản của bạn đã bị khóa!");
  if (findUser) {
    await linkGoogleWithEmail(decodedToken);
    const jwtToken = jwt.sign({ uid }, process.env.KEY);
    await authDeviceId(uid, jwtToken, deviceId);
    return jwtToken;
  }
  const user = new UserModel({
    uid: decodedToken.user_id,
    avatar: decodedToken.picture,
    email: decodedToken.email,
    fullName: decodedToken.name,
    createdAt: currentDate,
    updatedAt: currentDate,
  });
  await user.save().catch((err) => {
    throw new Error(err);
  });
  const jwtToken = jwt.sign({ uid: uid }, process.env.KEY);
  authDeviceId(uid, jwtToken, deviceId);
  return jwtToken;
};
