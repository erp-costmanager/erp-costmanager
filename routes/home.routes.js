const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  const currentUser = req.session.currentUser;

  res.render("home", { style: "home.css", currentUser });
});

module.exports = router;
