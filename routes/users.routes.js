const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

const {
  getUserPage,
  getProfilePage,
  postProfilePage,
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isNotAdmin, getUserPage);

router.get('/profile', isLoggedIn, getProfilePage)

router.post('/profile', isLoggedIn, postProfilePage)

router.post("/user/newPurchase", isLoggedIn, isNotAdmin, postNewPurchase);

router.post("/user/proccesPurchaseRequest", isLoggedIn, isNotAdmin, postProcessPurchaseRequest);

router.get("/admin", isLoggedIn, isAdmin, getAdminPage);

router.post("/admin/edit", isLoggedIn, isAdmin, postAdminPage);

module.exports = router;
