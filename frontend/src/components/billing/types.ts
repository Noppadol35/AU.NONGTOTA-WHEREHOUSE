export interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail?: string;
  jobDetail?: string;
  status: string;
  createdAt: string;
  branchId: number;
  branch: {
    name: string;
  };
}

export interface StockTransaction {
  id: number;
  productId: number;
  product: {
    name: string;
    sku: string;
    sellPrice: number;
  };
  qtyChange: number;
  type: "SALE";
  createdAt: string;
}

export interface BillingData {
  jobOrder: JobOrder;
  transactions: StockTransaction[];
  totalAmount: number;
}
