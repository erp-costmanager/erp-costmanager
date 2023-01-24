const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

router.get("/user", isLoggedIn, isNotAdmin, (req, res, next) => {
  const currentUser = req.session.currentUser;
  res.render("users/user", { style: "users/user.css", currentUser });
});

module.exports = router;
