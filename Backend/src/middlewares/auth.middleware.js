import jwt from "jsonwebtoken";
import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: decodedToken.id },
  });

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  const { password, ...safeUser } = user;
  req.user = safeUser;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : req.cookies?.token;

  if (!token) {
    req.user = null;
    next();
    return;
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "change-this-secret");
  const user = await prisma.user.findUnique({
    where: { id: decodedToken.id },
  });

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  const { password, ...safeUser } = user;
  req.user = safeUser;
  next();
});

const isAllowed = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = roles.map((role) => role.toUpperCase());

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed to access this route");
    }

    next();
  };
};

export { isLoggedIn, isAllowed, optionalAuth };
