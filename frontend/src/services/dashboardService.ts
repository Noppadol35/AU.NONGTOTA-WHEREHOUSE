const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  lowStockItems: number;
  totalValue: number;
  activeUsers: number;
  recentTransactions: number;
  monthlyGrowth: number;
  topCategory: string;
  systemHealth: string;
}

export interface RecentActivity {
  id: number;
  action: string;
  product?: string;
  customer?: string;
  car?: string;
  qty?: number;
  time: string;
  type: 'stock-out' | 'stock-in' | 'job-order' | 'low-stock';
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  lowStockProducts: Array<{
    id: number;
    sku: string;
    name: string;
    stockQuantity: number;
    minStockLevel: number;
  }>;
  topProducts: Array<{
    id: number;
    sku: string;
    name: string;
    stockQuantity: number;
    sellPrice: number;
    totalValue: number;
  }>;
}

class DashboardService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      const [statsResponse, activitiesResponse, lowStockResponse, topProductsResponse] = await Promise.all([
        this.fetchStats(),
        this.fetchRecentActivities(),
        this.fetchLowStockProducts(),
        this.fetchTopProducts()
      ]);

      return {
        stats: statsResponse,
        recentActivities: activitiesResponse,
        lowStockProducts: lowStockResponse,
        topProducts: topProductsResponse
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  private async fetchStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  private async fetchRecentActivities(): Promise<RecentActivity[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-activities`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activities');
    }

    return response.json();
  }

  private async fetchLowStockProducts() {
    const response = await fetch(`${API_BASE_URL}/dashboard/low-stock-products`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch low stock products');
    }

    return response.json();
  }

  private async fetchTopProducts() {
    const response = await fetch(`${API_BASE_URL}/dashboard/top-products`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top products');
    }

    return response.json();
  }
}

export default new DashboardService();
