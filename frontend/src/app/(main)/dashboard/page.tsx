"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Package, AlertTriangle, DollarSign, Users, RefreshCw } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import QuickActions from "@/components/dashboard/QuickAddProduct";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  // ── tRPC queries ──────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: activities, isLoading: activitiesLoading } = trpc.dashboard.recentActivities.useQuery();
  const { data: lowStockProducts, isLoading: lowStockLoading } = trpc.dashboard.lowStockProducts.useQuery();

  const isLoading = authLoading || statsLoading || activitiesLoading || lowStockLoading;

  const handleManualRefresh = () => {
    utils.dashboard.stats.invalidate();
    utils.dashboard.recentActivities.invalidate();
    utils.dashboard.lowStockProducts.invalidate();
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-muted-foreground">คุณต้องเข้าสู่ระบบเพื่อดูหน้านี้</p>
        </div>
      </div>
    );
  }

  const PageHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("th-TH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <Button
        onClick={handleManualRefresh}
        disabled={isLoading}
        variant="outline"
        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm rounded-xl h-10"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "กำลังอัพเดท..." : "อัพเดทข้อมูล"}
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <PageHeader />
        
        {/* Quick Actions (Keep static even while loading if possible, or omit) */}
        
        <div className="p-1 space-y-4 md:space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[100px] md:h-[120px] rounded-xl" />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            <div className="md:col-span-4 space-y-4 md:space-y-6">
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[250px] rounded-xl" />
            </div>
            <div className="md:col-span-8">
              <Skeleton className="h-[674px] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeStats = stats ?? {
    totalProducts: 0,
    totalQuantity: 0,
    lowStockItems: 0,
    totalValue: 0,
    activeUsers: 0,
    recentTransactions: 0,
    monthlyGrowth: 0,
    topCategory: "ไม่มีข้อมูล",
    systemHealth: "ไม่ทราบ",
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader />

      {/* Quick Actions moved to top */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          icon={Package}
          title="สินค้าทั้งหมด"
          value={`${safeStats.totalProducts.toLocaleString()} รายการ`}
          subtitle={`จำนวนสินค้า ${safeStats.totalQuantity.toLocaleString()} ชิ้น`}
          color="blue"
        />
        <StatsCard
          icon={AlertTriangle}
          title="สินค้าใกล้หมด"
          value={`${safeStats.lowStockItems.toLocaleString()} รายการ`}
          color="red"
        />
        <StatsCard
          icon={DollarSign}
          title="มูลค่าสินค้า"
          value={`฿${safeStats.totalValue.toLocaleString()}`}
          color="green"
          subtitle="มูลค่ารวมทั้งหมด"
        />
        <StatsCard
          icon={Users}
          title="ผู้ใช้งาน"
          value={safeStats.activeUsers}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="md:col-span-4 space-y-4 md:space-y-6">
          <LowStockAlert products={lowStockProducts ?? []} />
        </div>

        {/* Right Column */}
        <div className="md:col-span-8 space-y-4 md:space-y-6">
          <RecentActivities activities={activities ?? []} />
        </div>
      </div>
    </div>
  );
}
