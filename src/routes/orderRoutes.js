const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  createAdminOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/", adminOnly, getAllOrders);
router.post("/admin", adminOnly, createAdminOrder);
router.get("/:id", getOrderById);
router.put("/:id/status", adminOnly, updateOrderStatus);
router.delete("/:id", adminOnly, deleteOrder);

module.exports = router;
