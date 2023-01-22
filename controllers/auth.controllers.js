const bcryptjs = require("bcryptjs");

const Company = require("../models/Company.model");
const User = require("../models/User.model");

const getUserSignup = (req, res, next) =>
  res.render("auth/userSignup", { style: "auth/signup.css" });

const postUserSignup = async (req, res, next) => {
  try {
    //@TODO: Update the routes to render the correct page when the user has signed up, based on their role. Admins go straight in, but Users have to wait for approval.
    const { company, email, firstName, lastName, password } = req.body;

    const saltRounds = 10;
    const salt = await bcryptjs.genSalt(saltRounds);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const companyInDb = await Company.findOne({ name: company });

    if (!companyInDb) {
      res.render("auth/userSignup", {
        style: "auth/userSignup.css",
        errorMessage: "No company found with this name.",
      });
      return;
    }

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
    await companyInDb.save();

    console.log("Successfully created a new user: ", newUser);
    res.redirect("/login");
  } catch (error) {
    next(error)
  }
};

const getCompanySignup = (req, res, next) =>
  res.render("auth/companySignup", { style: "auth/signup.css" });

const postCompanySignup = async (req, res, next) => {
  try {
    //@TODO: Update the routes to render the correct page when the user has signed up, based on their role. Admins go straight in, but Users have to wait for approval.

    const { company, email, firstName, lastName, password } = req.body;

    const saltRounds = 10;
    const salt = await bcryptjs.genSalt(saltRounds);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newCompany = await Company.create({ name: company });

    const newUser = await User.create({
      company: newCompany._id,
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      role: "Admin",
      status: "Approved",
    });

    newCompany.users = [newUser._id];
    await newCompany.save();

    console.log("Successfully created a new user: ", newUser);
    console.log("Successfully created a new company: ", newCompany);
    res.redirect("/login");
  } catch (error) {
    next(error)
  }
};

const getLogin = (req, res, next) => res.render("auth/login", { style: "auth/login.css" })

module.exports = {
  getUserSignup,
  postUserSignup,
  getCompanySignup,
  postCompanySignup,
  getLogin
};
