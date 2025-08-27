"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Package, AlertTriangle, DollarSign, Users, RefreshCw } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import dashboardService, { DashboardData } from "@/services/dashboardService";
import QuickActions from "@/components/dashboard/QuickAddProduct";
import DashboardRevenueChart from "@/components/dashboard/DashboardRevenueChart";

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh dashboard data every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // 5 minutes

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData();
      console.log("Dashboard data received:", data);
      console.log("Low stock products:", data.lowStockProducts);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("ไม่สามารถโหลดข้อมูล Dashboard ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูหน้านี้</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
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
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              สวัสดี, {user?.fullName || "ผู้ใช้"} 👋🏻
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              ยินดีต้อนรับสู่ระบบจัดการคลังอะไหล่ อู่น้อง. โตต้า
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'กำลังอัพเดท...' : 'อัพเดทข้อมูล'}
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">วันนี้</p>
              <p className="text-base md:text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Optimized for iPad Pro */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          icon={Package}
          title="สินค้าทั้งหมด"
          value={`${stats.totalProducts.toLocaleString()} รายการ`}
          subtitle={`จำนวนสินค้า ${stats.totalQuantity.toLocaleString()} ชิ้น`}
          color="blue"
        />
        <StatsCard
          icon={AlertTriangle}
          title="สินค้าใกล้หมด"
          value={`${stats.lowStockItems.toLocaleString()} รายการ`}
          color="red"
        />
        <StatsCard
          icon={DollarSign}
          title="มูลค่าสินค้า"
          value={`฿${stats.totalValue.toLocaleString()}`}
          color="green"
          subtitle="มูลค่ารวมทั้งหมด"
        />
        <StatsCard
          icon={Users}
          title="ผู้ใช้งาน"
          value={stats.activeUsers}
          color="purple"
        />
      </div>

      {/* Main Content Grid - Optimized for iPad Pro */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - Low Stock Alert & Quick Actions */}
        <div className="md:col-span-4 space-y-4 md:space-y-6">
          {/* Low Stock Alert */}
          <LowStockAlert products={dashboardData?.lowStockProducts || []} />
          
          {/* Quick Actions - Moved to left column for better balance */}
          <QuickActions />
        </div>

        {/* Right Column - Recent Activities & Chart */}
        <div className="md:col-span-8 space-y-4 md:space-y-6">
          {/* Recent Activities */}
          <RecentActivities
            activities={dashboardData?.recentActivities || []}
          />
          
          {/* Dashboard Revenue Chart */}
          {/* <DashboardRevenueChart /> */}
        </div>
      </div>
    </div>
  );
}
