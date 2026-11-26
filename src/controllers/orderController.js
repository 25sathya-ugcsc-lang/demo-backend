const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");

exports.placeOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      paymentMethod,
      shippingAddress,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    const orderNumber = `#ST${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-3)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      customerName: customerName || req.user.name,
      customerEmail: customerEmail || req.user.email,
      customerPhone: customerPhone || req.user.phone || "",
      items,
      subtotal: subtotal || total,
      discount: discount || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      status: "Processing",
      paymentMethod: paymentMethod || "card",
      shippingAddress,
    });

    // Update product stock & sold count
    for (const item of items) {
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod) {
          prod.stock = Math.max(0, (prod.stock || 0) - (item.quantity || 1));
          prod.sold = (prod.sold || 0) + (item.quantity || 1);
          prod.inStock = prod.stock > 0;
          await prod.save();
        }
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Create Admin Notification
    await Notification.create({
      title: "New Order Received",
      message: `Order ${orderNumber} placed by ${order.customerName} (₹${order.total})`,
      time: "Just now",
      type: "order",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to place order" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ user: req.user._id }, { customerEmail: req.user.email }],
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch orders" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch all orders" });
  }
};

exports.createAdminOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, total, status, paymentMethod, shippingAddress } = req.body;
    const orderNumber = `#ST${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-3)}`;

    const order = await Order.create({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      items,
      subtotal: total,
      total,
      status: status || "Processing",
      paymentMethod: paymentMethod || "UPI / Card",
      shippingAddress,
    });

    await Notification.create({
      title: "Manual Order Created",
      message: `Order ${orderNumber} created for ${customerName}`,
      time: "Just now",
      type: "order",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create order" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (
      req.user.role !== "Admin" &&
      order.user?.toString() !== req.user._id.toString() &&
      order.customerEmail !== req.user.email
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update order status" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete order" });
  }
};
