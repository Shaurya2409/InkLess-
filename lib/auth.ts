import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export function getCurrentUserId(req: NextRequest): string | null {
  try {
    // Read JWT from the HTTP-only cookie
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify that the token was actually created by our server
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as AuthTokenPayload;

    if (!decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error("Authentication error:", error);

    return null;
  }
}