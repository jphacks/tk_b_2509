import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  CLEAR_ACCESS_COOKIE_OPTIONS,
  CLEAR_REFRESH_COOKIE_OPTIONS,
  hashToken,
  REFRESH_TOKEN_COOKIE_NAME,
  verifyRefreshToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function buildLogoutResponse() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
    ...CLEAR_ACCESS_COOKIE_OPTIONS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
    ...CLEAR_REFRESH_COOKIE_OPTIONS,
  });
  return response;
}

export async function POST(request: NextRequest) {
  const refreshTokenRaw =
    request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;

  if (refreshTokenRaw) {
    const claims = verifyRefreshToken(refreshTokenRaw);
    if (claims?.jti) {
      const session = await prisma.userSession.findUnique({
        where: { id: claims.jti },
      });
      if (
        session &&
        !session.revoked &&
        session.refresh_token_hash === hashToken(refreshTokenRaw)
      ) {
        await prisma.userSession.update({
          where: { id: session.id },
          data: {
            revoked: true,
            revoked_at: new Date(),
            revoked_reason: "logout",
          },
        });
      }
    }
  }

  return buildLogoutResponse();
}
