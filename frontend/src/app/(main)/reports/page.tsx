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
import { reportsService, ReportsSummary } from '@/services/reportsService'

// Import report components
import LowStockReport from '@/components/reports/LowStockReport'
import InventoryValueReport from '@/components/reports/InventoryValueReport'
import TopMovingItemsReport from '@/components/reports/TopMovingItemsReport'
import CustomerHistoryReport from '@/components/reports/CustomerHistoryReport'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('low-stock')
  const [summary, setSummary] = useState<ReportsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if not OWNER
  useEffect(() => {
    if (user && user.role !== "OWNER") {
      router.push("/dashboard");
    }
  }, [user, router]);

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

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setError(null)
        const data = await reportsService.getReportsSummary()
        setSummary(data)
      } catch (error: any) {
        console.error('Failed to fetch reports summary:', error)
        if (error.message === 'Authentication required') {
          // Redirect to login if authentication failed
          router.push('/login')
          return
        }
        setError(error.message || 'Failed to fetch reports summary')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [router])

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
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงานระบบ</h1>
          <p className="text-gray-600 mt-2">ดูข้อมูลสถิติและรายงานต่างๆ ของระบบ</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <FileText className="w-6 h-6" />
          <span className="text-sm">Reports Dashboard</span>
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

      {/* Reports Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>รายงานรายละเอียด</span>
          </CardTitle>
          <CardDescription>
            เลือกประเภทรายงานที่ต้องการดู
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="low-stock" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">สินค้าใกล้หมด</span>
              </TabsTrigger>
              <TabsTrigger value="inventory-value" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">มูลค่าสินค้า</span>
              </TabsTrigger>
              <TabsTrigger value="top-moving" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">สินค้าขายดี</span>
              </TabsTrigger>
              <TabsTrigger value="customer-history" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">ประวัติลูกค้า</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="low-stock" className="mt-6">
              <LowStockReport />
            </TabsContent>

            <TabsContent value="inventory-value" className="mt-6">
              <InventoryValueReport />
            </TabsContent>

            <TabsContent value="top-moving" className="mt-6">
              <TopMovingItemsReport />
            </TabsContent>

            <TabsContent value="customer-history" className="mt-6">
              <CustomerHistoryReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


