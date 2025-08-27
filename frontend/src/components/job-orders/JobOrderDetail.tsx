"use client";
import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  X,
  User,
  Car,
  Calendar,
  Wrench,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import JobOrderForm, { JobOrderInput } from "./JobOrderForm";

export type JobOrderDetailType = {
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
  branchId?: number;
  branch?: {
    name: string;
  };
  items?: Array<{
    id: number;
    qty: number;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
};

type Props = {
  jobOrder: JobOrderDetailType;
  onClose: () => void;
  onEdit: (data: JobOrderInput) => Promise<void>;
  onDelete: () => Promise<void>;
};

export default function JobOrderDetail({
  jobOrder,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<JobOrderInput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentJobOrder, setCurrentJobOrder] =
    useState<JobOrderDetailType>(jobOrder);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debug: Log when component renders
  console.log(
    "🔍 JobOrderDetail: Component rendered with currentJobOrder:",
    currentJobOrder
  );
  console.log("🔍 JobOrderDetail: Props jobOrder:", jobOrder);

  // Ensure currentJobOrder is initialized with jobOrder if it's null
  useEffect(() => {
    if (!currentJobOrder && jobOrder) {
      console.log(
        "🔍 JobOrderDetail: Initializing currentJobOrder with jobOrder props"
      );
      setCurrentJobOrder(jobOrder);
    }
  }, [currentJobOrder, jobOrder]);

  // Function to trigger refresh
  const triggerRefresh = () => {
    console.log("🔍 JobOrderDetail: Triggering refresh...");
    setRefreshTrigger((prev) => prev + 1);
  };

  // Effect to refresh data when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && currentJobOrder?.id) {
      console.log(
        "🔍 JobOrderDetail: Refresh triggered, fetching fresh data..."
      );

      const fetchFreshData = async () => {
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
          const response = await fetch(
            `${API_URL}/job-orders/${currentJobOrder.id}`,
            {
              credentials: "include",
            }
          );

          if (response.ok) {
            const freshData = await response.json();
            console.log("🔍 JobOrderDetail: Fresh data fetched:", freshData);
            setCurrentJobOrder(freshData);
            console.log("🔍 JobOrderDetail: State updated with fresh data");
          } else {
            console.warn("🔍 JobOrderDetail: Failed to fetch fresh data");
          }
        } catch (error) {
          console.error("🔍 JobOrderDetail: Error fetching fresh data:", error);
        }
      };

      fetchFreshData();
    }
  }, [refreshTrigger, currentJobOrder?.id]);

  async function handleEdit(data: JobOrderInput) {
    setPendingEditData(data);
    setShowEditConfirm(true);
  }

  async function confirmDelete() {
    setIsLoading(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error deleting job order:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
      case "OPEN":
        return {
          label: "เปิดงาน",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-orange-50",
        };
      case "IN_PROGRESS":
        return {
          label: "กำลังดำเนินการ",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Wrench className="w-4 h-4" />,
          bgColor: "bg-blue-50",
        };
      case "COMPLETED":
        return {
          label: "เสร็จสิ้น",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-green-50",
        };
      case "CANCELLED":
        return {
          label: "ยกเลิก",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-red-50",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: "bg-gray-50",
        };
    }
  };

  // Add null check for currentJobOrder
  if (!currentJobOrder) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentJobOrder.status);

  if (mode === "edit") {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-center justify-between pb-4 md:pb-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            แก้ไขงานสั่งทำ
          </h2>
          <button
            onClick={() => setMode("view")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <JobOrderForm
          mode="edit"
          initial={jobOrder}
          onSubmit={handleEdit}
          onCancel={() => setMode("view")}
          submitLabel="บันทึกการแก้ไข"
          onSuccess={async (data) => {
            // Trigger refresh after successful update
            triggerRefresh();

            console.log("🔍 JobOrderDetail: onSuccess called with data:", data);
            console.log("🔍 JobOrderDetail: Previous state:", currentJobOrder);

            try {
              // Fetch fresh data from database to ensure all fields are updated
              console.log(
                "🔍 JobOrderDetail: Fetching fresh data from database..."
              );

              if (!currentJobOrder?.id) {
                console.error(
                  "🔍 JobOrderDetail: currentJobOrder.id is undefined, cannot fetch fresh data"
                );
                return;
              }

              const API_URL =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
              const response = await fetch(
                `${API_URL}/job-orders/${currentJobOrder.id}`,
                {
                  credentials: "include",
                }
              );

              if (response.ok) {
                const freshData = await response.json();

                // Update with complete data from database
                setCurrentJobOrder(freshData.item);
                console.log(
                  "🔍 JobOrderDetail: State updated with fresh data from database"
                );
              } else {
                console.warn(
                  "🔍 JobOrderDetail: Failed to fetch fresh data, using local update"
                );
                // Fallback: update with local data
                if (currentJobOrder) {
                  const updatedJobOrder = {
                    ...currentJobOrder,
                    ...data,
                  };
                  setCurrentJobOrder(updatedJobOrder);
                }
              }
            } catch (error) {
              console.error(
                "🔍 JobOrderDetail: Error fetching fresh data:",
                error
              );
              // Fallback: update with local data
              if (currentJobOrder) {
                const updatedJobOrder = {
                  ...currentJobOrder,
                  ...data,
                };
                setCurrentJobOrder(updatedJobOrder);
              }
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="space-y-4 pb-6 md:pb-8 border-b border-gray-200">
        {/* Job Info & Close Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 truncate">
                #{currentJobOrder.jobNumber}
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                งานสั่งทำรถยนต์
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 md:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all duration-200 hover:shadow-sm flex-shrink-0"
          >
            <X size={20} className="md:hidden" />
            <X size={24} className="hidden md:block" />
          </button>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 ${statusInfo.color} ${statusInfo.bgColor} shadow-sm transition-all duration-200 hover:shadow-md`}
        >
          {statusInfo.icon}
          <span className="font-semibold text-sm md:text-base">
            {statusInfo.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setMode("edit")}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg md:rounded-xl transition-all duration-200 font-medium hover:shadow-sm border border-blue-200 text-sm md:text-base"
          >
            <Edit2 size={16} className="md:hidden" />
            <Edit2 size={18} className="hidden md:block" />
            แก้ไข
          </button>
          <button
            onClick={triggerRefresh}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg md:rounded-xl transition-all duration-200 font-medium hover:shadow-sm border border-green-200 text-sm md:text-base"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} className="md:hidden" />
            <RefreshCw size={18} className="hidden md:block" />
            รีเฟรช
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg md:rounded-xl transition-all duration-200 font-medium hover:shadow-sm border border-red-200 text-sm md:text-base"
          >
            <Trash2 size={16} className="md:hidden" />
            <Trash2 size={18} className="hidden md:block" />
            ลบ
          </button>
        </div>
      </div>

      {/* Main Content - Simplified Information */}
      <div className="space-y-6">
        {/* Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              รายละเอียดงานสั่งทำ
            </h3>
          </div>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    ข้อมูลลูกค้า
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1 sm:gap-0">
                      <span className="text-xs md:text-sm text-gray-600">
                        ชื่อลูกค้า
                      </span>
                      <span className="text-sm md:text-sm font-medium text-gray-900 break-words">
                        {currentJobOrder.customerName}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-t border-gray-50 gap-1 sm:gap-0">
                      <span className="text-xs md:text-sm text-gray-600">
                        เบอร์โทรศัพท์
                      </span>
                      <span className="text-sm md:text-sm font-medium text-gray-900 font-mono">
                        {currentJobOrder.phoneNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-600" />
                    ข้อมูลรถยนต์
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1 sm:gap-0">
                      <span className="text-xs md:text-sm text-gray-600">
                        ประเภทรถ
                      </span>
                      <span className="text-sm md:text-sm font-medium text-gray-900 break-words">
                        {currentJobOrder.carType}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-t border-gray-50 gap-1 sm:gap-0">
                      <span className="text-xs md:text-sm text-gray-600">
                        เลขทะเบียน
                      </span>
                      <span className="text-sm md:text-sm font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded inline-block">
                        {currentJobOrder.licensePlate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Job Details */}
                <div>
                  <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-gray-600" />
                    รายละเอียดงาน
                  </h4>
                  <div className="space-y-4">
                    {currentJobOrder.issueDetail && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          ปัญหาที่พบ
                        </p>
                        <p className="text-xs md:text-sm text-gray-900 bg-gray-50 p-3 rounded border-l-4 border-gray-300 leading-relaxed break-words">
                          {currentJobOrder.issueDetail}
                        </p>
                      </div>
                    )}

                    {currentJobOrder.jobDetail && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          งานที่จะทำ
                        </p>
                        <p className="text-xs md:text-sm text-gray-900 bg-gray-50 p-3 rounded border-l-4 border-gray-300 leading-relaxed break-words">
                          {currentJobOrder.jobDetail}
                        </p>
                      </div>
                    )}

                    {!currentJobOrder.issueDetail &&
                      !currentJobOrder.jobDetail && (
                        <div className="text-center py-6 md:py-8 text-gray-500">
                          <p className="text-xs md:text-sm">
                            ไม่มีรายละเอียดเพิ่มเติม
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    ข้อมูลเพิ่มเติม
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1 sm:gap-0">
                      <span className="text-xs md:text-sm text-gray-600">
                        วันที่สร้าง
                      </span>
                      <span className="text-xs md:text-sm font-medium text-gray-900">
                        {new Date(currentJobOrder.createdAt).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-t border-gray-50 gap-1 sm:gap-0">
                      <span className="text-xs md:text-sm text-gray-600">
                        สาขา
                      </span>
                      <span className="text-xs md:text-sm font-medium text-gray-900 break-words">
                        {currentJobOrder.branch?.name || "Main Branch"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section (if exists) */}
      {currentJobOrder.items && currentJobOrder.items.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              รายการสินค้า
            </h3>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            <div className="p-4 space-y-3">
              {currentJobOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900 flex-1 pr-2">
                      {item.product.name}
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded flex-shrink-0">
                      {item.qty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    SKU: {item.product.sku}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สินค้า
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentJobOrder.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-900">
                      {item.product.name}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-600 font-mono">
                      {item.product.sku}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {item.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-lg md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg md:text-xl font-semibold text-red-600 mb-3 md:mb-4">
              ยืนยันการลบ
            </h3>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
              คุณต้องการลบงานสั่งทำนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm md:text-base"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg md:rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm md:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  "ลบ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
