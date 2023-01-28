const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

const {
  getUserPage,
  getUserEditPage,
  postUserEditPage,
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isNotAdmin, getUserPage);

router.post("/user/newPurchase", postNewPurchase);

router.post("/user/processPurchaseRequest", postProcessPurchaseRequest);

router.get("/admin", isLoggedIn, isAdmin, getAdminPage);

router.post("/admin/edit", isLoggedIn, isAdmin, postAdminPage);

router.get("/user/edit/:purchaseId", isLoggedIn, isNotAdmin, getUserEditPage);

router.post("/user/edit/:purchaseId", postUserEditPage);

module.exports = router;
