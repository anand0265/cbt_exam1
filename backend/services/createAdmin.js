// var {User} = require("../models/user");
// const bcrypt = require("bcrypt");

// //create admin
// var createadmin = async () => {
//   const user = new User({
//     name: "admin",
//     password: "admin",
//     email: "admin@admin.com",
//     category: "ADMIN",
//   });

//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(user.password, salt);

//   await user.save();
//   console.log("Admin created");
// };

// module.exports = createadmin;

var { User } = require("../models/user");
const bcrypt = require("bcrypt");

// Create admin only if it doesn't exist
var createadmin = async () => {
  // Check if an admin already exists
  const existingAdmin = await User.findOne({ email: "admin@admin.com" });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const user = new User({
    name: "admin",
    password: "admin",
    email: "admin@admin.com",
    category: "ADMIN",
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  console.log("Admin created");
};

module.exports = createadmin;
