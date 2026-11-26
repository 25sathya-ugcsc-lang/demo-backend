const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const { category, search, q, size, color, maxPrice, sort, filter } = req.query;
    const query = {};

    if (category && category !== "all" && category !== "All") {
      query.$or = [
        { category: new RegExp(`^${category}$`, "i") },
        { categoryName: new RegExp(`^${category}$`, "i") },
      ];
    }

    const keyword = search || q;
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ name: regex }, { categoryName: regex }, { category: regex }, { description: regex }],
      });
    }

    if (size) {
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ sizes: size }, { size }] });
    }

    if (color) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ "colors.name": new RegExp(color, "i") }, { color: new RegExp(color, "i") }],
      });
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    if (filter === "new") query.isNewArrival = true;
    if (filter === "trending") query.isTrending = true;

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    else if (sort === "price-high") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "popularity") sortOption = { reviewsCount: -1, sold: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const products = await Product.find(query).sort(sortOption);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch product" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    const stock = data.stock !== undefined ? Number(data.stock) : 20;
    const product = await Product.create({
      ...data,
      categoryName: data.categoryName || data.category,
      sku: data.sku || `SA-${Date.now().toString().slice(-6)}`,
      stock,
      inStock: data.inStock !== undefined ? data.inStock : stock > 0,
      gallery: data.gallery && data.gallery.length ? data.gallery : data.image ? [data.image] : [],
      sizes: data.sizes && data.sizes.length ? data.sizes : data.size ? [data.size] : ["S", "M", "L", "XL"],
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.stock !== undefined) {
      data.inStock = Number(data.stock) > 0;
    }
    if (data.category && !data.categoryName) {
      data.categoryName = data.category;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete product" });
  }
};
