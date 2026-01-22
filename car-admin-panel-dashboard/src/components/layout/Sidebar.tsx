"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { usePermissions } from "@/hooks/use-permissions";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Car,
  Users,
  Settings,
  FileText,
  BarChart3,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";
import { roleAccess } from "@/lib/constants/roleAccess";

interface SidebarItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  roles?: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },

  {
    title: "Roles & Permissions",
    icon: <Users className="h-4 w-4" />,
    roles: ["super_admin", "admin"],
    children: [
      {
        title: "Roles",
        href: "/roles-permission/roles",
        roles: ["super_admin"],
      },
      {
        title: "Admins",
        href: "/roles-permission/admins",
        roles: ["super_admin"],
      },
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    roles: ["super_admin", "admin"],
    children: [
      {
        title: "Address Management",
        href: "/dashboard/settings/address-management",
        roles: ["super_admin", "admin"],
      },
      {
        title: "Vehicle Management",
        href: "/dashboard/settings/vehicle-management",
        roles: ["super_admin", "admin"],
      },
    ],
  },
];

function SidebarItem({
  item,
  level = 0,
}: {
  item: SidebarItem;
  level?: number;
}) {
  const pathname = usePathname();
  const { canAccess: checkAccess } = usePermissions();
  const { isCollapsed } = useSidebarStore();
  const hasAccess = !item.roles || checkAccess(item.roles);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href && pathname === item.href;
  const hasActiveChild = item.children?.some(
    (child) => child.href && pathname.startsWith(child.href),
  );

  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const isOpen = hasActiveChild || isManuallyOpen;

  if (!hasAccess) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="relative group">
        {item.href && !hasChildren ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-primary text-primary-foreground",
            )}
            title={item.title}
          >
            {item.icon}
          </Link>
        ) : hasChildren ? (
          <div
            className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-accent transition-colors"
            title={item.title}
          >
            {item.icon}
          </div>
        ) : null}
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover border rounded-md shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity delay-300">
          {item.title}
        </div>
      </div>
    );
  }

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-primary text-primary-foreground",
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setIsManuallyOpen(!isManuallyOpen)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            (isOpen || hasActiveChild) && "bg-accent text-accent-foreground",
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.title}</span>
          </div>
          {hasChildren && (
            <div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </button>
      )}

      {hasChildren && isOpen && !isCollapsed && (
        <div className="mt-1 space-y-1 ml-4 border-l-2 border-muted pl-4">
          {item.children?.map((child, index) => {
            // Check child role access
            if (child.roles && !checkAccess(child.roles)) {
              return null;
            }
            return (
              <SidebarItem
                key={child.href || child.title}
                item={child}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Car Admin
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarItems.map((item, index) => (
            <SidebarItem key={item.href || item.title} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
