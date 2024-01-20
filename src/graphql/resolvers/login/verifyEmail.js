const { regexEmail } = require("../Service/regex");
const admin = require("firebase-admin");

const getOTPFromFirebase = async (email) => {
  const otpDoc = await admin.firestore().collection("otps").doc(email).get();
  return otpDoc.data();
};

const verifyEmail = async (args, context) => {
  const input = args.input;
  const email = input.email;
  const otp = input.otp;

  if (!regexEmail(email)) {
    throw new Error("Email không đúng định dạng");
  }

  const otpData = await getOTPFromFirebase(email);

  if (!otpData || otpData.otp !== otp) {
    throw new Error("Mã OTP không hợp lệ");
  }

  const createdAtTimestamp = otpData.createdAt.toMillis();
  const currentTimestamp = Date.now();
  const timeDifference = currentTimestamp - createdAtTimestamp;
  const expirationTime = 5 * 60 * 1000;

  if (timeDifference > expirationTime) {
    throw new Error("Mã OTP đã hết hạn");
  }

  return true;
};

module.exports = verifyEmail;
