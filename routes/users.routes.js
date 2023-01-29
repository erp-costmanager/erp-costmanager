const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin, isApproved } = require("../middleware/routeGuard");

const {
  getUserPage,
  getUserEditPage,
  postUserEditPage,
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
  getUserNotApprovedPage,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isApproved, isNotAdmin, getUserPage);

router.post("/user/newPurchase", isLoggedIn, isApproved, isNotAdmin, postNewPurchase);

router.post("/user/processPurchaseRequest", isLoggedIn, isApproved, isNotAdmin, postProcessPurchaseRequest);

router.get("/admin", isLoggedIn, isApproved, isAdmin, getAdminPage);

router.post("/admin/edit", isLoggedIn, isApproved, isAdmin, postAdminPage);

router.get("/user/edit/:purchaseId", isLoggedIn, isApproved, isNotAdmin, getUserEditPage);

router.post("/user/edit/:purchaseId", isLoggedIn, isApproved, isNotAdmin, postUserEditPage);

router.get('/user/not-approved', isLoggedIn, getUserNotApprovedPage);

module.exports = router;
