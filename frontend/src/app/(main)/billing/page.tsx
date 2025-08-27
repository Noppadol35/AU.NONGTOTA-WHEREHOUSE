"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";

import BillingHeader from "@/components/billing/BillingHeader";
import JobOrderSelector from "@/components/billing/JobOrderSelector";
import JobOrderDetails from "@/components/billing/JobOrderDetails";
import StockTransactions from "@/components/billing/StockTransactions";
import PaymentSummary from "@/components/billing/PaymentSummary";
import StatusMessages from "@/components/billing/StatusMessages";
import {
  JobOrder,
  StockTransaction,
  BillingData,
} from "@/components/billing/types";

export default function BillingPage() {
  const { user } = useAuth();
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [selectedJobOrderId, setSelectedJobOrderId] = useState<number | null>(
    null
  );
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "promptpay"
  >("cash");
  const [promptPayAmount, setPromptPayAmount] = useState<number>(0);
  const [showQR, setShowQR] = useState(false);
  const [laborCost, setLaborCost] = useState<number>(0);

  // Fetch Job Orders with IN_PROGRESS status
  useEffect(() => {
    const fetchJobOrders = async () => {
      try {
        console.log("Fetching job orders with status IN_PROGRESS...");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/job-orders?status=IN_PROGRESS`,
          {
            credentials: "include",
          }
        );

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log("Job orders data:", data);
          setJobOrders(data);
        } else {
          const errorData = await response.json();
          console.error(
            "Failed to fetch job orders:",
            response.status,
            errorData
          );
        }
      } catch (error) {
        console.error("Error fetching job orders:", error);
      }
    };

    fetchJobOrders();
  }, []);

  // Fetch billing data when job order is selected
  useEffect(() => {
    if (!selectedJobOrderId) {
      setBillingData(null);
      setError(null);
      setSuccess(null);
      return;
    }

    const fetchBillingData = async () => {
      setLoading(true);
      try {
        // Fetch job order details
        console.log("Fetching job order details for ID:", selectedJobOrderId);
        const jobOrderResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/job-orders/${selectedJobOrderId}`,
          {
            credentials: "include",
          }
        );

        console.log("Job order response status:", jobOrderResponse.status);

        if (!jobOrderResponse.ok) {
          const errorData = await jobOrderResponse.json();
          console.error("Job order API error:", errorData);
          throw new Error("Failed to fetch job order");
        }

        const jobOrder = await jobOrderResponse.json();
        console.log("Fetched job order:", jobOrder);

        // Fetch stock transactions for this job order
        console.log(
          "Fetching stock transactions for job order:",
          selectedJobOrderId
        );
        const transactionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stock-transactions?jobOrderId=${selectedJobOrderId}&type=SALE`,
          {
            credentials: "include",
          }
        );

        console.log(
          "Stock transactions response status:",
          transactionsResponse.status
        );

        if (!transactionsResponse.ok) {
          const errorData = await transactionsResponse.json();
          console.error("Stock transactions API error:", errorData);
          throw new Error("Failed to fetch stock transactions");
        }

        const transactions = await transactionsResponse.json();
        console.log("Fetched stock transactions:", transactions);

        // Calculate total amount
        const totalAmount = transactions.reduce(
          (sum: number, trans: StockTransaction) =>
            sum + trans.product.sellPrice * Math.abs(trans.qtyChange),
          0
        );

        setBillingData({
          jobOrder,
          transactions,
          totalAmount,
        });

        setPromptPayAmount(totalAmount);
      } catch (error: any) {
        console.error("Error fetching billing data:", error);
        // Set error state for UI display
        setBillingData(null);
        setError(error?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [selectedJobOrderId]);

  const handlePaymentMethodChange = (method: "cash" | "promptpay") => {
    setSelectedPaymentMethod(method);
    if (method === "promptpay") {
      setShowQR(true);
    } else {
      setShowQR(false);
    }
  };

  const handleConfirmPayment = async () => {
    console.log("Confirming payment for job order:", selectedJobOrderId);
    if (!selectedJobOrderId || !billingData) return;

    setLoading(true);
    try {
      console.log("Confirming payment for job order:", selectedJobOrderId);

      // Calculate financial data
      const subtotal = billingData.transactions.reduce((sum: number, item: any) => sum + (item.product.sellPrice * Math.abs(item.qtyChange)), 0);
      
      // Use labor cost from state
      const vatAmount = Math.round((subtotal + laborCost) * 0.07); // VAT 7%
      const grandTotal = subtotal + laborCost + vatAmount;

      // Convert payment method to match backend enum
      const paymentMethodEnum = selectedPaymentMethod === 'promptpay' ? 'PROMPTPAY' : 'CASH';

      console.log("Financial data:", { subtotal, laborCost, vatAmount, grandTotal, paymentMethod: paymentMethodEnum });

      // Update job order status to COMPLETED with financial data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/job-orders/${selectedJobOrderId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentMethod: selectedPaymentMethod,
            totalAmount: grandTotal,
            completedAt: new Date().toISOString(),
            subtotal: subtotal,
            laborCost: laborCost,
            vatAmount: vatAmount,
            grandTotal: grandTotal,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete job order");
      }

      const result = await response.json();
      console.log("Job order completed:", result);

      // Set success message
      setSuccess("การชำระเงินเสร็จสิ้นแล้ว! สถานะงานถูกอัพเดทเป็น 'เสร็จสิ้น'");

      // Refresh job orders list to remove completed job
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/job-orders?status=IN_PROGRESS`,
        {
          credentials: "include",
        }
      );

      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setJobOrders(refreshedData);
      }

      // Reset form
      setSelectedJobOrderId(null);
      setBillingData(null);
      setError(null);
      setSelectedPaymentMethod("cash");
      setPromptPayAmount(0);
      setShowQR(false);
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      setError(error?.message || "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log("Downloading PDF...");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูหน้านี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-20xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <BillingHeader onPrint={handlePrint} onDownload={handleDownload} />

        {/* Job Order Selection */}
        <JobOrderSelector
          jobOrders={jobOrders}
          selectedJobOrderId={selectedJobOrderId}
          onJobOrderSelect={setSelectedJobOrderId}
        />

        {/* Status Messages */}
        <StatusMessages loading={loading} error={error} success={success} />

        {!loading && billingData && (
          <div className="grid grid-cols-1 2xl:grid-cols-4 gap-10">
            {/* Left Column - Job Order Details & Transactions */}
            <div className="2xl:col-span-3 space-y-6">
              {/* Job Order Details */}
              <JobOrderDetails jobOrder={billingData.jobOrder} />

              {/* Stock Transactions */}
              <StockTransactions transactions={billingData.transactions} />
            </div>

            {/* Right Column - Payment & Summary */}
            <div className="2xl:col-span-1 space-y-6">
              {/* Payment Summary */}
              <PaymentSummary
                transactions={billingData.transactions}
                totalAmount={billingData.totalAmount}
                selectedPaymentMethod={selectedPaymentMethod}
                promptPayAmount={promptPayAmount}
                showQR={showQR}
                laborCost={laborCost}
                onPaymentMethodChange={handlePaymentMethodChange}
                onPromptPayAmountChange={setPromptPayAmount}
                onLaborCostChange={setLaborCost}
                onConfirmPayment={handleConfirmPayment}
              />
            </div>
          </div>
        )}

        {!loading && !billingData && selectedJobOrderId && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>ไม่พบข้อมูลสำหรับงานสั่งทำที่เลือก</p>
          </div>
        )}
      </div>
    </div>
  );
}
