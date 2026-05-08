export interface LowStockProduct {
  id: number
  name: string
  sku: string
  stockQuantity: number
  minStockLevel: number
  category: string
  branch: string
  lastUpdated: string
}

export interface LowStockSummary {
  total: number
  critical: number
  warning: number
}

export interface InventoryItem {
  id: number
  name: string
  sku: string
  stockQuantity: number
  unitCost: number
  totalValue: number
  category: string
  branch: string
  lastUpdated: string
}

export interface InventorySummary {
  totalValue: number
  totalItems: number
  totalProducts: number
  averageValue: number
}

export interface TopMovingItem {
  id: number
  name: string
  sku: string
  totalSold: number
  revenue: number
  avgPrice: number
  category: string
  branch: string
  lastSold: string
  trend: 'up' | 'down' | 'stable'
}

export interface TopMovingSummary {
  totalRevenue: number
  totalSold: number
  totalProducts: number
  averageRevenue: number
}

export interface CustomerHistory {
  id: number
  customerName: string
  phoneNumber: string
  carType: string
  licensePlate: string
  totalJobs: number
  totalSpent: number
  lastVisit: string
  favoriteServices: string[]
  branch: string
  status: 'active' | 'inactive' | 'vip'
}

export interface CustomerSummary {
  totalCustomers: number
  activeCustomers: number
  vipCustomers: number
  totalRevenue: number
}

export interface ReportsSummary {
  lowStockCount: number
  totalInventoryValue: number
  customerCount: number
  topMovingCount: number
  // Today's data
  todayRevenue: number
  todayJobs: number
  todayNewCustomers: number
  todayProductsSold: number
}

export interface JobDetail {
  id: number
  jobNumber: string
  date: string
  serviceType: string
  totalAmount: number
  status: string
  items: Array<{
    productName: string
    qty: number
    unitPrice: number
    totalPrice: number
  }>
  notes?: string
  // ข้อมูลการเงิน
  subtotal?: number        // ยอดรวมสินค้า
  laborCost?: number       // ค่าแรง
  vatAmount?: number       // ภาษีมูลค่าเพิ่ม
  grandTotal?: number      // ยอดรวมทั้งหมด
}
