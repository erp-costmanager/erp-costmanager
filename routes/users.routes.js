const router = require("express").Router();

const { isAdmin, isLoggedIn, isNotAdmin } = require('../middleware/routeGuard');

router.get("/employee", isLoggedIn, isNotAdmin, (req, res, next) => {
  res.render("users/employee", { style: "users/employee.css" });
});

module.exports = router;
