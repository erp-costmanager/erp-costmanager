const router = require("express").Router();

const User = require("../models/User.model");
const Company = require('../models/Company.model')
const { isAdmin, isLoggedIn, isNotAdmin } = require("../middleware/routeGuard");

const {
  getUserPage,
  postNewPurchase,
  postProcessPurchaseRequest,
} = require("../controllers/users.controllers");

router.get("/user", isLoggedIn, isNotAdmin, getUserPage);

router.post("/user/newPurchase", postNewPurchase);

router.post("/user/proccesPurchaseRequest", postProcessPurchaseRequest);

router.get("/admin", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const user = req.session.currentUser;
    const company = await Company.findById(user.company).populate('users');

    const usersList = company.users

    usersList.sort((first, second) => {
      if (first.status === "Pending") return -1;
      else return 1;
    });

    res.render("users/admin", { style: "users/admin.css", user, usersList });
  } catch (error) {
    next(error)
  }
});

router.post('/user/edit', async (req, res, next) => {
  const { status, role, id } = req.body
  
  try {
    const user = await User.findById(id)

    if (status) user.status = status;
    user.role = role;
    await user.save()
    
    res.redirect('/admin')
  } catch (error) {
    next(error)
  }
})


module.exports = router;
