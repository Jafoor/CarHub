"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, LogOut, Bell, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SettingsDropdown } from "./SettingsDropdown";

export function Header() {
  const { user, clearAuth } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      clearAuth();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      clearAuth();
      router.push("/sign-in");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isCollapsed ? "left-16 right-0" : "left-64 right-0",
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Settings */}
          <SettingsDropdown />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <div className="relative border-l pl-4 ml-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">
                      {user?.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace("_", " ") || ""}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40" align="end">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
