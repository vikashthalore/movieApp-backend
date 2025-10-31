import jwt from "jsonwebtoken";
import sendEmail from "../config/sendEmail.js";
import Admin from "../models/admin.model.js";
import dbConnect from "../config/dbConnect.js"; // ← आपका नाम

export const sendOTP = async (req, res) => {
  try {
    await dbConnect(); // ← DB CONNECT FIRST

    const { email } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Permission denied: Not allowed email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let admin = await Admin.findOne({ email });

    if (!admin) {
      admin = new Admin({ email, otp, otpExpiry });
      await admin.save();
    } else {
      admin.otp = otp;
      admin.otpExpiry = otpExpiry;
      await admin.save();
    }

    await sendEmail(email, otp);

    res.status(200).json({ message: "OTP sent to admin email successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    await dbConnect();

    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
};

export const adminDashboard = async (req, res) => {
  try {
    await dbConnect();
    res.status(200).json({ message: "Welcome to the admin dashboard", user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
};