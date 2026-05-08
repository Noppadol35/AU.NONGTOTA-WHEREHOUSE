"use client";
import { useState, useCallback } from "react";
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
  Package,
} from "lucide-react";
import JobOrderForm, { JobOrderInput } from "./JobOrderForm";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  branch?: { name: string };
  items?: Array<{
    id: number;
    qty: number;
    product: { id: number; name: string; sku: string };
  }>;
};

type Props = {
  jobOrder: JobOrderDetailType;
  onClose: () => void;
  onEdit: (data: JobOrderInput) => Promise<void>;
  onDelete: () => Promise<void>;
};

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; variant: "outline" | "default" | "secondary" | "destructive"; icon: typeof Clock }> = {
  PENDING: { label: "เปิดงาน", variant: "outline", icon: Clock },
  OPEN: { label: "เปิดงาน", variant: "outline", icon: Clock },
  IN_PROGRESS: { label: "กำลังดำเนินการ", variant: "default", icon: Wrench },
  COMPLETED: { label: "เสร็จสิ้น", variant: "secondary", icon: CheckCircle },
  CANCELLED: { label: "ยกเลิก", variant: "destructive", icon: XCircle },
};

const DEFAULT_STATUS = { label: "ไม่ทราบ", variant: "outline" as const, icon: AlertTriangle };

// ── Component ────────────────────────────────────────────────────────────────
export default function JobOrderDetail({ jobOrder, onClose, onEdit, onDelete }: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentJobOrder, setCurrentJobOrder] = useState<JobOrderDetailType>(jobOrder);

  const utils = trpc.useUtils();

  // ── Refresh data ─────────────────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const freshData = await utils.jobOrders.getById.fetch({ id: currentJobOrder.id });
      if (freshData) setCurrentJobOrder(freshData as JobOrderDetailType);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentJobOrder.id, utils.jobOrders.getById]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Status badge ─────────────────────────────────────────────────────────
  const status = STATUS_MAP[currentJobOrder.status] ?? DEFAULT_STATUS;
  const StatusIcon = status.icon;

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "edit") {
    return (
      <JobOrderForm
        mode="edit"
        initial={jobOrder}
        onSubmit={onEdit}
        onCancel={() => setMode("view")}
        submitLabel="บันทึกการแก้ไข"
        onSuccess={async () => {
          await refreshData();
          setMode("view");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW MODE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* ═══════ FIXED HEADER ═══════ */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-foreground truncate">
                #{currentJobOrder.jobNumber}
              </h2>
              <p className="text-muted-foreground">งานสั่งทำรถยนต์</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1 -mr-2">
            <X className="w-4 h-4" />
            <span className="sr-only">ปิด</span>
          </Button>
        </div>

        {/* Status + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Badge variant={status.variant} className="gap-1.5 w-fit text-sm px-3 py-1">
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </Badge>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMode("edit")} className="gap-1.5">
              <Edit2 className="w-3.5 h-3.5" />
              แก้ไข
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              รีเฟรช
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ลบ
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════ SCROLLABLE CONTENT ═══════ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                ข้อมูลลูกค้า
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="ชื่อลูกค้า" value={currentJobOrder.customerName} />
              <Separator />
              <InfoRow label="เบอร์โทรศัพท์" value={currentJobOrder.phoneNumber} />
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                ข้อมูลรถยนต์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="ประเภทรถ" value={currentJobOrder.carType} />
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">เลขทะเบียน</span>
                <Badge variant="outline" className="font-mono font-bold">
                  {currentJobOrder.licensePlate}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                รายละเอียดงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentJobOrder.issueDetail && (
                <DetailBlock label="ปัญหาที่พบ" text={currentJobOrder.issueDetail} />
              )}
              {currentJobOrder.jobDetail && (
                <DetailBlock label="งานที่จะทำ" text={currentJobOrder.jobDetail} />
              )}
              {!currentJobOrder.issueDetail && !currentJobOrder.jobDetail && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  ไม่มีรายละเอียดเพิ่มเติม
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                ข้อมูลเพิ่มเติม
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="วันที่สร้าง"
                value={new Date(currentJobOrder.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              />
              <Separator />
              <InfoRow label="สาขา" value={currentJobOrder.branch?.name || "สาขาหลัก"} />
            </CardContent>
          </Card>
        </div>

        {/* ═══════ ITEMS TABLE ═══════ */}
        {currentJobOrder.items && currentJobOrder.items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                รายการสินค้า
                <Badge variant="secondary" className="ml-auto">
                  {currentJobOrder.items.length} รายการ
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile */}
              <div className="block md:hidden space-y-3">
                {currentJobOrder.items.map((item) => (
                  <div key={item.id} className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium flex-1 pr-2">{item.product.name}</span>
                      <Badge>{item.qty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>สินค้า</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">จำนวน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentJobOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.product.sku}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{item.qty}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════ DELETE DIALOG ═══════ */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบงานสั่งทำ #{currentJobOrder.jobNumber} หรือไม่?
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="gap-2">
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <p className="text-sm bg-muted p-3 rounded-md border-l-4 border-muted-foreground/30 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
