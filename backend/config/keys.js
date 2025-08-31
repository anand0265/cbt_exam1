// if (process.env.NODE_ENV === "production") {
//   module.exports = require("./prod");
// } else {
//   module.exports = require("./dev");
// }

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "dshksahdfkjashdkahjs",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  EMAIL: process.env.EMAIL || "khazaanacoupon@gmail.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  CLIENT_URL: process.env.CLIENT_URL,
};
