import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth";
import { getAuth } from "@/lib/auth/server";

// Use the SDK's cookie/OAuth handling. APIs enforce their own sessions and JSON
// responses; public setup pages remain usable before credentials are supplied.
const proxy = isAuthConfigured()
  ? getAuth().middleware({
      loginUrl: "/sign-in",
      publicRoutes: [
        "/",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/api",
      ],
    })
  : () => NextResponse.next();
export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
