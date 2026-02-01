export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/recurring/:path*",
    "/budgets/:path*",
    "/wishlist/:path*",
  ],
};
