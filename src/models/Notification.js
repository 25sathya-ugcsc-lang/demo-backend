const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, default: "Just now" },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["order", "stock", "service", "review"],
      default: "order",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
