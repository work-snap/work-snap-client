import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Temporarily disable strict mode for HeroUI compatibility
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "img1.kakaocdn.net",
      "t1.kakaocdn.net",
      "cdn.worksnap.com",
      "example.com",
    ], // 외부 이미지 도메인 허용
  },

  // Exclude development/test files from build tracing
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  outputFileTracingExcludes: {
    "*": [
      "./src/app/develop-test/**/*",
      "./src/app/test-*/**/*",
      "./src/app/**/test*.tsx",
      "./src/app/admin/**/*",
      "./src/app/debug-*/**/*",
      "./src/app/modal-*/**/*",
      "./src/app/heroui-test/**/*",
      "./src/app/simple-modal-test/**/*",
      "./src/app/stable-modal-test/**/*",
      "./src/app/advanced-modal-debug/**/*",
      "./src/app/no-animation-modal/**/*",
      "./src/app/force-modal-visible/**/*",
      "./src/app/vanilla-modal/**/*",
    ],
  },

  async rewrites() {
    // 환경 변수 기반 API URL 설정
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
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
<<<<<<< HEAD
                    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"} https://*.ngrok-free.app https://*.ngrok.io`,
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
                    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}`,
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
