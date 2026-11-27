const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  fullName: user.fullName || user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  address: user.address || "",
  city: user.city || "",
  avatar: user.avatar || "",
  joinedDate: user.joinedDate,
  status: user.status,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || email.split("@")[0],
      fullName: name || email.split("@")[0],
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "User",
      phone: phone || "",
      address: address || "",
      city: city || "",
    });

    const token = generateToken(user);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

exports.getProfile = async (req, res) => {
  res.status(200).json({ user: formatUser(req.user) });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, fullName, phone, address, city, avatar, role } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (avatar !== undefined) user.avatar = avatar;
    if (role !== undefined && req.user.role === "Admin") user.role = role;

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Profile update failed" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Password change failed" });
  }
};
