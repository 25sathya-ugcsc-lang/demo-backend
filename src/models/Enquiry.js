const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },
    reply: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
