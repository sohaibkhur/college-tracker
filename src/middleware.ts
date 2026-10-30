import { NextResponse, type NextRequest } from "next/server";

// Once online, anyone with the link could see or change your data, so require a password.
export function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("APP_PASSWORD is not set", { status: 500 });
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const supplied = atob(encoded).split(":").slice(1).join(":");
    if (supplied === password) return NextResponse.next();
  }

  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="College Tracker"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
