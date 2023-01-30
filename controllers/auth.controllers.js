const bcryptjs = require("bcryptjs");

const Company = require("../models/Company.model");
const User = require("../models/User.model");

const getUserSignup = (req, res, next) =>
  res.render("auth/userSignup", { style: "auth/signup.css" });

const postUserSignup = async (req, res, next) => {
  try {
    const { company, email, firstName, lastName, password } = req.body;

    if (!company || !email || !password || !firstName || !lastName) {
      res.render("auth/userSignup", {
        style: "auth/signup.css",
        errorMessage: "All fields are required",
      });
      return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

    if (!regex.test(password)) {
      res.status(500).render("auth/userSignup", {
        style: "auth/signup.css",
        errorMessage:
          "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
      });
      return;
    }

    const saltRounds = 10;
    const salt = await bcryptjs.genSalt(saltRounds);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const companyInDb = await Company.findOne({ name: company });

    if (!companyInDb) {
      res.render("auth/userSignup", {
        style: "auth/signup.css",
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
    next(error);
  }
};

const getCompanySignup = (req, res, next) =>
  res.render("auth/companySignup", { style: "auth/signup.css" });

const postCompanySignup = async (req, res, next) => {
  try {
    const { company, email, firstName, lastName, password } = req.body;

    if (!company || !email || !password || !firstName || !lastName) {
      res.render("auth/companySignup", {
        style: "auth/signup.css",
        errorMessage: "All fields are required",
      });
      return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

    if (!regex.test(password)) {
      res.status(500).render("auth/companySignup", {
        style: "auth/signup.css",
        errorMessage:
          "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
      });
      return;
    }

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
    next(error);
  }
};

const getLogin = (req, res, next) =>
  res.render("auth/login", { style: "auth/login.css" });

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.render("auth/login", {
      style: "auth/login.css",
      errorMessage: "All fields are required",
    });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (user && bcryptjs.compareSync(password, user.passwordHash)) {
      req.session.currentUser = user;
      console.log("Current user: ", req.session.currentUser);
      res.redirect("/user");
    } else {
      res.render("auth/login", {
        style: "auth/login.css",
        errorMessage: "User or email invalid.",
      });
    }
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) next(error);
  });
  res.redirect("/login");
};

module.exports = {
  getUserSignup,
  postUserSignup,
  getCompanySignup,
  postCompanySignup,
  getLogin,
  postLogin,
  logout,
};
