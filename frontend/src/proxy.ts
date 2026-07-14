import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function contentSecurityPolicy(nonce: string) {
  const development = process.env.NODE_ENV === "development";
  const apiOrigin = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").origin;
    } catch {
      return "http://localhost:3000";
    }
  })();

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://res.cloudinary.com ${apiOrigin}`,
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} https://api.cloudinary.com${development ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

async function currentUser(request: NextRequest): Promise<SessionUser | null> {
  const target = (process.env.API_PROXY_TARGET || "http://localhost:3000").replace(/\/$/, "");
  try {
    const options = {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store" as const,
    };
    let response = await fetch(`${target}/api/v1/auth/me`, options);
    // A valid refresh session still protects navigation when the short-lived
    // access token has expired. The browser API client rotates it on its next
    // protected API request.
    if (!response.ok && request.cookies.has("refresh_token")) {
      response = await fetch(`${target}/api/v1/auth/session`, options);
    }
    return response.ok ? ((await response.json()) as SessionUser) : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const hasCookie = Boolean(
    request.cookies.get("access_token")?.value ||
      request.cookies.get("refresh_token")?.value,
  );
  const path = request.nextUrl.pathname;
  const authRoute = path.startsWith("/feed") || path === "/login" || path === "/register";
  const user = authRoute && hasCookie ? await currentUser(request) : null;
  let response: NextResponse;

  if (path.startsWith("/feed") && !user) {
    response = NextResponse.redirect(new URL("/login", request.url));
    // A failed session lookup means any authentication cookies presented by
    // the browser are stale or invalid. Expire them on the redirect so later
    // requests do not repeatedly attempt the same invalid session.
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
  } else if ((path === "/login" || path === "/register") && user) {
    response = NextResponse.redirect(new URL("/feed", request.url));
  } else {
    if (user) {
      requestHeaders.set(
        "x-auth-user",
        Buffer.from(JSON.stringify(user)).toString("base64url"),
      );
    }
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
