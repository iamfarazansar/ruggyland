"use client";

import { cn, getInitials, getColorFromString } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-14 h-14 text-lg",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = getInitials(name || "");
  const bgColor = getColorFromString(name || "default");

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white",
        sizeClasses[size],
        bgColor,
        className
      )}
    >
      {initials}
    </div>
  );
}
