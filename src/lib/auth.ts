import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fitness_drive_stable_jwt_secret_key_2026";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  avatar?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  token: string | null;
  isExpired: boolean;
  errorReason?: string;
}

export async function getAuthResult(req: Request): Promise<AuthResult> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    let token = "";

    const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cur) => {
      const [k, v] = cur.trim().split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {});

    token = cookies["apex_token"];

    if (!token) {
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      const customHeader = req.headers.get("x-apex-token") || "";
      if (customHeader) {
        token = customHeader;
      }
    }

    if (!token) {
      return { user: null, token: null, isExpired: false, errorReason: "NO_TOKEN" };
    }

    let decoded: { userId: string; email: string; role: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    } catch (err: any) {
      if (err?.name === "TokenExpiredError") {
        return { user: null, token, isExpired: true, errorReason: "TOKEN_EXPIRED" };
      }
      return { user: null, token, isExpired: false, errorReason: "INVALID_TOKEN" };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return { user: null, token, isExpired: false, errorReason: "USER_NOT_FOUND" };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || undefined,
        role: user.role,
        avatar: user.avatar || undefined,
      },
      token,
      isExpired: false,
    };
  } catch (error) {
    return { user: null, token: null, isExpired: false, errorReason: "UNKNOWN_ERROR" };
  }
}

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const result = await getAuthResult(req);
  return result.user;
}
