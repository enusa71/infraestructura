import { NextResponse } from "next/server";

export async function middleware() {
  // TODO: Enable authentication later
  // For now, allow all requests without auth
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-192x192.png).*)"],
};
