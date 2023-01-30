const capitalize = require("../utils/capitalize");
const bcryptjs = require("bcryptjs");

const Purchase = require("../models/Purchase.model");
const Company = require("../models/Company.model");
const User = require("../models/User.model");

const getUserPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const purchaseRequests = await Purchase.find({
      company: currentUser.company,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy");

    res.render("users/user", {
      style: "users/user.css",
      currentUser,
      purchaseRequests,
    });
  } catch (error) {
    next(error);
  }
};

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

    res.redirect("/user");
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

    const editedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
      item,
      cost,
      reason,
    });

    console.log(
      "Successfully edited the purchase request: ",
      editedPurchaseRequest
    );

    res.redirect("/user");
  } catch (error) {
    next(error);
  }
};

const postNewPurchase = async (req, res, next) => {
  try {
    const { item, cost, reason } = req.body;
    const createdBy = req.session.currentUser._id;
    const status = "Pending";
    const company = req.session.currentUser.company;

    const newPurchase = await Purchase.create({
      item,
      cost,
      reason,
      company,
      createdBy,
      status,
    });

    console.log(
      "A new purchase request was successfully created: ",
      newPurchase
    );

    res.redirect("/user");
  } catch (error) {
    console.log(
      "An error occurred while adding a new purchase request: ",
      error
    );
    next(error);
  }
};

const postFilterPurchaseRequests = async (req, res, next) => {
  try {
    const { filterOption } = req.body;
    const userId = req.session.currentUser._id;
    const userCompany = req.session.currentUser.company;

    console.log("Current user id: ", userId);

    let purchaseRequests;

    switch (filterOption) {
      case "all":
        const allRequests = await Purchase.find({
          company: userCompany,
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");
        purchaseRequests = allRequests;
        break;

      case "pending":
        const pendingRequests = await Purchase.find({
          company: userCompany,
          status: "Pending",
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");

        purchaseRequests = pendingRequests;
        break;

      case "approved":
        const approvedRequests = await Purchase.find({
          company: userCompany,
          status: "Approved",
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");

        purchaseRequests = approvedRequests;
        break;

      case "disapproved":
        const disapprovedRequests = await Purchase.find({
          company: userCompany,
          status: "Disapproved",
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");

        purchaseRequests = disapprovedRequests;
        break;

      case "myRequests":
        const myRequests = await Purchase.find({
          company: userCompany,
          createdBy: userId,
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");

        purchaseRequests = myRequests;
        break;
    }

    const currentUser = req.session.currentUser;

    res.render("users/user", {
      style: "users/user.css",
      currentUser,
      purchaseRequests,
      filterOption,
    });
  } catch (error) {
    next(error);
  }
};

const postProcessPurchaseRequest = async (req, res, next) => {
  try {
    const { id, action } = req.body;

    if (action === "Approve") {
      const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
        status: "Approved",
      });

      console.log(
        "Changing status of purchase request to approved. Details ",
        updatedPurchaseRequest
      );
    } else if (action === "Disapprove") {
      const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
        status: "Disapproved",
      });

      console.log(
        "Changing status of purchase request to dissaproved. Details ",
        updatedPurchaseRequest
      );
    } else if (action === "Delete") {
      const deletedPurchaseRequest = await Purchase.findByIdAndRemove(id);

      console.log(
        "Purchase request successfully deleted: ",
        deletedPurchaseRequest
      );
    }
  } catch (error) {
    next(error);
  }

  res.redirect("/user");
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
    const company = await Company.findById(
      currentUser.company
    ).populate("users");

    const { filterOption } = req.body;
    let filteredUsersList;
    if (filterOption !== "all")
      filteredUsersList = company.users.filter(
        (user) => user.status === capitalize(filterOption)
      )
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
  getUserPage,
  getUserEditPage,
  postUserEditPage,
  getProfilePage,
  postProfilePage,
  postNewPurchase,
  postProcessPurchaseRequest,
  postFilterPurchaseRequests,
  getAdminPage,
  filterUserStatus,
  postAdminPage,
  getUserNotApprovedPage,
};
