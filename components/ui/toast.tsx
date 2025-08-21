"use client";

import * as React from "react";

// Legacy compatibility - redirect to react-hot-toast if needed
export const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const ToastViewport = () => null;

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses =
      variant === "destructive"
        ? "bg-red-50 border-red-200 text-red-800"
        : variant === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-white border-gray-200 text-gray-900";

    return (
      <div
        ref={ref}
        className={`pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all ${variantClasses} ${
          className || ""
        }`}
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-100 ${
      className || ""
    }`}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`absolute right-1 top-1 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 group-hover:opacity-100 ${
      className || ""
    }`}
    {...props}
  >
    ✕
  </button>
));
ToastClose.displayName = "ToastClose";

export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm font-semibold ${className || ""}`}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm opacity-90 ${className || ""}`}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export type ToastComponentProps = React.ComponentProps<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
