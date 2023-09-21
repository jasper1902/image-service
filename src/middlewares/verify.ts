import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface UserPayload extends JwtPayload {
  uaername: string;
  role: string;
}

export interface AdminAuthRequest extends Request {
  role: "admin";
}

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader: string | undefined = getAuthHeader(req.headers);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const tokenConfig = process.env.TOKEN;
    if (!tokenConfig || typeof tokenConfig !== "string") {
      return res.status(500).json({ message: "Token is not configured" });
    }

    const decoded = jwt.verify(token, tokenConfig) as UserPayload;
    if (decoded.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You don't have permission to access" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAuthHeader = (headers: any): string | undefined => {
  const authHeader =
    headers.authorization ||
    headers.Authorization ||
    headers["auth-token"] ||
    headers["Auth-token"];

  if (Array.isArray(authHeader)) {
    return authHeader[0];
  }

  return authHeader;
};

export default verifyAdmin;
