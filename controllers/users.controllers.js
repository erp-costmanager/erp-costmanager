const capitalize = require("../utils/capitalize");
const bcryptjs = require("bcryptjs");
const transporter = require("../config/nodemailer");

const Company = require("../models/Company.model");
const User = require("../models/User.model");

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
  const { status, role, id, process } = req.body;

  try {
    const user = await User.findById(id);
    console.log(status, role, process);
    console.log(user.status, user.role);
    let emailMessage, emailSubject;
    if (
      (status && status !== user.status) ||
      (role && role !== user.role) ||
      process !== "Save changes"
    ) {
      if ((status && user.status !== status) || process === "Reinstate") {
        if (status === "Approved" || process === "Reinstate") {
          emailSubject = "Your request at Purchase manager has been approved!";
          if (role === "Employee" || (!role && user.role === "Employee"))
            emailMessage = `You have been granted regular access to the purchase portal! You can now create new purchase requests at purchase manager.`;
          if (role === "Manager" || (!role && user.role === "Manager"))
            emailMessage = `Your access as manager has been granted. You now have access to approve new purchase requests`;
          if (role === "Admin" || (!role && user.role === "Admin"))
            emailMessage =
              "Your access as an administrator has been granted. You now have access to the admin portal and can validate new users and set their roles in the company";
        } else if (status === "Disapproved") {
          emailSubject = "Access to purchase manager denied";
          emailMessage =
            "Your request to purchase manager hase been denied. Please contact your company administrator.";
        }
      } else if (role !== user.role) {
        emailSubject = "Your access at Purchase manager has changed!";
        if (role === "Employee")
          emailMessage = `You have been granted regular access to the purchase portal! You can now create new purchase requests at purchase manager.`;
        if (role === "Manager")
          emailMessage = `You have been granted access as manager. You now have access to approve new purchase requests`;
        if (role === "Admin")
          emailMessage =
            "You have been granted access as administrator. You now have access to the admin portal and can validate new users and set their roles in the company";
      } else if (process === "Remove") {
        emailSubject = "Access to purchase manager revoked";
        emailMessage =
          "Your access to purchase manager hase been removed. Looks like you're leaveng the company. If this seems to be an error please contact your company administrator.";
      }
      await transporter.sendMail({
        from: "noreply@purchase-manager.com",
        to: user.email,
        subject: emailSubject,
        text: emailMessage,
      });
    }

    if (process === "Save changes") user.role = role;
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
