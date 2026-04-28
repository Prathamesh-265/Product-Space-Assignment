import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  sub: number;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, SECRET) as unknown as JwtPayload;
  return { sub: Number(decoded.sub), email: decoded.email };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
