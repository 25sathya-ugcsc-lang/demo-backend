const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

module.exports = router;
