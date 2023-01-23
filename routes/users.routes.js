const router = require("express").Router();

router.get("/employee", (req, res, next) => {
  res.render("users/employee", { style: "users/employee.css" });
});

module.exports = router;
