module.exports = (hbs) => {
  hbs.registerHelper("isPending", (user) => user.status === "Pending");
  hbs.registerHelper("isApproved", (user) => user.status === "Approved");
  hbs.registerHelper("isDisapproved", (user) => user.status === "Disapproved");
  hbs.registerHelper("isEmployee", (user) => user.role === "Employee");
  hbs.registerHelper("isManager", (user) => user.role === "Manager");
  hbs.registerHelper("isAdmin", (user) => user.role === "Admin");
};
