"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./ThemeProvider";
import { UserProvider } from "@/components/UserProvider";

export default function CustomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
            gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider
        navigate={(path: string) => {
          // Prevent navigation conflicts
          if (typeof window !== "undefined") {
            window.location.href = path;
          }
        }}
        skipFramerMotionAnimations={process.env.NODE_ENV === "test"}
      >
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
