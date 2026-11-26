const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL"],
    },
    size: {
      type: String,
      default: "M",
    },
    colors: {
      type: [
        {
          name: { type: String },
          hex: { type: String },
        },
      ],
      default: [{ name: "Lavender", hex: "#9b87f5" }],
    },
    color: {
      type: String,
      default: "Lavender",
    },
    stock: {
      type: Number,
      default: 20,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
