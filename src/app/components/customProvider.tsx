"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./ThemeProvider";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "react-hot-toast";

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

  return (
    <HeroUIProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            {children}
            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '400px',
                  padding: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  style: {
                    background: '#F0FDF4',
                    color: '#166534',
                    border: '1px solid #BBF7D0',
                  },
                  iconTheme: {
                    primary: '#22C55E',
                    secondary: '#F0FDF4',
                  },
                },
                error: {
                  style: {
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                  },
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FEF2F2',
                  },
                },
                loading: {
                  style: {
                    background: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #E5E7EB',
                  },
                },
              }}
            />
          </UserProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
