const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, fallbackImage, badge, itemCount } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
    const category = await Category.create({
      name,
      slug: generatedSlug,
      description,
      image,
      fallbackImage,
      badge,
      itemCount,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete category" });
  }
};
