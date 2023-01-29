const isLoggedIn = (req, res, next) => {
  if (!req.session.currentUser) res.redirect("/login");
  else next();
};

const isLoggedOut = (req, res, next) => {
  if (req.session.currentUser) res.redirect("/user");
  else next();
};

const isAdmin = (req, res, next) => {
  if (req.session.currentUser?.role !== "Admin") res.redirect("/user");
  else next();
};

const isNotAdmin = (req, res, next) => {
  if (req.session.currentUser?.role === "Admin") res.redirect("/admin");
  else next();
};

const isApproved = (req, res, next) => {
  if (req.session.currentUser?.status !== "Approved") res.redirect('/user/not-approved');
  else next();
}

module.exports = {
  isLoggedIn,
  isLoggedOut,
  isAdmin,
  isNotAdmin,
  isApproved,
};
