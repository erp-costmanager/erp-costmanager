const bcryptjs = require("bcryptjs");

const Company = require("../models/Company.model");
const User = require("../models/User.model");

const getSignup = (req, res, next) => {
  res.render("signup", { style: "signup.css" });
};

const postSignup = async (req, res, next) => {
  try {
    //@TODO: Update the routes to render the correct page when the user has signed up, based on their role. Admins go straight in, but Users have to wait for approval.

    const saltRounds = 10;

    const { company, email, firstName, lastName, password } = req.body;

    const saltedPassword = await bcryptjs.genSalt(saltRounds);

    const hashedPassword = await bcryptjs.hash(password, saltedPassword);

    const companyInDb = await Company.findOne({ name: company });

    if (companyInDb) {
      const newUser = await User.create({
        company: companyInDb._id,
        email,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        role: "Employee",
        status: "Pending",
      });

      companyInDb.users.push(newUser._id);

      console.log("Successfully created a new user: ", newUser);
      res.redirect("/signup");
    } else {
      let newCompany = await Company.create({ name: company });

      let newUser = await User.create({
        company: newCompany._id,
        email,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        role: "Admin",
        status: "Approved",
      });

      newCompany.users = [newUser._id];

      console.log("Successfully created a new user: ", newUser);
      console.log("Successfully created a new company: ", newCompany);
      res.redirect("/signup");
    }
  } catch (error) {
    console.log("An error occured while signing up a new user: ", error);
  }
};

module.exports = { getSignup, postSignup };
