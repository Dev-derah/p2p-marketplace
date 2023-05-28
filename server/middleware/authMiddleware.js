import jwt from "jsonwebtoken";
import User from "../mongodb/models/userModel.js";
import { parse } from "cookie";

const getTokenFromCookie = (req) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = parse(cookieHeader);
    return cookies.token;
  }
  return null;
};

const isAuthenticated = async (req, res, next) => {
  const token = getTokenFromCookie(req);

  //   Check if token exists
  if (!token) {
    return res.status(404).json({ success: false, message: "Token not found" });
  }
  try {
    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedToken.id).select("-password");
    next();
  } catch (error) {
    res.clearCookie("token");
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export { isAuthenticated };
