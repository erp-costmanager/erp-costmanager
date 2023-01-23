const router = require("express").Router();

const {
  getUserSignup,
  postUserSignup,
  getCompanySignup,
  postCompanySignup,
  getLogin,
  postLogin,
} = require("../controllers/auth.controllers");

router.get("/userSignup", getUserSignup);
router.post("/userSignup", postUserSignup);

router.get("/companySignup", getCompanySignup);
router.post("/companySignup", postCompanySignup);

router.get("/login", getLogin);
router.post("/login", postLogin);

module.exports = router;
