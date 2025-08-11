import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img1.kakaocdn.net", "t1.kakaocdn.net", "cdn.worksnap.com"], // 외부 이미지 도메인 허용
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        // API endpoints
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
      {
        // All pages
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
                    "img-src 'self' data: https:",
                    "font-src 'self' https://cdn.jsdelivr.net",
                    "connect-src 'self' http://localhost:8080",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                    "block-all-mixed-content",
                    "upgrade-insecure-requests",
                  ].join("; ")
                : [
                    "default-src 'self'",
                    "script-src 'self'",
                    "style-src 'self' https://cdn.jsdelivr.net",
                    "img-src 'self' data: https:",
                    "font-src 'self' https://cdn.jsdelivr.net",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                    "block-all-mixed-content",
                    "upgrade-insecure-requests",
                  ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
