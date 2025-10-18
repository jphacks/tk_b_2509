import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET_FROM_ENV = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN_ENV = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN_ENV =
  process.env.JWT_REFRESH_EXPIRES_IN || "30d";

const DEFAULT_ACCESS_MAX_AGE_SECONDS = 60 * 15; // 15 minutes
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
export const REFRESH_TOKEN_COOKIE_PATH = "/api/auth/refresh";

const COOKIE_BASE = Object.freeze({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

// `jsonwebtoken` の `expiresIn` を秒数に変換
function expiresInToSeconds(
  value: jwt.SignOptions["expiresIn"],
): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = /^(\d+)([dhms])$/.exec(value);
  if (!match) {
    return null;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return amount * 60 * 60 * 24;
    case "h":
      return amount * 60 * 60;
    case "m":
      return amount * 60;
    case "s":
      return amount;
    default:
      return null;
  }
}

function resolveJwtSecret(): string {
  if (JWT_SECRET_FROM_ENV) {
    return JWT_SECRET_FROM_ENV;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable must be set in production.",
    );
  }
  return "development-secret";
}

function validateExpiresIn(value: string): jwt.SignOptions["expiresIn"] {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  if (/^\d+[dhms]$/.test(value)) {
    return value as jwt.SignOptions["expiresIn"];
  }
  return "7d";
}

const validatedAccessExpiresIn = validateExpiresIn(ACCESS_TOKEN_EXPIRES_IN_ENV);
const validatedRefreshExpiresIn = validateExpiresIn(
  REFRESH_TOKEN_EXPIRES_IN_ENV,
);

const ACCESS_TOKEN_MAX_AGE =
  expiresInToSeconds(validatedAccessExpiresIn) ??
  DEFAULT_ACCESS_MAX_AGE_SECONDS;
const REFRESH_TOKEN_MAX_AGE =
  expiresInToSeconds(validatedRefreshExpiresIn) ??
  DEFAULT_REFRESH_MAX_AGE_SECONDS;

export const ACCESS_COOKIE_OPTIONS = Object.freeze({
  ...COOKIE_BASE,
  maxAge: ACCESS_TOKEN_MAX_AGE,
});

export const REFRESH_COOKIE_OPTIONS = Object.freeze({
  ...COOKIE_BASE,
  sameSite: "strict" as const,
  path: REFRESH_TOKEN_COOKIE_PATH,
  maxAge: REFRESH_TOKEN_MAX_AGE,
});

export const CLEAR_ACCESS_COOKIE_OPTIONS = Object.freeze({
  ...ACCESS_COOKIE_OPTIONS,
  maxAge: 0,
});

export const CLEAR_REFRESH_COOKIE_OPTIONS = Object.freeze({
  ...REFRESH_COOKIE_OPTIONS,
  maxAge: 0,
});

export type AccessTokenClaims = jwt.JwtPayload & {
  sub: string;
  name: string;
  sid: string;
};

export type RefreshTokenClaims = jwt.JwtPayload & {
  sub: string;
  name: string;
  jti: string;
  sid: string;
};

export type TokenIssueResult = {
  token: string;
  expiresAt: Date;
};

export function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

function resolveExpiryDate(maxAgeSeconds: number): Date {
  return new Date(Date.now() + maxAgeSeconds * 1000);
}

export function generateAccessToken(args: {
  userId: string | number;
  name: string;
  sessionId: string;
}): TokenIssueResult {
  const payload = {
    sub: `${args.userId}`,
    name: args.name,
    sid: args.sessionId,
  };
  const token = jwt.sign(payload, resolveJwtSecret(), {
    expiresIn: validatedAccessExpiresIn,
    jwtid: randomUUID(),
  });
  return {
    token,
    expiresAt: resolveExpiryDate(ACCESS_TOKEN_MAX_AGE),
  };
}

export function generateRefreshToken(args: {
  userId: string | number;
  name: string;
  sessionId: string;
}): TokenIssueResult {
  const payload = {
    sub: `${args.userId}`,
    name: args.name,
    sid: args.sessionId,
  };
  const token = jwt.sign(payload, resolveJwtSecret(), {
    expiresIn: validatedRefreshExpiresIn,
    jwtid: args.sessionId,
  });
  return {
    token,
    expiresAt: resolveExpiryDate(REFRESH_TOKEN_MAX_AGE),
  };
}

export function verifyAccessToken(token: string): AccessTokenClaims | null {
  try {
    return jwt.verify(token, resolveJwtSecret()) as AccessTokenClaims;
  } catch (_error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenClaims | null {
  try {
    return jwt.verify(token, resolveJwtSecret()) as RefreshTokenClaims;
  } catch (_error) {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionMetadata(input: {
  userAgent: string | null;
  ip: string | null;
}) {
  const fingerprintSource = [input.ip?.trim(), input.userAgent?.trim()]
    .filter(Boolean)
    .join("|");

  const fingerprintHash = fingerprintSource
    ? hashToken(fingerprintSource)
    : null;
  const deviceLabel = input.userAgent ? input.userAgent.slice(0, 120) : null;

  return {
    fingerprintHash,
    deviceLabel,
  };
}

export function createAuthErrorResponse(message: string = "認証が必要です") {
  return {
    error: message,
    code: "AUTH_REQUIRED",
  };
}

type AuthUser = {
  id: string;
  name: string;
};

export function createAuthSuccessResponse(
  user: AuthUser,
  accessToken: TokenIssueResult,
) {
  return {
    token: accessToken.token,
    tokenExpiresAt: accessToken.expiresAt.toISOString(),
    user,
  };
}

export function extractTokenFromHeader(
  header: string | null | undefined,
): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}
