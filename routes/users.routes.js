const router = require("express").Router();

router.get("/user", (req, res, next) => {
  res.render("users/user", { style: "users/user.css" });
});

module.exports = router;
