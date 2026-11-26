const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "StyleAura Boutique" },
    contactEmail: { type: String, default: "admin@styleaura.com" },
    phone: { type: String, default: "+91 98765 43210" },
    address: { type: String, default: "123 Fashion Avenue, Mumbai, India" },
    currency: { type: String, default: "₹" },
    taxRate: { type: Number, default: 12 },
    lowStockAlert: { type: Number, default: 10 },
    emailNotifications: { type: Boolean, default: true },
    orderAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
