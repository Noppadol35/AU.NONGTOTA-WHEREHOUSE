"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import JobOrderSelector from "@/components/stock-out/JobOrderSelector";
import JobOrderDetailCard from "@/components/stock-out/JobOrderDetailCard";
import ProductSearch from "@/components/stock-out/ProductSearch";
import IssueSummary from "@/components/stock-out/IssueSummary";
import AlertBox from "@/components/ui/AlertBox";

type JobOrderDetail = {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail: string;
  jobDetail: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    qty: number;
    product?: {
      id: number;
      name: string;
      sku: string;
    } | null;
  }>;
};

type IssuedItem = {
  productId: number;
  qtyIssued: number;
  remainingStock: number;
  product?: {
    sku: string;
    name: string;
  } | null;
};

export default function StockOutPage() {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJobDetail, setSelectedJobDetail] =
    useState<JobOrderDetail | null>(null);
  const [lastIssuedSummary, setLastIssuedSummary] = useState<{
    jobNumber: string;
    items: IssuedItem[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "warning" | "error">(
    "success"
  );
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (selectedJobId) {
      fetchJobOrderDetail(selectedJobId);
    } else {
      setSelectedJobDetail(null);
      setLastIssuedSummary(null);
    }
  }, [selectedJobId]);

  async function fetchJobOrderDetail(jobId: number) {
    try {
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${API_URL}/job-orders/${jobId}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch job order detail");
      }

      const data = await res.json();
      console.log("Fetched job order detail:", data);
      setSelectedJobDetail(data);
    } catch (err) {
      console.error("Failed to fetch job order detail:", err);
      showAlert("error", "ไม่สามารถดึงข้อมูล Job Order ได้");
    }
  }

  // Function to show alerts
  const showAlert = (
    type: "success" | "warning" | "error",
    message: string
  ) => {
    console.log("🎯 showAlert called with:", { type, message });
    setAlertType(type);
    setAlertMessage(message);
    setAlertOpen(true);
    console.log("🎯 Alert state set:", { type, message, open: true });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlertOpen(false);
  };

  async function handleIssueItems(
    items: Array<{ productId: number; qty: number; product: any }>
  ) {
    if (!selectedJobId) return;

    try {
      setLoading(true);
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${API_URL}/job-orders/${selectedJobId}/stock-out`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ items }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to issue items");
      }

      const result = await res.json();
      console.log("Stock out result:", result);

      // Update the job order detail with the new data
      if (result.jobOrder) {
        setSelectedJobDetail(result.jobOrder);
      }

      // Set the last issued summary
      setLastIssuedSummary({
        jobNumber:
          result.jobOrder?.jobNumber || selectedJobDetail?.jobNumber || "",
        items: result.issuedProducts || [],
      });

      showAlert("success", "ออกสินค้าสำเร็จแล้ว");

      // Refresh job order detail
      await fetchJobOrderDetail(selectedJobId);
    } catch (err) {
      console.error("Failed to issue items:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "ไม่สามารถออกสินค้าได้"
      );
    } finally {
      setLoading(false);
    }
  }

  // Function to refresh job order details
  async function refreshJobOrderDetails() {
    if (selectedJobId) {
      await fetchJobOrderDetail(selectedJobId);
    }
  }

  async function handleDeleteItem(itemId: number) {
    if (!selectedJobId) return;

    try {
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${API_URL}/job-orders/${selectedJobId}/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete item");
      }

      // Refresh job order details
      await fetchJobOrderDetail(selectedJobId);
      showAlert("success", "ลบรายการสำเร็จ");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete item";
      showAlert("error", errorMessage);
    }
  }

  if (!user) {
    return <div className="text-center py-8">กรุณาเข้าสู่ระบบ</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6 p-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            ระบบเบิกสินค้า
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            เลือกงานที่ต้องการเบิกสินค้าและทำการเบิกใช้สินค้าจากคลัง
          </p>
        </div>
      </div>

      {/* Alert Box */}
      <AlertBox
        open={alertOpen}
        type={alertType}
        message={alertMessage}
        onClose={closeAlert}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Job Order Selection & Details - Scrollable */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Job Order Selector */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <JobOrderSelector
              selectedJobId={selectedJobId}
              onJobSelect={setSelectedJobId}
            />
          </div>

          {/* Product Search & Issue */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <ProductSearch
              jobOrderId={selectedJobId}
              onIssueItems={handleIssueItems}
              loading={loading}
              onRefreshJobOrder={() =>
                selectedJobId && fetchJobOrderDetail(selectedJobId)
              }
            />
          </div>
        </div>

        {/* Right Column - Summary & History - Fixed/Sticky */}
        <div className="xl:col-span-1">
          <div className="sticky top-20 space-y-4 sm:space-y-6">
            {/* Last Issued Summary */}
            {lastIssuedSummary && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      รายการเบิกล่าสุด
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Job #{lastIssuedSummary.jobNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {lastIssuedSummary.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.qtyIssued}-${item.remainingStock}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.product?.name ||
                            `Product ID: ${item.productId}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.product?.sku}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="font-semibold text-gray-900 text-sm">
                          {item.qtyIssued} ชิ้น
                        </p>
                        <p className="text-xs text-gray-500">
                          เหลือ: {item.remainingStock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                สถิติการเบิกสินค้า
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    งานที่เลือก
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {selectedJobDetail
                      ? `Job #${selectedJobDetail.jobNumber}`
                      : "ยังไม่ได้เลือก"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    สถานะ
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedJobDetail?.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : selectedJobDetail?.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : selectedJobDetail?.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedJobDetail?.status === "COMPLETED"
                      ? "เสร็จสิ้น"
                      : selectedJobDetail?.status === "IN_PROGRESS"
                      ? "กำลังดำเนินการ"
                      : selectedJobDetail?.status === "CANCELLED"
                      ? "ยกเลิก"
                      : selectedJobDetail?.status === "OPEN"
                      ? "เปิดงาน"
                      : "ไม่ทราบสถานะ"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    จำนวนรายการ
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {selectedJobDetail?.items?.length || 0} รายการ
                  </span>
                </div>
              </div>
            </div>

            {/* Job Order Detail Card - Moved here */}
            {selectedJobDetail && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <JobOrderDetailCard
                  jobOrder={selectedJobDetail}
                  onItemDelete={handleDeleteItem}
                />
              </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                    วิธีใช้งาน
                  </h4>
                  <ol className="text-xs sm:text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>เลือกงานที่ต้องการเบิกสินค้า</li>
                    <li>ค้นหาสินค้าที่ต้องการเบิก</li>
                    <li>ระบุจำนวนและกดเบิกสินค้า</li>
                    <li>ตรวจสอบรายการเบิกล่าสุด</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">กำลังประมวลผล...</p>
          </div>
        </div>
      )}
    </div>
  );
}
