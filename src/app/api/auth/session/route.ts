import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);

  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(authResult.error ?? { error: "Unauthorized" }, {
      status: 401,
    });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: authResult.user.userId.toString(),
      name: authResult.user.name,
    },
  });
}
