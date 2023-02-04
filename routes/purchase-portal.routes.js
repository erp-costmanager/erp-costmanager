const router = require("express").Router();

const {
  isLoggedIn,
  isNotAdmin,
  isApproved,
} = require("../middleware/routeGuard");

const {
  getPurchasePortalPage,
  postNewPurchase,
  postFilterPurchaseRequests,
  postProcessPurchaseRequest,
  getEditPurchasePage,
  postEditPurchasePage,
} = require("../controllers/purchase-portal.controllers");

router.get(
  "/purchase-portal",
  isLoggedIn,
  isApproved,
  isNotAdmin,
  getPurchasePortalPage
);

router.post(
  "/purchase-portal/newPurchase",
  isLoggedIn,
  isNotAdmin,
  postNewPurchase
);

router.post(
  "/purchase-portal/filterPurchaseRequests",
  isLoggedIn,
  isNotAdmin,
  postFilterPurchaseRequests
);

router.post(
  "/purchase-portal/processPurchaseRequest",
  isLoggedIn,
  isNotAdmin,
  postProcessPurchaseRequest
);

router.get(
  "/purchase-portal/edit-purchase/:purchaseId",
  isLoggedIn,
  isApproved,
  isNotAdmin,
  getEditPurchasePage
);

router.post(
  "/purchase-portal/edit-purchase/:purchaseId",
  isLoggedIn,
  isApproved,
  isNotAdmin,
  postEditPurchasePage
);

module.exports = router;
