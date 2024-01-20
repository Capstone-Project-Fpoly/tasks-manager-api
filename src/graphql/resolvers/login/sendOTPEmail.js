const { regexEmail } = require("../Service/regex");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

const generateRandomOTP = async () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const saveOTPToFirebase = async (email, otp) => {
  const otpDoc = await admin.firestore().collection("otps").doc(email).get();
  if (otpDoc.exists) {
    const s = await admin.firestore().collection("otps").doc(email).update({
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await admin.firestore().collection("otps").doc(email).set({
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
};

const sendOTPEmail = async (args, context) => {
  const email = args.email;
  if (!regexEmail(email)) throw new Error("Email không đúng định dạng");
  const otp = await generateRandomOTP();
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_SEND_EMAIL,
      pass: process.env.PASS_SEND_EMAIL,
    },
  });
  let mailOptions = {
    from: process.env.USER_SEND_EMAIL,
    to: email,
    subject: "Email Xác Minh",
    text: `Mã xác minh của bạn là: ${otp}.`,
  };
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      throw new Error(`Lỗi khi gửi mã xác nhận Email: ${error}`);
    }
  });
  await saveOTPToFirebase(email, otp);
  return true;
};
module.exports = sendOTPEmail;
