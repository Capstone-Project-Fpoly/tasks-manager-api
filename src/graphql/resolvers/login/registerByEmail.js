const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const UserModel = require("../../../models/userSchema");
const { regexEmail } = require("../Service/regex");
const registerByEmail = async (args, context) => {
  const input = args.input;
  const email = input.email;
  const passWord = input.passWord;
  if (!regexEmail(email)) {
    throw new Error("Email không đúng định dạng");
  }
  const passWordJWT = jwt.sign({ passWord: passWord }, process.env.KEY);
  const userRecord = await UserModel.findOne({ email: email });
  if (!userRecord) {
    const displayName = email.split("@")[0];
    const newUser = await admin.auth().createUser({
      email,
      password: passWord,
      displayName: displayName,
      photoURL:
        "https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg",
    });

    const user = new UserModel({
      uid: newUser.uid,
      avatar: newUser.photoURL,
      email: newUser.email,
      fullName: newUser.displayName,
      passWord: passWordJWT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await user.save();
    const token = jwt.sign({ uid: newUser.uid }, process.env.KEY);
    return token;
  }
  if (userRecord.passWord) throw new Error("Email đã tồn tại");
  await admin.auth().updateUser(userRecord.uid, {
    emailVerified: true,
    email: email,
    password: passWord,
  });
  await UserModel.updateOne(
    { email: email },
    { $set: { passWord: passWordJWT } }
  );
  const token = jwt.sign({ uid: userRecord.uid }, process.env.KEY);
  return token;
};

module.exports = registerByEmail;
