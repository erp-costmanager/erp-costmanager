const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

const {
  getUserPage,
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isNotAdmin, getUserPage);

router.post("/user/newPurchase", postNewPurchase);

router.post("/user/proccesPurchaseRequest", postProcessPurchaseRequest);

router.get("/admin", isLoggedIn, isAdmin, getAdminPage);

router.post("/user/edit", isLoggedIn, isAdmin, postAdminPage);

module.exports = router;
