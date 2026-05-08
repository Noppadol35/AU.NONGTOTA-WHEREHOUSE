"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Users,
  FileText,
  AlertTriangle,
  DollarSign,
  Activity,
  Shield
} from 'lucide-react'
import { trpc } from '@/lib/trpc'

// Import report components
import LowStockReport from '@/components/reports/LowStockReport'
import InventoryValueReport from '@/components/reports/InventoryValueReport'
import TopMovingItemsReport from '@/components/reports/TopMovingItemsReport'
import CustomerHistoryReport from '@/components/reports/CustomerHistoryReport'
import DailyTrendChart from '@/components/reports/DailyTrendChart'
import TopSalesChart from '@/components/reports/TopSalesChart'
import StockAgingChart from '@/components/reports/StockAgingChart'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('low-stock')
  const [timeRange, setTimeRange] = useState<number>(7)
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if not OWNER
  useEffect(() => {
    if (user && user.role !== "OWNER") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // tRPC query for summary
  const { data: summary, isLoading: loading, error, refetch } = trpc.reports.summary.useQuery(undefined, {
    enabled: user?.role === "OWNER",
    retry: (failureCount, err: any) => {
      if (err.data?.code === 'UNAUTHORIZED') {
        router.push('/login');
        return false;
      }
      return failureCount < 3;
    }
  });

  // Show loading if user not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show access denied if not OWNER
  if (user.role !== "OWNER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงานระบบ</h1>
          <p className="text-gray-600 mt-2">ดูข้อมูลสถิติและรายงานต่างๆ ของระบบแบบเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-white border px-3 py-2 rounded-lg shadow-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>ช่วงเวลา:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="bg-transparent border-none outline-none font-bold text-blue-700 cursor-pointer"
            >
              <option value={1}>วันนี้ (1 วัน)</option>
              <option value={7}>7 วันที่ผ่านมา</option>
              <option value={30}>30 วันที่ผ่านมา</option>
              <option value={90}>3 เดือนที่ผ่านมา</option>
            </select>
          </div>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">รายได้วันนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">฿{summary?.todayRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">รวมรายได้วันนี้</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">งานวันนี้</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary?.todayJobs || 0}</div>
            <p className="text-xs text-gray-500">จำนวนงานที่เสร็จสิ้น</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">ลูกค้าใหม่</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{summary?.todayNewCustomers || 0}</div>
            <p className="text-xs text-gray-500">ลูกค้าใหม่วันนี้</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-600">สินค้าขาย</CardTitle>
            <Package className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{summary?.todayProductsSold || 0}</div>
            <p className="text-xs text-gray-500">จำนวนสินค้าที่ขาย</p>
          </CardContent>
        </Card>
      </div>

      {/* General Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">สินค้าใกล้หมด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.lowStockCount || 0}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">มูลค่าสินค้า</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">฿{summary?.totalInventoryValue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">รวมมูลค่า</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">สินค้าขายดี</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.topMovingCount || 0}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">ลูกค้าทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summary?.customerCount || 0}</div>
            <p className="text-xs text-gray-500">รายชื่อ</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Charts Zone ═══════ */}
      <div className="space-y-6">
        {/* Full width Area Chart */}
        <DailyTrendChart days={timeRange} />

        {/* Side by side Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSalesChart days={timeRange} />
          <StockAgingChart />
        </div>
      </div>

      {/* ═══════ Reports Tabs ═══════ */}
      <div className="pt-6 border-t border-gray-100">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-bold flex items-center space-x-2 text-gray-900">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>รายงานรายละเอียด</span>
          </h2>
          <p className="text-gray-500">เลือกดูข้อมูลเจาะลึกและรายการทั้งหมดของแต่ละส่วน</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-2 md:inline-flex md:w-auto md:grid-cols-none h-auto p-1 bg-muted">
              <TabsTrigger value="low-stock" className="py-2 px-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">สินค้าใกล้หมด</span>
              </TabsTrigger>
              <TabsTrigger value="inventory-value" className="py-2 px-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">มูลค่าสินค้า</span>
              </TabsTrigger>
              <TabsTrigger value="top-moving" className="py-2 px-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">สินค้าขายดี</span>
              </TabsTrigger>
              <TabsTrigger value="customer-history" className="py-2 px-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">ประวัติลูกค้า</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="low-stock" className="mt-0">
            <LowStockReport />
          </TabsContent>

          <TabsContent value="inventory-value" className="mt-0">
            <InventoryValueReport />
          </TabsContent>

          <TabsContent value="top-moving" className="mt-0">
            <TopMovingItemsReport />
          </TabsContent>

          <TabsContent value="customer-history" className="mt-0">
            <CustomerHistoryReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
