const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BillingData {
  jobOrderId: number;
  subtotal: number;        // ยอดรวมสินค้า
  laborCost: number;       // ค่าแรง
  vatAmount: number;       // ภาษีมูลค่าเพิ่ม
  grandTotal: number;      // ยอดรวมทั้งหมด
  paymentMethod: 'cash' | 'promptpay';
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export interface BillingResponse {
  success: boolean;
  message: string;
  billingId?: number;
  grandTotal?: number;
}

class BillingService {
  // คำนวณ Grand Total
  calculateGrandTotal(subtotal: number, laborCost: number, vatAmount: number): number {
    return subtotal + laborCost + vatAmount;
  }

  // คำนวณ VAT (7%)
  calculateVAT(subtotal: number, laborCost: number): number {
    const baseAmount = subtotal + laborCost;
    return Math.round(baseAmount * 0.07);
  }

  // สร้าง Billing และบันทึกการชำระเงิน
  async createBilling(billingData: BillingData): Promise<BillingResponse> {
    try {
      // คำนวณ Grand Total อัตโนมัติ
      const calculatedGrandTotal = this.calculateGrandTotal(
        billingData.subtotal,
        billingData.laborCost,
        billingData.vatAmount
      );

      // อัปเดต billingData ด้วย grandTotal ที่คำนวณได้
      const updatedBillingData = {
        ...billingData,
        grandTotal: calculatedGrandTotal
      };

      console.log('🔍 BillingService: Creating billing with data:', updatedBillingData);

      // ใช้ endpoint ของ job-orders/complete แทน
      const response = await fetch(`${API_BASE_URL}/job-orders/${billingData.jobOrderId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethod: billingData.paymentMethod,
          totalAmount: calculatedGrandTotal,
          completedAt: new Date().toISOString(),
          subtotal: billingData.subtotal,
          laborCost: billingData.laborCost,
          vatAmount: billingData.vatAmount,
          grandTotal: calculatedGrandTotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔍 BillingService: Error response:', errorData);
        throw new Error(`Failed to create billing: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log('🔍 BillingService: Billing created successfully:', result);

      return {
        success: true,
        message: 'สร้างบิลและบันทึกการชำระเงินเรียบร้อยแล้ว',
        billingId: result.bill?.id,
        grandTotal: calculatedGrandTotal,
      };
    } catch (error: any) {
      console.error('🔍 BillingService: Error creating billing:', error);
      return {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาดในการสร้างบิล',
      };
    }
  }

  // อัปเดต Job Order ด้วยข้อมูลการเงิน
  async updateJobOrderWithBilling(jobOrderId: number, billingData: BillingData): Promise<boolean> {
    try {
      const grandTotal = this.calculateGrandTotal(
        billingData.subtotal,
        billingData.laborCost,
        billingData.vatAmount
      );

      const updateData = {
        subtotal: billingData.subtotal,
        laborCost: billingData.laborCost,
        vatAmount: billingData.vatAmount,
        grandTotal: grandTotal,
        status: 'COMPLETED', // อัปเดตสถานะเป็นเสร็จสิ้น
      };

      console.log('🔍 BillingService: Updating job order with billing data:', updateData);

      const response = await fetch(`${API_BASE_URL}/job-orders/${jobOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔍 BillingService: Error updating job order:', errorData);
        throw new Error(`Failed to update job order: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log('🔍 BillingService: Job order updated successfully:', result);

      return true;
    } catch (error: any) {
      console.error('🔍 BillingService: Error updating job order:', error);
      return false;
    }
  }

  // ดึงข้อมูล Billing ของ Job Order
  async getJobOrderBilling(jobOrderId: number): Promise<BillingData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/job-order/${jobOrderId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // ไม่มีข้อมูล Billing
        }
        throw new Error(`Failed to fetch billing: ${response.status}`);
      }

      const billingData = await response.json();
      return billingData;
    } catch (error: any) {
      console.error('🔍 BillingService: Error fetching billing:', error);
      return null;
    }
  }

  // ยืนยันการชำระเงินสด
  async confirmCashPayment(jobOrderId: number, subtotal: number, laborCost: number): Promise<BillingResponse> {
    const vatAmount = this.calculateVAT(subtotal, laborCost);
    
    const billingData: BillingData = {
      jobOrderId,
      subtotal,
      laborCost,
      vatAmount,
      grandTotal: 0, // จะถูกคำนวณอัตโนมัติ
      paymentMethod: 'cash',
      paymentStatus: 'completed',
    };

    return this.createBilling(billingData);
  }

  // ยืนยันการชำระเงิน Prompt Pay
  async confirmPromptPayPayment(jobOrderId: number, subtotal: number, laborCost: number): Promise<BillingResponse> {
    const vatAmount = this.calculateVAT(subtotal, laborCost);
    
    const billingData: BillingData = {
      jobOrderId,
      subtotal,
      laborCost,
      vatAmount,
      grandTotal: 0, // จะถูกคำนวณอัตโนมัติ
      paymentMethod: 'promptpay',
      paymentStatus: 'completed',
    };

    return this.createBilling(billingData);
  }
}

export const billingService = new BillingService();
export default billingService;
