const Purchase = require("../models/Purchase.model");

const getUserPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const purchaseRequests = await Purchase.find().populate("createdBy");

    console.log("The _id is of type: ", typeof purchaseRequests[0]._id);

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

    const newPurchase = await Purchase.create({
      item,
      cost,
      reason,
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

module.exports = {
  getUserPage,
  postNewPurchase,
  postProcessPurchaseRequest,
};
