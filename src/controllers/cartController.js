const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.status(200).json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch cart" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, name, price, originalPrice, image, categoryName, size = "M", color = "Lavender", quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        name,
        price,
        originalPrice,
        image,
        categoryName,
        size,
        color,
        quantity: Number(quantity),
      });
    }

    await cart.save();
    res.status(200).json(cart.items);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to add to cart" });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (Number(quantity) <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    res.status(200).json(cart.items);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update cart item" });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.status(200).json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to remove cart item" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to clear cart" });
  }
};
