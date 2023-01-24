const isLoggedIn = (req, res, next) => {
  if (!req.session.currentUser) res.redirect("/login");
  next();
};

const isLoggedOut = (req, res, next) => {
  if (req.session.currentUser) res.redirect("/user");
  next();
};

const isAdmin = (req, res, next) => {
  if (req.session.currentUser?.role !== "Admin") res.redirect("/user");
  next();
};

const isNotAdmin = (req, res, next) => {
    if (req.session.currentUser?.role === 'Admin') res.redirect('/admin');
    next();
}

module.exports = {
  isLoggedIn,
  isLoggedOut,
  isAdmin,
  isNotAdmin,
};
