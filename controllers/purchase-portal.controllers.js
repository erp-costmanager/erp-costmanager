const Purchase = require("../models/Purchase.model");

const getPurchasePortalPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const purchaseRequests = await Purchase.find({
      company: currentUser.company,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy");

    res.render("purchase-portal/purchase-portal", {
      style: "purchase-portal/purchase-portal.css",
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

    if (typeof Number(cost) !== "number" || Number(cost) < 0) {
      try {
        const currentUser = req.session.currentUser;
        const purchaseRequests = await Purchase.find({
          company: currentUser.company,
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");

        res.render("purchase-portal/purchase-portal", {
          style: "purchase-portal/purchase-portal.css",
          currentUser,
          purchaseRequests,
          errorMessage:
            "The entered cost has to be a number larger than or equal to 0",
        });
      } catch (error) {
        next(error);
      }
      return;
    }

    if (!item || !cost || !reason) {
      try {
        const currentUser = req.session.currentUser;
        const purchaseRequests = await Purchase.find({
          company: currentUser.company,
        })
          .sort({ createdAt: -1 })
          .populate("createdBy");

        res.render("purchase-portal/purchase-portal", {
          style: "purchase-portal/purchase-portal.css",
          currentUser,
          purchaseRequests,
          errorMessage:
            "All of the fields must be filled in to submit a purchase request",
        });
      } catch (error) {
        next(error);
      }
      return;
    }

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

    res.redirect("/purchase-portal");
  } catch (error) {
    next(error);
  }
};

const postFilterPurchaseRequests = async (req, res, next) => {
  try {
    const { filterOption } = req.body;
    const userId = req.session.currentUser._id;
    const userCompany = req.session.currentUser.company;

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

    res.render("purchase-portal/purchase-portal", {
      style: "purchase-portal/purchase-portal.css",
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

  res.redirect("/purchase-portal");
};

module.exports = {
  getPurchasePortalPage,
  postNewPurchase,
  postFilterPurchaseRequests,
  postProcessPurchaseRequest,
};