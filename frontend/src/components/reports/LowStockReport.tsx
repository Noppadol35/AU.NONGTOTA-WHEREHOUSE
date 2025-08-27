"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Package, TrendingDown, AlertCircle } from 'lucide-react'
import { reportsService, LowStockProduct, LowStockSummary } from '@/services/reportsService'

export default function LowStockReport() {
  const [products, setProducts] = useState<LowStockProduct[]>([])
  const [summary, setSummary] = useState<LowStockSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const data = await reportsService.getLowStockReport()
        setProducts(data.products)
        setSummary(data.summary)
      } catch (error: any) {
        console.error('Failed to fetch low stock report:', error)
        setError(error.message || 'Failed to fetch low stock report')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStockLevel = (stockQuantity: number, minStockLevel: number) => {
    const percentage = (stockQuantity / minStockLevel) * 100
    if (percentage <= 30) return 'critical'
    if (percentage <= 50) return 'warning'
    return 'low'
  }

  const getStockLevelBadge = (stockQuantity: number, minStockLevel: number) => {
    const level = getStockLevel(stockQuantity, minStockLevel)
    switch (level) {
      case 'critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Critical</span>
      case 'warning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Warning</span>
      case 'low':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Low</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Normal</span>
    }
  }

  const getStockLevelIcon = (stockQuantity: number, minStockLevel: number) => {
    const level = getStockLevel(stockQuantity, minStockLevel)
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <TrendingDown className="w-4 h-4 text-orange-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">สินค้า Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary?.critical?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">≤ 30% ของ min stock</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">สินค้า Warning</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary?.warning?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">31-50% ของ min stock</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.total?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-500">รายการที่ใกล้หมด</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>รายการสินค้าใกล้หมด</span>
          </CardTitle>
          <CardDescription>
            สินค้าที่มีจำนวนคงเหลือต่ำกว่าหรือเท่ากับ 10 ชิ้น
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
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">ขั้นต่ำ</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">อัพเดทล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-red-50 transition-all duration-200">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.sku}
                      </span>
                    </td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">{product.branch}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {getStockLevelIcon(product.stockQuantity, product.minStockLevel)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stockQuantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {product.stockQuantity.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.minStockLevel.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {getStockLevelBadge(product.stockQuantity, product.minStockLevel)}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {product.lastUpdated}
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
