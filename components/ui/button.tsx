"use client";

import { Button as HeroUIButton } from "@heroui/react";

// Re-export HeroUI Button for compatibility
export const Button = HeroUIButton;

// Legacy compatibility for existing code
export const buttonVariants = () => "";
export interface ButtonProps extends React.ComponentProps<typeof HeroUIButton> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}