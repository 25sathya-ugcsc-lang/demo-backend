require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const seedData = async () => {
  try {
    await connectDB();

    // Seed Admin & Demo User
    const adminExists = await User.findOne({ email: "admin@styleaura.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        fullName: "Head Store Manager",
        email: "admin@styleaura.com",
        password: hashedPassword,
        role: "Admin",
        phone: "+91 98765 43210",
        city: "Mumbai",
        address: "123 Fashion Avenue, Mumbai",
      });
      console.log("Seeded Admin: admin@styleaura.com / admin123");
    }

    const userExists = await User.findOne({ email: "aria@styleaura.com" });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash("user123", 10);
      await User.create({
        name: "Aria Vance",
        fullName: "Aria Vance",
        email: "aria@styleaura.com",
        password: hashedPassword,
        role: "User",
        phone: "+91 98765 11111",
        city: "Mumbai",
        address: "42 Lavender Lane, Bandra, Mumbai",
      });
      console.log("Seeded User: aria@styleaura.com / user123");
    }

    // Seed Categories if empty
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: "Dresses", slug: "dresses", description: "Silk, satin & evening dresses", itemCount: 24, badge: "Trending" },
        { name: "Tops", slug: "tops", description: "Chiffon blouses & tailored tops", itemCount: 18 },
        { name: "Sarees", slug: "sarees", description: "Handwoven & designer sarees", itemCount: 15, badge: "Exclusive" },
        { name: "Women Clothing", slug: "women-clothing", description: "Curated women's essentials", itemCount: 32 },
        { name: "Men Clothing", slug: "men-clothing", description: "Tailored menswear & shirts", itemCount: 20 },
        { name: "Accessories", slug: "accessories", description: "Bags, jewelry & scarves", itemCount: 14 },
      ]);
      console.log("Seeded Categories");
    }

    // Seed Products if empty
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany([
        {
          name: "Lavender Silk Midi Dress",
          sku: "SA-DRS-001",
          category: "dresses",
          categoryName: "Dresses",
          price: 2499,
          originalPrice: 3299,
          discount: 24,
          description: "Flowing mulberry silk midi dress in signature StyleAura lavender.",
          image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
          sizes: ["XS", "S", "M", "L", "XL"],
          size: "M",
          colors: [{ name: "Lavender", hex: "#9b87f5" }, { name: "Lilac", hex: "#c8a2c8" }],
          color: "Lavender",
          stock: 25,
          sold: 42,
          rating: 4.8,
          reviewsCount: 34,
          isTrending: true,
          isNewArrival: true,
          isBestSeller: true,
        },
        {
          name: "Velvet Evening Gown",
          sku: "SA-DRS-002",
          category: "dresses",
          categoryName: "Dresses",
          price: 4299,
          originalPrice: 5499,
          discount: 22,
          description: "Plush plum velvet evening gown with sculpted waist.",
          image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600",
          sizes: ["S", "M", "L"],
          size: "S",
          colors: [{ name: "Plum", hex: "#580F41" }],
          color: "Plum",
          stock: 12,
          sold: 19,
          rating: 4.9,
          reviewsCount: 21,
          isTrending: true,
          isBestSeller: true,
        },
        {
          name: "Organza Ruffle Blouse",
          sku: "SA-TOP-001",
          category: "tops",
          categoryName: "Tops",
          price: 1499,
          originalPrice: 1899,
          discount: 21,
          description: "Sheer organza blouse with delicate cuff ruffles.",
          image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600",
          sizes: ["XS", "S", "M", "L"],
          size: "M",
          colors: [{ name: "Mauve", hex: "#e0b0ff" }],
          color: "Mauve",
          stock: 30,
          sold: 28,
          rating: 4.6,
          reviewsCount: 18,
          isNewArrival: true,
        },
        {
          name: "Banarasi Silk Saree",
          sku: "SA-SAR-001",
          category: "sarees",
          categoryName: "Sarees",
          price: 5999,
          originalPrice: 7499,
          discount: 20,
          description: "Handwoven Banarasi silk saree with zari border.",
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
          sizes: ["Free Size"],
          size: "Free Size",
          colors: [{ name: "Purple", hex: "#6b21a8" }],
          color: "Purple",
          stock: 8,
          sold: 15,
          rating: 4.9,
          reviewsCount: 27,
          isTrending: true,
          isBestSeller: true,
        },
      ]);
      console.log("Seeded Products");
    }

    console.log("Database seed completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
