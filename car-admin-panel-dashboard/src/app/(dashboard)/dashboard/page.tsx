"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Car, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Demo API function
const fetchDashboardStats = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    totalCars: 1247,
    totalUsers: 342,
    totalSales: 89234,
    revenue: 2456789,
  };
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Cars",
      value: stats?.totalCars || 0,
      change: "+20.1%",
      changeType: "positive" as const,
      icon: Car,
      description: "from last month",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+180.1%",
      changeType: "positive" as const,
      icon: Users,
      description: "from last month",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Total Sales",
      value: stats?.totalSales || 0,
      change: "+19%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "from last month",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Revenue",
      value: `$${stats?.revenue?.toLocaleString() || 0}`,
      change: "+2.5%",
      changeType: "positive" as const,
      icon: BarChart3,
      description: "from last hour",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your car management dashboard
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5", stat.gradient)} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={cn("p-2 rounded-lg bg-gradient-to-br", stat.gradient)}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={cn(
                    "font-medium",
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Demo Table Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions and updates in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Data tables will be implemented here with TanStack Query for efficient data fetching and caching.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
