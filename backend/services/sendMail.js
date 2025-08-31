// const nodemailer = require("nodemailer");
// const { SENDGRID_API_KEY, EMAIL } = require("../config/keys");

// const sendgridTransport = require("nodemailer-sendgrid-transport");

// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key: SENDGRID_API_KEY,
//     },
//   })
// );

// let sendMail = (toId, sub, text) => {
//   return transporter.sendMail({
//     to: toId,
//     from: EMAIL,
//     subject: sub,
//     html: `<h4>${text}</h4>`,
//   });
// };

// module.exports = { sendMail };

const nodemailer = require("nodemailer");
const { EMAIL, EMAIL_PASSWORD } = require("../config/keys");

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // fix self-signed cert error
  },
});

const sendMail = (toId, sub, text) => {
  return transporter.sendMail({
    from: EMAIL, // your Gmail
    to: toId, // recipient
    subject: sub,
    html: `<h4>${text}</h4>`,
  });
};

module.exports = { sendMail };
