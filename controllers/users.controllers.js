const Purchase = require("../models/Purchase.model");

const getUserPage = (req, res, next) => {
  const currentUser = req.session.currentUser;
  res.render("users/user", { style: "users/user.css", currentUser });
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

module.exports = {
  getUserPage,
  postNewPurchase,
};
