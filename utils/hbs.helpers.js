module.exports = (hbs) => {
  hbs.registerHelper(
    "isPendingAndIsUserManager",
    (purchaseRequest) =>
      purchaseRequest.createdBy.role === "Manager" &&
      purchaseRequest.status === "Pending"
  );
  hbs.registerHelper(
    "isPendingAndIsUsersOwnRequest",
    (purchaseRequest, currentUser) =>
      String(purchaseRequest.createdBy._id) === currentUser._id &&
      purchaseRequest.status === "Pending"
  );
  hbs.registerHelper("isPending", (user) => user.status === "Pending");
  hbs.registerHelper(
    "isApproved",
    (purchaseRequest) => purchaseRequest.status === "Approved"
  );
  hbs.registerHelper(
    "isDisapproved",
    (purchaseRequest) => purchaseRequest.status === "Disapproved"
  );
  hbs.registerHelper("isEmployee", (user) => user.role === "Employee");
  hbs.registerHelper("isManager", (user) => user.role === "Manager");
  hbs.registerHelper("isAdmin", (user) => user.role === "Admin");
  hbs.registerHelper("isNotAdmin", (user) => user.role !== "Admin");
};
