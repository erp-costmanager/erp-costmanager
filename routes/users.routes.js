const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require('../middleware/routeGuard');

router.get("/user", isLoggedIn, isNotAdmin, (req, res, next) => {
  res.render("users/user", { style: "users/user.css" });
});

module.exports = router;
