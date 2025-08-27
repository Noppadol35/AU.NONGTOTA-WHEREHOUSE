const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

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

class ReportsService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies for session authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Session expired or invalid
        throw new Error('Authentication required')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Low Stock Report
  async getLowStockReport(): Promise<{ products: LowStockProduct[], summary: LowStockSummary }> {
    return this.fetchWithAuth('/reports/low-stock')
  }

  // Inventory Value Report
  async getInventoryValueReport(): Promise<{ items: InventoryItem[], summary: InventorySummary }> {
    return this.fetchWithAuth('/reports/inventory-value')
  }

  // Top Moving Items Report
  async getTopMovingItemsReport(timeRange: 'week' | 'month' | 'quarter' = 'month'): Promise<{ items: TopMovingItem[], summary: TopMovingSummary }> {
    return this.fetchWithAuth(`/reports/top-moving?timeRange=${timeRange}`)
  }

  // Customer History Report
  async getCustomerHistoryReport(filter: 'all' | 'active' | 'vip' = 'all'): Promise<{ customers: CustomerHistory[], summary: CustomerSummary }> {
    return this.fetchWithAuth(`/reports/customer-history?filter=${filter}`)
  }

  // Reports Summary
  async getReportsSummary(): Promise<ReportsSummary> {
    return this.fetchWithAuth('/reports/summary')
  }

  // Customer Job Details
  async getCustomerJobs(customerId: number): Promise<JobDetail[]> {
    try {
      const jobs = await this.fetchWithAuth(`/reports/customer-jobs/${customerId}`);

      // ดึงข้อมูล Billing สำหรับแต่ละงาน
      const jobsWithBilling = await Promise.all(
        jobs.map(async (job: any) => {
          try {
            const billingResponse = await fetch(`${API_BASE_URL}/job-orders/${job.id}/bill`, {
              credentials: 'include',
            });

            if (billingResponse.ok) {
              const billingData = await billingResponse.json();
              return {
                ...job,
                subtotal: billingData.bill?.subtotal || 0,
                laborCost: billingData.bill?.laborCost || 0,
                vatAmount: billingData.bill?.vatAmount || 0,
                grandTotal: billingData.bill?.grandTotal || job.totalAmount,
              };
            }
          } catch (error) {
            console.error(`Error fetching billing for job ${job.id}:`, error);
          }

          return job;
        })
      );

      return jobsWithBilling;
    } catch (error) {
      console.error('Error fetching customer jobs:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService()
