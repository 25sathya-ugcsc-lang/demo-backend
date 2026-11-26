const Wishlist = require("../models/Wishlist");

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.status(200).json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch wishlist" });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const exists = wishlist.products.some((id) => id.toString() === productId);
    if (exists) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate("products");
    res.status(200).json(wishlist.products);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update wishlist" });
  }
};

exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to clear wishlist" });
  }
};
