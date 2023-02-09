const capitalize = require("../utils/capitalize");
const bcryptjs = require("bcryptjs");

const Company = require("../models/Company.model");
const User = require("../models/User.model");
const Department = require("../models/Department.model");

const getProfilePage = (req, res, next) => {
  res.render("users/profile", {
    style: "users/profile.css",
    currentUser: req.session.currentUser,
  });
};

const postProfilePage = async (req, res, next) => {
  const currentUser = req.session.currentUser;

  const {
    firstName,
    lastName,
    email,
    oldPassword,
    newPassword,
    verifyPassword,
  } = req.body;
  if (!email || !firstName || !lastName) {
    res.render("users/profile", {
      style: "users/profile.css",
      errorMessage: "All fields except password must not be blank",
    });
    return;
  }

  try {
    let hashedPassword;
    if (oldPassword.trim()) {
      if (bcryptjs.compareSync(oldPassword, currentUser.passwordHash)) {
        if (newPassword.trim() && newPassword === verifyPassword) {
          const saltRounds = 10;
          const salt = await bcryptjs.genSalt(saltRounds);
          hashedPassword = await bcryptjs.hash(newPassword, salt);
        } else {
          res.render("users/profile", {
            style: "users/profile.css",
            errorMessage: "New entered passwords don't match!",
            currentUser,
          });
          return;
        }
      } else {
        res.render("users/profile", {
          style: "users/profile.css",
          errorMessage: "Incorrect password",
          currentUser,
        });
        return;
      }
    }

    const editedUser = {
      ...currentUser,
      firstName: firstName,
      lastName: lastName,
      email: email,
      passwordHash: hashedPassword ? hashedPassword : currentUser.passwordHash,
      pictureURL: req.file ? req.file.path : currentUser.pictureURL,
    };

    const changedUserDb = await User.findByIdAndUpdate(
      currentUser._id,
      editedUser,
      { new: true }
    );
    req.session.currentUser = changedUserDb;

    res.redirect("/purchase-portal");
  } catch (error) {
    next(error);
  }
};

const getAdminPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const company = await Company.findById(currentUser.company).populate(
      "users"
    );

    const usersList = company.users;

    const capitalizedUsers = usersList.map((user) => ({
      ...user.toObject(),
      firstName: capitalize(user.firstName),
      lastName: capitalize(user.lastName),
    }));

    res.render("users/admin", {
      style: "users/admin.css",
      currentUser,
      usersList: capitalizedUsers,
    });
  } catch (error) {
    next(error);
  }
};

const filterUserStatus = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const company = await Company.findById(currentUser.company).populate(
      "users"
    );

    const { filterOption } = req.body;
    let filteredUsersList;
    if (filterOption !== "all")
      filteredUsersList = company.users.filter(
        (user) => user.status === capitalize(filterOption)
      );
    else filteredUsersList = company.users;

    res.render("users/admin", {
      style: "users/admin.css",
      currentUser,
      usersList: filteredUsersList,
      filterOption,
    });
  } catch (error) {
    next(error);
  }
};

const postAdminPage = async (req, res, next) => {
  const { status, role, id, process, department } = req.body;

  try {
    const companyId = req.session.currentUser.company;
    const user = await User.findById(id);
    if (process === "Save changes") {
      user.role = role;

      if (user.department !== department) {
        const oldDepartment = user.department;
        const usersOldDepartment = await Department.findOne({
          name: oldDepartment,
          company: companyId,
        });

        if (usersOldDepartment) {
          usersOldDepartment.users.pull({ _id: user._id });

          await usersOldDepartment.save();
        }

        const newDepartment = await Department.findOne({
          name: department,
          company: companyId,
        });

        if (!newDepartment) {
          const createNewDepartment = await Department.create({
            name: department,
            company: companyId,
            users: [user._id],
          });

          console.log(
            "A new department was successfully created, and the user added to it: ",
            createNewDepartment
          );
        } else {
          newDepartment.users.push(user._id);

          await newDepartment.save();

          console.log(
            "The user was succesfully moved to the new department: ",
            newDepartment
          );
        }

        user.department = department;
      }
    }
    if (process === "Remove") user.status = "Removed";
    if (process === "Reinstate") user.status = "Approved";
    if (status) user.status = status;

    await user.save();

    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

const getUserNotApprovedPage = (req, res, next) => {
  res.render("users/not-approved", {
    style: "users/not-approved.css",
    currentUser: req.session.currentUser,
  });
};

module.exports = {
  getProfilePage,
  postProfilePage,
  getAdminPage,
  filterUserStatus,
  postAdminPage,
  getUserNotApprovedPage,
};
