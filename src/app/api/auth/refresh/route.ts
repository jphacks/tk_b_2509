import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE_NAME,
  CLEAR_ACCESS_COOKIE_OPTIONS,
  CLEAR_REFRESH_COOKIE_OPTIONS,
  createAuthErrorResponse,
  createAuthSuccessResponse,
  createSessionMetadata,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
  verifyRefreshToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function buildUnauthorizedResponse(message: string, status: number = 401) {
  const response = NextResponse.json(createAuthErrorResponse(message), {
    status,
  });
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
    ...CLEAR_ACCESS_COOKIE_OPTIONS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
    ...CLEAR_REFRESH_COOKIE_OPTIONS,
  });
  return response;
}

async function revokeAllSessions(userId: bigint, reason: string) {
  await prisma.userSession.updateMany({
    where: { userId, revoked: false },
    data: {
      revoked: true,
      revoked_at: new Date(),
      revoked_reason: reason,
    },
  });
}

export async function POST(request: NextRequest) {
  const refreshTokenRaw =
    request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;

  if (!refreshTokenRaw) {
    return buildUnauthorizedResponse("リフレッシュトークンがありません");
  }

  const claims = verifyRefreshToken(refreshTokenRaw);
  if (!claims || !claims.jti) {
    return buildUnauthorizedResponse("リフレッシュトークンが無効です");
  }

  const session = await prisma.userSession.findUnique({
    where: { id: claims.jti },
  });

  if (!session) {
    return buildUnauthorizedResponse("セッションが存在しません");
  }

  const incomingHash = hashToken(refreshTokenRaw);

  if (session.revoked || session.refresh_token_hash !== incomingHash) {
    await revokeAllSessions(session.userId, "refresh_token_reuse_detected");
    return buildUnauthorizedResponse("セッションが失効しました");
  }

  const sessionId = randomUUID();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    null;
  const { fingerprintHash, deviceLabel } = createSessionMetadata({
    userAgent: request.headers.get("user-agent"),
    ip: clientIp,
  });

  const refreshToken = generateRefreshToken({
    userId: session.userId.toString(),
    name: claims.name,
    sessionId,
  });
  const accessToken = generateAccessToken({
    userId: session.userId.toString(),
    name: claims.name,
    sessionId,
  });

  await prisma.$transaction([
    prisma.userSession.update({
      where: { id: session.id },
      data: {
        revoked: true,
        revoked_at: new Date(),
        revoked_reason: "rotated",
        last_used_at: new Date(),
      },
    }),
    prisma.userSession.create({
      data: {
        id: sessionId,
        userId: session.userId,
        issued_at: new Date(),
        expires_at: refreshToken.expiresAt,
        last_used_at: new Date(),
        refresh_token_hash: hashToken(refreshToken.token),
        fingerprint_hash: fingerprintHash,
        device_label: deviceLabel,
      },
    }),
  ]);

  const response = NextResponse.json(
    createAuthSuccessResponse(
      {
        id: session.userId.toString(),
        name: claims.name,
      },
      accessToken,
    ),
  );

  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken.token, {
    ...ACCESS_COOKIE_OPTIONS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken.token, {
    ...REFRESH_COOKIE_OPTIONS,
  });

  return response;
}
