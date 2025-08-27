"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Package, BarChart3 } from 'lucide-react'
import { reportsService, TopMovingItem, TopMovingSummary } from '@/services/reportsService'

export default function TopMovingItemsReport() {
  const [items, setItems] = useState<TopMovingItem[]>([])
  const [summary, setSummary] = useState<TopMovingSummary | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        setLoading(true)
        const data = await reportsService.getTopMovingItemsReport(timeRange)
        setItems(data.items)
        setSummary(data.summary)
      } catch (error: any) {
        console.error('Failed to fetch top moving items report:', error)
        setError(error.message || 'Failed to fetch top moving items report')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as 'week' | 'month' | 'quarter')
  }

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'week': return 'สัปดาห์นี้'
      case 'month': return 'เดือนนี้'
      case 'quarter': return 'ไตรมาสนี้'
      default: return 'เดือนนี้'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>เกิดข้อผิดพลาด: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">สินค้าขายดี</h3>
          <p className="text-sm text-gray-600">สินค้าที่ขายได้มากที่สุดใน{getTimeRangeLabel(timeRange)}</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="week">สัปดาห์นี้</option>
          <option value="month">เดือนนี้</option>
          <option value="quarter">ไตรมาสนี้</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{summary?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">รายได้รวม</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนขาย</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.totalSold?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">ชิ้น</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าขายดี</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary?.totalProducts?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้เฉลี่ย</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ฿{summary?.averageRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">ต่อรายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Moving Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>สินค้าขายดี Top 20</span>
          </CardTitle>
          <CardDescription>
            สินค้าที่ขายได้มากที่สุดเรียงตามจำนวนการขาย
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">อันดับ</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">สินค้า</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">หมวดหมู่</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">จำนวนขาย</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">ราคาเฉลี่ย</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">รายได้</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">ขายล่าสุด</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">แนวโน้ม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.slice(0, 20).map((item, index) => (
                  <tr key={`${item.id}-${index}`} className="hover:bg-blue-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 
                        index < 10 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.sku}
                      </span>
                    </td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.totalSold.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      ฿{item.avgPrice.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-medium text-green-600">
                      ฿{item.revenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-sm text-gray-500">
                      {item.lastSold}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.trend === 'up' ? 'bg-green-100 text-green-800' : 
                        item.trend === 'down' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                        <span>{item.trend === 'up' ? 'ขึ้น' : item.trend === 'down' ? 'ลง' : 'คงที่'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
