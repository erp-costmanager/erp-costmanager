const router = require("express").Router();

const {
  getUserSignup,
  postUserSignup,
  getCompanySignup,
  postCompanySignup,
  getLogin,
  postLogin,
  logout,
} = require("../controllers/auth.controllers");

const {
  isLoggedIn,
  isLoggedOut,
} = require('../middleware/routeGuard');

router.get("/userSignup", isLoggedOut, getUserSignup);
router.post("/userSignup", isLoggedOut, postUserSignup);

router.get("/companySignup", isLoggedOut, getCompanySignup);
router.post("/companySignup", isLoggedOut, postCompanySignup);

router.get("/login", isLoggedOut, getLogin);
router.post("/login", isLoggedOut, postLogin);

router.post("/logout", isLoggedIn, logout);

module.exports = router;
