const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.get("/stats", admin.getStats);

router.get("/users", admin.getUsers);
router.post("/users", admin.createUser);
router.put("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);

router.get("/reviews", admin.getReviews);
router.post("/reviews", admin.createReview);
router.put("/reviews/:id/reply", admin.replyReview);
router.delete("/reviews/:id", admin.deleteReview);

router.get("/services", admin.getServices);
router.post("/services", admin.createService);
router.put("/services/:id", admin.updateService);
router.delete("/services/:id", admin.deleteService);

router.get("/enquiries", admin.getEnquiries);
router.post("/enquiries", admin.createEnquiry);
router.put("/enquiries/:id", admin.updateEnquiry);
router.delete("/enquiries/:id", admin.deleteEnquiry);

router.get("/notifications", admin.getNotifications);
router.put("/notifications/read-all", admin.markAllNotificationsRead);
router.put("/notifications/:id/read", admin.markNotificationRead);
router.delete("/notifications", admin.clearNotifications);

router.get("/settings", admin.getSettings);
router.put("/settings", admin.updateSettings);

module.exports = router;
