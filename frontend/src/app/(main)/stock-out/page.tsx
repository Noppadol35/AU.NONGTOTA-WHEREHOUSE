"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { PackageMinus, Info } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JobOrderSelector from "@/components/stock-out/JobOrderSelector";
import JobOrderDetailCard from "@/components/stock-out/JobOrderDetailCard";
import ProductSearch from "@/components/stock-out/ProductSearch";
import IssueSummary from "@/components/stock-out/IssueSummary";

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
  const [lastIssuedSummary, setLastIssuedSummary] = useState<{
    jobNumber: string;
    items: IssuedItem[];
  } | null>(null);

  // Fetch job order detail via tRPC
  const { data: selectedJobData, refetch: refetchJobOrder } = trpc.jobOrders.getById.useQuery(
    { id: selectedJobId! },
    { enabled: !!selectedJobId }
  );
  const selectedJobDetail = selectedJobData as JobOrderDetail | undefined;

  // Mutations
  const stockOutMutation = trpc.jobOrders.stockOut.useMutation({
    onSuccess: (result) => {
      setLastIssuedSummary({
        jobNumber: result.jobOrder?.jobNumber || selectedJobDetail?.jobNumber || "",
        items: (result.issuedProducts || []) as IssuedItem[],
      });
      toast.success("ออกสินค้าสำเร็จแล้ว");
      refetchJobOrder();
    },
    onError: (err) => {
      toast.error(err.message || "ไม่สามารถออกสินค้าได้");
    },
  });

  const removeItemMutation = trpc.jobOrders.removeItem.useMutation({
    onSuccess: () => {
      toast.success("ลบรายการสำเร็จ");
      refetchJobOrder();
    },
    onError: (err) => {
      toast.error(err.message || "ไม่สามารถลบรายการได้");
    },
  });

  async function handleIssueItems(
    items: Array<{ productId: number; qty: number; product: any }>
  ) {
    if (!selectedJobId) return;
    stockOutMutation.mutate({
      id: selectedJobId,
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
    });
  }

  async function handleDeleteItem(itemId: number) {
    if (!selectedJobId) return;
    removeItemMutation.mutate({ id: selectedJobId, itemId });
  }

  async function refreshJobOrderDetails() {
    if (selectedJobId) {
      refetchJobOrder();
    }
  }

  const loading = stockOutMutation.isPending || removeItemMutation.isPending;

  if (!user) {
    return <div className="text-center py-8">กรุณาเข้าสู่ระบบ</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg">
        <CardContent className="p-4 md:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
              <PackageMinus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">เบิกสินค้า (Stock Out)</h1>
              <p className="text-sm text-gray-500 mt-1">เลือกงานที่ต้องการเบิกสินค้าและทำการเบิกใช้สินค้าจากคลัง</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <JobOrderSelector
            selectedJobId={selectedJobId}
            onJobSelect={(id) => {
              setSelectedJobId(id);
              setLastIssuedSummary(null);
            }}
          />

          <ProductSearch
            jobOrderId={selectedJobId}
            onIssueItems={handleIssueItems}
            loading={loading}
            onRefreshJobOrder={refreshJobOrderDetails}
          />
        </div>

        {/* Right Column */}
        <div className="xl:col-span-1">
          <div className="sticky top-20 space-y-4 md:space-y-6">
            {/* Last Issued Summary */}
            {lastIssuedSummary && (
              <IssueSummary
                jobNumber={lastIssuedSummary.jobNumber}
                items={lastIssuedSummary.items}
              />
            )}

            {/* Quick Stats */}
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">สถิติการเบิกสินค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">งานที่เลือก</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {selectedJobDetail ? `Job #${selectedJobDetail.jobNumber}` : "ยังไม่ได้เลือก"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">สถานะ</span>
                  {selectedJobDetail ? (
                    <Badge className={
                      selectedJobDetail.status === "COMPLETED" ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : selectedJobDetail.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      : selectedJobDetail.status === "CANCELLED" ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }>
                      {selectedJobDetail.status === "COMPLETED" ? "เสร็จสิ้น"
                        : selectedJobDetail.status === "IN_PROGRESS" ? "กำลังดำเนินการ"
                        : selectedJobDetail.status === "CANCELLED" ? "ยกเลิก"
                        : selectedJobDetail.status === "OPEN" ? "เปิดงาน"
                        : "ไม่ทราบ"}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">จำนวนรายการ</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {selectedJobDetail?.items?.length || 0} รายการ
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Job Order Detail Card */}
            {selectedJobDetail && (
              <JobOrderDetailCard
                jobOrder={selectedJobDetail}
                onItemDelete={handleDeleteItem}
              />
            )}

            {/* Help Section */}
            <Card className="border-none shadow-lg bg-blue-50/60">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">วิธีใช้งาน</h4>
                    <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                      <li>เลือกงานที่ต้องการเบิกสินค้า</li>
                      <li>ค้นหาสินค้าที่ต้องการเบิก</li>
                      <li>ระบุจำนวนและกดเบิกสินค้า</li>
                      <li>ตรวจสอบรายการเบิกล่าสุด</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
