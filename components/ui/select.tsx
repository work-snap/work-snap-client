"use client";

import { Select, SelectItem, SelectSection } from "@heroui/react";

// Re-export HeroUI Select components for compatibility
export { Select, SelectItem, SelectSection };

// Legacy compatibility aliases
export const SelectGroup = SelectSection;
export const SelectValue = Select;
export const SelectTrigger = Select;
export const SelectContent = Select;
export const SelectLabel = SelectSection;
export const SelectSeparator = () => <div className="h-px bg-divider my-1" />;