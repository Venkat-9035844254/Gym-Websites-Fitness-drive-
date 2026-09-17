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

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
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
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

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
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      role: user.role,
      avatar: user.avatar || undefined,
    };
  } catch (error) {
    return null;
  }
}
