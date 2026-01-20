"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, tokens } = useAuth();
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();

  const isLoggedIn = isAuthenticated || !!tokens;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/sign-in");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Header />
        <div className="p-6 pt-24">{children}</div>
      </main>
    </div>
  );
}
