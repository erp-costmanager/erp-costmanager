const router = require("express").Router();
const fileUploader = require("../config/cloudinary.config");

const {
  isAdmin,
  isLoggedIn,
  isNotAdmin,
  isApproved,
} = require("../middleware/routeGuard");

const {
  getProfilePage,
  postProfilePage,
  getAdminPage,
  filterUserStatus,
  postAdminPage,
  getUserNotApprovedPage,
} = require("../controllers/users.controllers");

router.get("/profile", isLoggedIn, getProfilePage);

router.post(
  "/profile",
  isLoggedIn,
  fileUploader.single("user-profile-image"),
  postProfilePage
);

router.get("/admin", isLoggedIn, isApproved, isAdmin, getAdminPage);

router.post(
  "/admin/filterUserStatus",
  isLoggedIn,
  isApproved,
  isAdmin,
  filterUserStatus
);

router.post("/admin/edit", isLoggedIn, isApproved, isAdmin, postAdminPage);

router.get("/user/not-approved", isLoggedIn, getUserNotApprovedPage);

module.exports = router;
