"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";

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
  const [selectedJobOrderId, setSelectedJobOrderId] = useState<number | null>(null);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "promptpay">("cash");
  const [promptPayAmount, setPromptPayAmount] = useState<number>(0);
  const [showQR, setShowQR] = useState(false);
  const [laborCost, setLaborCost] = useState<number>(0);

  // Fetch Job Orders with IN_PROGRESS status via tRPC
  const { data: jobOrdersData } = trpc.jobOrders.list.useQuery(
    { status: "IN_PROGRESS" },
    { enabled: true }
  );
  const jobOrders = (jobOrdersData || []) as JobOrder[];

  // Fetch selected job order details via tRPC
  const { data: selectedJobData, isLoading: jobLoading } = trpc.jobOrders.getById.useQuery(
    { id: selectedJobOrderId! },
    { enabled: !!selectedJobOrderId }
  );

  // Fetch stock transactions via tRPC
  const { data: stockTxData, isLoading: txLoading } = trpc.stockTransactions.list.useQuery(
    { jobOrderId: selectedJobOrderId!, type: "SALE" },
    { enabled: !!selectedJobOrderId }
  );

  const loading = jobLoading || txLoading;

  // Build billingData when both are ready
  const transactions = (stockTxData?.items || []) as StockTransaction[];
  const totalAmount = transactions.reduce(
    (sum, t) => sum + (t as any).product.sellPrice * Math.abs(t.qtyChange),
    0
  );

  const computedBillingData: BillingData | null =
    selectedJobData && transactions.length >= 0
      ? {
          jobOrder: selectedJobData as unknown as JobOrder,
          transactions,
          totalAmount,
        }
      : null;

  // completeMutation
  const completeMutation = trpc.jobOrders.complete.useMutation({
    onSuccess: () => {
      toast.success("การชำระเงินเสร็จสิ้นแล้ว! สถานะงานถูกอัพเดทเป็น 'เสร็จสิ้น'");
      setSuccess("การชำระเงินเสร็จสิ้นแล้ว!");
      setSelectedJobOrderId(null);
      setBillingData(null);
      setError(null);
      setSelectedPaymentMethod("cash");
      setPromptPayAmount(0);
      setShowQR(false);
      setLaborCost(0);
    },
    onError: (err) => {
      toast.error(err.message || "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน");
      setError(err.message || "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน");
    },
  });

  const handlePaymentMethodChange = (method: "cash" | "promptpay") => {
    setSelectedPaymentMethod(method);
    setShowQR(method === "promptpay");
  };

  const handleConfirmPayment = async () => {
    if (!selectedJobOrderId || !computedBillingData) return;

    const subtotal = computedBillingData.transactions.reduce(
      (sum, item: any) => sum + item.product.sellPrice * Math.abs(item.qtyChange),
      0
    );
    const vatAmount = Math.round((subtotal + laborCost) * 0.07);
    const grandTotal = subtotal + laborCost + vatAmount;
    const paymentMethodEnum = selectedPaymentMethod === "promptpay" ? "PROMPTPAY" : "CASH";

    completeMutation.mutate({
      id: selectedJobOrderId,
      paymentMethod: paymentMethodEnum,
      totalAmount: grandTotal,
      completedAt: new Date().toISOString(),
      subtotal,
      laborCost,
      vatAmount,
      grandTotal,
    });
  };

  // ── Generate PromptPay QR as base64 data URL ─────────────────────────────
  const generateQrDataUrl = useCallback(async (amount: number): Promise<string | undefined> => {
    const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_QR_ID;
    if (!promptPayId || amount <= 0) return undefined;
    try {
      const payload = generatePayload(promptPayId, { amount });
      const url = await QRCode.toDataURL(payload, { width: 200, margin: 2 });
      return url;
    } catch {
      return undefined;
    }
  }, []);

  // ── Print Receipt (opens PDF in new tab) ─────────────────────────────────
  const handlePrint = useCallback(async () => {
    if (!computedBillingData) {
      toast.error("กรุณาเลือกงานก่อนพิมพ์ใบเสร็จ");
      return;
    }

    toast.loading("กำลังสร้างใบเสร็จ...", { id: "receipt" });

    try {
      const subtotal = computedBillingData.totalAmount + laborCost;
      const vatAmount = subtotal * 0.07;
      const grandTotal = subtotal + vatAmount;

      // Generate QR code data URL
      const qrCodeDataUrl = await generateQrDataUrl(grandTotal);

      // Dynamically import react-pdf (SSR-safe)
      const { pdf } = await import("@react-pdf/renderer");
      const { default: ReceiptPDF } = await import("@/components/billing/ReceiptPDF");

      const receiptData = {
        jobNumber: computedBillingData.jobOrder.jobNumber,
        customerName: computedBillingData.jobOrder.customerName,
        phoneNumber: computedBillingData.jobOrder.phoneNumber,
        carType: computedBillingData.jobOrder.carType,
        transactions: computedBillingData.transactions,
        totalAmount: computedBillingData.totalAmount,
        laborCost,
        paymentMethod: selectedPaymentMethod,
        qrCodeDataUrl,
      };

      const blob = await pdf(<ReceiptPDF data={receiptData} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      toast.success("สร้างใบเสร็จเรียบร้อย!", { id: "receipt" });
    } catch (err) {
      console.error("Receipt generation error:", err);
      toast.error("ไม่สามารถสร้างใบเสร็จได้", { id: "receipt" });
    }
  }, [computedBillingData, laborCost, selectedPaymentMethod, generateQrDataUrl]);

  const handleDownload = useCallback(async () => {
    if (!computedBillingData) {
      toast.error("กรุณาเลือกงานก่อนดาวน์โหลดใบเสร็จ");
      return;
    }

    toast.loading("กำลังสร้างไฟล์ PDF...", { id: "download" });

    try {
      const subtotal = computedBillingData.totalAmount + laborCost;
      const vatAmount = subtotal * 0.07;
      const grandTotal = subtotal + vatAmount;

      const qrCodeDataUrl = await generateQrDataUrl(grandTotal);

      const { pdf } = await import("@react-pdf/renderer");
      const { default: ReceiptPDF } = await import("@/components/billing/ReceiptPDF");

      const receiptData = {
        jobNumber: computedBillingData.jobOrder.jobNumber,
        customerName: computedBillingData.jobOrder.customerName,
        phoneNumber: computedBillingData.jobOrder.phoneNumber,
        carType: computedBillingData.jobOrder.carType,
        transactions: computedBillingData.transactions,
        totalAmount: computedBillingData.totalAmount,
        laborCost,
        paymentMethod: selectedPaymentMethod,
        qrCodeDataUrl,
      };

      const blob = await pdf(<ReceiptPDF data={receiptData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${computedBillingData.jobOrder.jobNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("ดาวน์โหลดใบเสร็จเรียบร้อย!", { id: "download" });
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("ไม่สามารถดาวน์โหลดได้", { id: "download" });
    }
  }, [computedBillingData, laborCost, selectedPaymentMethod, generateQrDataUrl]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูหน้านี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <BillingHeader onPrint={handlePrint} onDownload={handleDownload} />

      {/* Job Order Selection */}
      <JobOrderSelector
        jobOrders={jobOrders}
        selectedJobOrderId={selectedJobOrderId}
        onJobOrderSelect={(id) => {
          setSelectedJobOrderId(id);
          setError(null);
          setSuccess(null);
          setLaborCost(0);
        }}
      />

      {/* Status Messages */}
      <StatusMessages loading={loading} error={error} success={success} />

      {!loading && computedBillingData && (
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-4 md:gap-6">
          {/* Left Column */}
          <div className="2xl:col-span-3 space-y-4 md:space-y-6">
            <JobOrderDetails jobOrder={computedBillingData.jobOrder} />
            <StockTransactions transactions={computedBillingData.transactions} />
          </div>

          {/* Right Column */}
          <div className="2xl:col-span-1">
            <PaymentSummary
              transactions={computedBillingData.transactions}
              totalAmount={computedBillingData.totalAmount}
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

      {!loading && !computedBillingData && selectedJobOrderId && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-medium">ไม่พบข้อมูลสำหรับงานสั่งทำที่เลือก</p>
        </div>
      )}
    </div>
  );
}
