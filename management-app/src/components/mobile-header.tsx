"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        "md:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              RuggyLand
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
              Admin
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Avatar
            name={user?.email || "User"}
            size="sm"
            className="ml-1"
          />
        </div>
      </div>
    </header>
  );
}
