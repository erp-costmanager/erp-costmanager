const router = require("express").Router();
const fileUploader = require('../config/cloudinary.config')

const { isAdmin, isLoggedIn, isNotAdmin, isApproved } = require("../middleware/routeGuard");

const {
  getUserPage,
  getUserEditPage,
  postUserEditPage,
  getProfilePage,
  postProfilePage,
  postNewPurchase,
  postProcessPurchaseRequest,
  getAdminPage,
  postAdminPage,
  getUserNotApprovedPage,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isApproved, isNotAdmin, getUserPage);

router.get('/profile', isLoggedIn, getProfilePage)

router.post('/profile', isLoggedIn, fileUploader.single('user-profile-image'), postProfilePage)

router.post("/user/newPurchase", isLoggedIn, isNotAdmin, postNewPurchase);

router.post("/user/processPurchaseRequest", isLoggedIn, isNotAdmin, postProcessPurchaseRequest);

router.get("/admin", isLoggedIn, isApproved, isAdmin, getAdminPage);

router.post("/admin/edit", isLoggedIn, isApproved, isAdmin, postAdminPage);

router.get("/user/edit/:purchaseId", isLoggedIn, isApproved, isNotAdmin, getUserEditPage);

router.post("/user/edit/:purchaseId", isLoggedIn, isApproved, isNotAdmin, postUserEditPage);

router.get('/user/not-approved', isLoggedIn, getUserNotApprovedPage);

module.exports = router;
