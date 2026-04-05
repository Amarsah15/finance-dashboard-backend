import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// 1. Verify the JWT Token
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID and attach it to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User no longer exists" });
      }

      if (!req.user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "User account is deactivated" });
      }

      next(); // Move to the next middleware or controller
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided" });
  }
};

// 2. Role-Based Access Control (RBAC)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware above
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};
