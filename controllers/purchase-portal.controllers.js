const Department = require("../models/Department.model");
const Purchase = require("../models/Purchase.model");
const Company = require("../models/Company.model")

const getPurchasePortalPage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const userCompany = req.session.currentUser.company;
    const userDepartment = req.session.currentUser.department;

    /* const currentDepartment = await Department.findOne({name: userDepartment, company: userCompany}) */

    const purchaseRequests = await Purchase.find({
      company: userCompany,
      department: userDepartment,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy")
      .populate("reviewedBy");

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
    const department = req.session.currentUser.department;

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
      department,
    });

    console.log(
      "A new purchase request was successfully created: ",
      newPurchase
    );

    const departmentToAddPurchaseTo = await Department.findOne({
      name: department,
      company,
    });
    departmentToAddPurchaseTo.purchases.push(newPurchase._id);
    departmentToAddPurchaseTo.save();

    console.log("Purchase added to department: ", department);

    const companyDB = await Company.findById(company);
    companyDB.purchases.push(newPurchase._id);
    companyDB.save();

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
          .populate("createdBy")
          .populate("reviewedBy");

        purchaseRequests = allRequests;
        break;

      case "pending":
        const pendingRequests = await Purchase.find({
          company: userCompany,
          status: "Pending",
        })
          .sort({ createdAt: -1 })
          .populate("createdBy")
          .populate("reviewedBy");

        purchaseRequests = pendingRequests;
        break;

      case "approved":
        const approvedRequests = await Purchase.find({
          company: userCompany,
          status: "Approved",
        })
          .sort({ createdAt: -1 })
          .populate("createdBy")
          .populate("reviewedBy");

        purchaseRequests = approvedRequests;
        break;

      case "disapproved":
        const disapprovedRequests = await Purchase.find({
          company: userCompany,
          status: "Disapproved",
        })
          .sort({ createdAt: -1 })
          .populate("createdBy")
          .populate("reviewedBy");

        purchaseRequests = disapprovedRequests;
        break;

      case "myRequests":
        const myRequests = await Purchase.find({
          company: userCompany,
          createdBy: userId,
        })
          .sort({ createdAt: -1 })
          .populate("createdBy")
          .populate("reviewedBy");

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
    const { id, action, comment, managerId } = req.body;

    if (action === "Approve") {
      const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(
        id,
        {
          status: "Approved",
          comment,
          reviewedBy: managerId,
        },
        { new: true }
      );

      console.log(
        "Changing status of purchase request to approved. Details ",
        updatedPurchaseRequest
      );
    } else if (action === "Disapprove") {
      const updatedPurchaseRequest = await Purchase.findByIdAndUpdate(id, {
        status: "Disapproved",
        comment,
        reviewedBy: managerId,
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

      const departmentToAddPurchaseTo = await Department.findOne({
        name: deletedPurchaseRequest.department,
        company: deletedPurchaseRequest.company,
      });
      departmentToAddPurchaseTo.purchases.pull(deletedPurchaseRequest._id);
      departmentToAddPurchaseTo.save();
  
      console.log("Purchase removed from department: ", deletedPurchaseRequest.department);
  
      const companyDB = await Company.findById(deletedPurchaseRequest.company);
      companyDB.purchases.pull(deletedPurchaseRequest._id);
      companyDB.save();

    }
  } catch (error) {
    next(error);
  }

  res.redirect("/purchase-portal");
};

const getEditPurchasePage = async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const purchaseId = req.params.purchaseId;
    const purchaseRequest = await Purchase.findById(purchaseId).populate(
      "createdBy"
    );

    res.render("purchase-portal/edit-purchase", {
      style: "purchase-portal/edit-purchase.css",
      currentUser,
      purchaseRequest,
    });
  } catch (error) {
    next(error);
  }
};

const postEditPurchasePage = async (req, res, next) => {
  try {
    const { id, item, cost, reason } = req.body;

    if (typeof Number(cost) !== "number" || Number(cost) < 0) {
      try {
        const currentUser = req.session.currentUser;
        const purchaseId = req.params.purchaseId;
        const purchaseRequest = await Purchase.findById(purchaseId).populate(
          "createdBy"
        );

        res.render("purchase-portal/edit-purchase", {
          style: "purchase-portal/edit-purchase.css",
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

        res.render("purchase-portal/edit-purchase", {
          style: "purchase-portal/edit-purchase.css",
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

module.exports = {
  getPurchasePortalPage,
  postNewPurchase,
  postFilterPurchaseRequests,
  postProcessPurchaseRequest,
  getEditPurchasePage,
  postEditPurchasePage,
};
