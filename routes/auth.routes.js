const router = require("express").Router();

const { getUserSignup, postUserSignup, getCompanySignup, postCompanySignup, getLogin } = require("../controllers/auth.controllers");

router.get("/userSignup", getUserSignup);
router.post("/userSignup", postUserSignup);

router.get('/companySignup', getCompanySignup);
router.post('/companySignup', postCompanySignup);

router.get("/login", getLogin);

module.exports = router;