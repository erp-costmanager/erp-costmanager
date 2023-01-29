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
  res.render('users/profile', { style: 'users/profile.css', currentUser: req.session.currentUser })
}

const postProfilePage = async (req, res, next) => {
  const currentUser = req.session.currentUser;

  const { firstName, lastName, email, oldPassword, newPassword, verifyPassword } = req.body
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
    }
    const changedUserDb = await User.findByIdAndUpdate(currentUser._id, editedUser, {new: true})
    req.session.currentUser = changedUserDb

    res.redirect('/user')
  } catch (error) {
    next(error)
  }
}

const getUserEditPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const purchaseId = req.params.purchaseId;
    const purchaseRequest = await Purchase.findById(purchaseId).populate(
      "createdBy"
    );

    console.log("PurchaseId: ", purchaseId);
    console.log("Purchase Request: ", purchaseRequest);

    const isEditing = true;

    res.render("users/edit-user", {
      style: "users/edit-user.css",
      currentUser,
      purchaseRequest,
    });
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

const postProcessPurchaseRequest = async (req, res, next) => {
  try {
    const {
      id,
      approveRequest,
      disapproveRequest,
      deleteRequest,
      editRequest,
    } = req.body;

    if (approveRequest) {
      const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
        status: "Approved",
      });

      console.log(
        "Changing status of purchase request to approved. Details ",
        updatedPurchaseRequest
      );
    } else if (disapproveRequest) {
      const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
        status: "Disapproved",
      });

      console.log(
        "Changing status of purchase request to dissaproved. Details ",
        updatedPurchaseRequest
      );
    } else if (deleteRequest) {
      const deletedPurchaseRequest = await Purchase.findByIdAndRemove(id);

      console.log(
        "Purchase request successfully deleted: ",
        deletedPurchaseRequest
      );
    } else if (editRequest) {
      res.render("users/user", { isEditing: true });
      return;
    }
  } catch (error) {
    next(error);
  }

  res.redirect("/user");
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

const getAdminPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const company = await Company.findById(currentUser.company).populate(
      "users"
    );

    const usersList = company.users;

    usersList.sort((first, second) => {
      if (first.status === "Pending") return -1;
      else return 1;
    });

    res.render("users/admin", {
      style: "users/admin.css",
      currentUser,
      usersList,
    });
  } catch (error) {
    next(error);
  }
};

const postAdminPage = async (req, res, next) => {
  const { status, role, id } = req.body;

  try {
    const user = await User.findById(id);

    if (status) user.status = status;
    user.role = role;
    await user.save();

    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPage,
  getUserEditPage,
  postUserEditPage,
  getProfilePage,
  postProfilePage,
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
};
