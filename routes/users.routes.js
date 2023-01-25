const router = require("express").Router();

const User = require("../models/User.model");
const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

router.get("/user", isLoggedIn, isNotAdmin, (req, res, next) => {
  res.render("users/user", { style: "users/user.css" });
});

router.get("/admin", isLoggedIn, isAdmin, async (req, res, next) => {
  const user = req.session.currentUser;
  const usersList = await User.find({ company: user.company });
  usersList.sort((first, second) => {
    if (first.status === "Pending") return -1;
    else return 1;
  });
  res.render("users/admin", { style: "users/admin.css", user, usersList });
});

module.exports = router;
