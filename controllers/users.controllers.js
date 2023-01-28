const Purchase = require("../models/Purchase.model");

const getUserPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    console.log("User's company: ", currentUser.company);
    const purchaseRequests = await Purchase.find({
      company: currentUser.company,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy");

    console.log("Purchase requests: ", purchaseRequests);

    res.render("users/user", {
      style: "users/user.css",
      currentUser,
      purchaseRequests,
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
  const { status, id } = req.body;

  if (status === "Pending") {
    return;
  } else if (status === "Approved") {
    const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
      status: "Approved",
    });
    console.log(
      "Changing status of purchase request to approved. Details ",
      updatedPurchaseRequest
    );
  } else if (status === "Disapproved") {
    const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
      status: "Disapproved",
    });
    console.log(
      "Changing status of purchase request to dissaproved. Details ",
      updatedPurchaseRequest
    );
  } else {
    console.log("Invalid status received!");
    return;
  }

  res.redirect("/user");
};

const getAdminPage = async (req, res, next) => {
  try {
    const user = req.session.currentUser;
    const company = await Company.findById(user.company).populate("users");

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
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
};
