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

router.get("/userSignup", getUserSignup);
router.post("/userSignup", postUserSignup);

router.get("/companySignup", getCompanySignup);
router.post("/companySignup", postCompanySignup);

router.get("/login", getLogin);
router.post("/login", postLogin);

router.post("/logout", logout);

module.exports = router;
