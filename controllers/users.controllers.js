const capitalize = require("../utils/capitalize");
const bcryptjs = require("bcryptjs");

const Purchase = require("../models/Purchase.model");
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

const getUserEditPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const purchaseId = req.params.purchaseId;
    const purchaseRequest = await Purchase.findById(purchaseId).populate(
      "createdBy"
    );

    res.render("users/edit-user", {
      style: "users/edit-user.css",
      currentUser,
      purchaseRequest,
    });
  } catch (error) {
    next(error);
  }
};

const postUserEditPage = async (req, res, next) => {
  try {
    const { id, item, cost, reason } = req.body;

    if (typeof Number(cost) !== "number" || Number(cost) < 0) {
      try {
        const currentUser = req.session.currentUser;
        const purchaseId = req.params.purchaseId;
        const purchaseRequest = await Purchase.findById(purchaseId).populate(
          "createdBy"
        );

        res.render("users/edit-user", {
          style: "users/edit-user.css",
          currentUser,
          purchaseRequest,
          errorMessage:
            "The entered cost has to be a number larger than or equal to 0",
        });
      } catch (error) {
        next(error);
      }
    }

    if (!item || !cost || !reason) {
      try {
        const currentUser = req.session.currentUser;
        const purchaseId = req.params.purchaseId;
        const purchaseRequest = await Purchase.findById(purchaseId).populate(
          "createdBy"
        );

        res.render("users/edit-user", {
          style: "users/edit-user.css",
          currentUser,
          purchaseRequest,
          errorMessage:
            "All of the fields must be filled in to edit a purchase request ",
        });
      } catch (error) {
        next(error);
      }
    }

    const editedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
      item,
      cost,
      reason,
    });

    console.log(
      "Successfully edited the purchase request: ",
      editedPurchaseRequest
    );

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
  getUserEditPage,
  postUserEditPage,
  getProfilePage,
  postProfilePage,
  getAdminPage,
  filterUserStatus,
  postAdminPage,
  getUserNotApprovedPage,
};
