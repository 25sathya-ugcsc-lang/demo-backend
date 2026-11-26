const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Service = require("../models/Service");
const Enquiry = require("../models/Enquiry");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders, reviews] = await Promise.all([
      User.countDocuments({ role: "User" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: { $ne: "Cancelled" } }),
      Review.find(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "4.8";

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      avgRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch dashboard stats" });
  }
};

// Customers / Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch users" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, fullName, email, password, phone, address, city, role } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password || "StyleAura@123", 10);
    const user = await User.create({
      name,
      fullName: fullName || name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      city: city || "",
      role: role || "User",
    });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.password;
    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete user" });
  }
};

// Reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch reviews" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create review" });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply: req.body.reply },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to reply to review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete review" });
  }
};

// Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch services" });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create service" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update service" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete service" });
  }
};

// Enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch enquiries" });
  }
};

exports.createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create enquiry" });
  }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
    res.status(200).json(enquiry);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update enquiry" });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Enquiry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete enquiry" });
  }
};

// Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch notifications" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: "Notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update settings" });
  }
};
