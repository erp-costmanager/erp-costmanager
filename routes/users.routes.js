const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

const {
  getUserPage,
  postNewPurchase,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isNotAdmin, getUserPage);

router.post("/user/newPurchase", postNewPurchase);

module.exports = router;
