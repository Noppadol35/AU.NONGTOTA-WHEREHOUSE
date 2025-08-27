"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { reportsService, InventoryItem, InventorySummary } from '@/services/reportsService'

export default function InventoryValueReport() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [summary, setSummary] = useState<InventorySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const data = await reportsService.getInventoryValueReport()
        setItems(data.items)
        setSummary(data.summary)
      } catch (error: any) {
        console.error('Failed to fetch inventory value report:', error)
        setError(error.message || 'Failed to fetch inventory value report')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{summary?.totalValue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">รวมมูลค่าสินค้าทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนรายการ</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.totalItems?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">ชิ้น</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
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
            <CardTitle className="text-sm font-medium">มูลค่าเฉลี่ย</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ฿{summary?.averageValue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">ต่อรายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>รายการสินค้า</span>
          </CardTitle>
          <CardDescription>
            รายการสินค้าทั้งหมดพร้อมมูลค่า
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">สินค้า</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">หมวดหมู่</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">สาขา</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">คงเหลือ</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">ต้นทุน/หน่วย</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">มูลค่ารวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-green-50 transition-all duration-200">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.sku}
                      </span>
                    </td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{item.branch}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.stockQuantity <= 10 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.stockQuantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      ฿{item.unitCost.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-medium text-green-600">
                      ฿{item.totalValue.toLocaleString()}
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
