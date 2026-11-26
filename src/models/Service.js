const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Delivery", "Returns", "Exchanges", "Alterations"],
      default: "Delivery",
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    item: { type: String, required: true, trim: true },
    requestDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Delivered"],
      default: "Pending",
    },
    assignedTo: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
