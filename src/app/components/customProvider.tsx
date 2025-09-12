"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
          },
        },
      })
  );

  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering for HeroUI components
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration issues
  if (!isClient) {
    return <div style={{ display: 'none' }}>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider
        navigate={(path: string) => {
          // Prevent navigation conflicts
          if (typeof window !== 'undefined') {
            window.location.href = path;
          }
        }}
        skipFramerMotionAnimations={process.env.NODE_ENV === 'test'}
      >
        <ThemeProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
