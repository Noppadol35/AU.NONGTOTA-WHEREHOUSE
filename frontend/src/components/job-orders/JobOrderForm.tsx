"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  User,
  Phone,
  Car,
  Hash,
  AlertCircle,
  Wrench,
  Building,
  Save,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type JobOrderInput = {
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail?: string;
  jobDetail?: string;
  branchId: number;
};

type Props = {
  mode: "create" | "edit";
  onSubmit: (data: JobOrderInput) => Promise<void> | void;
  onCancel: () => void;
  initial?: Partial<JobOrderInput> & { id?: number };
  submitLabel?: string;
  onSuccess?: (data: JobOrderInput) => void;
};

export default function JobOrderForm({ mode, onSubmit, onCancel, initial, submitLabel, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<JobOrderInput | null>(null);

  const [form, setForm] = useState<JobOrderInput>({
    jobNumber: initial?.jobNumber || "",
    customerName: initial?.customerName || "",
    phoneNumber: initial?.phoneNumber || "",
    carType: initial?.carType || "",
    licensePlate: initial?.licensePlate || "",
    issueDetail: initial?.issueDetail || "",
    jobDetail: initial?.jobDetail || "",
    branchId: initial?.branchId || 1,
  });

  // ── tRPC: lazy query for next sequence (only in create mode when licensePlate changes)
  const [licensePlateTrigger, setLicensePlateTrigger] = useState<string | null>(null);

  const { data: seqData, isFetching: generatingJobNumber } = trpc.jobOrders.nextSequence.useQuery(
    { licensePlate: licensePlateTrigger ?? "" },
    { enabled: !!licensePlateTrigger && mode === "create" }
  );

  // ── tRPC: edit mode submits via useMutation
  const updateMutation = trpc.jobOrders.update.useMutation({
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data.item as unknown as JobOrderInput);
      setShowConfirmModal(false);
      setPendingFormData(null);
      onCancel();
    },
    onError: (err) => setError(err.message),
  });

  // When sequence data returns, build and set job number
  useEffect(() => {
    if (seqData && licensePlateTrigger) {
      const jobNumber = `JOB-${licensePlateTrigger}-${String(seqData.nextSequence).padStart(3, "0")}`;
      setForm((prev) => ({ ...prev, jobNumber }));
    }
  }, [seqData, licensePlateTrigger]);

  // Trigger sequence fetch when license plate changes in create mode
  useEffect(() => {
    if (mode === "create" && form.licensePlate.trim()) {
      const clean = form.licensePlate.trim().replace(/[^a-zA-Z0-9ก-๙]/g, "");
      setLicensePlateTrigger(clean);
    }
  }, [form.licensePlate, mode]);

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, licensePlate: e.target.value });
  };

  const handleRegenerateJobNumber = () => {
    if (form.licensePlate.trim()) {
      const clean = form.licensePlate.trim().replace(/[^a-zA-Z0-9ก-๙]/g, "");
      setLicensePlateTrigger(null); // reset to force refetch
      setTimeout(() => setLicensePlateTrigger(clean), 50);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "edit") {
      setPendingFormData(form);
      setShowConfirmModal(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  const confirmSubmit = async () => {
    if (!pendingFormData || !initial?.id) return;
    updateMutation.mutate({
      id: initial.id,
      jobNumber: pendingFormData.jobNumber,
      customerName: pendingFormData.customerName,
      phoneNumber: pendingFormData.phoneNumber,
      carType: pendingFormData.carType,
      licensePlate: pendingFormData.licensePlate,
      issueDetail: pendingFormData.issueDetail,
      jobDetail: pendingFormData.jobDetail,
    });
  };

  const isBusy = loading || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* ═══════ FIXED HEADER ═══════ */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {mode === "create" ? "สร้างงานสั่งทำใหม่" : "แก้ไขงานสั่งทำ"}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {mode === "create" ? "กรอกข้อมูลงานสั่งทำใหม่" : "อัปเดตข้อมูลงานสั่งทำ"}
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="shrink-0 -mt-1 -mr-2">
            <X className="w-4 h-4" />
            <span className="sr-only">ปิด</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        {/* ═══════ SCROLLABLE BODY ═══════ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* License Plate */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              เลขทะเบียนรถ <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.licensePlate}
              onChange={handleLicensePlateChange}
              placeholder="กข-1234"
              required
            />
            {mode === "create" && (
              <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
                เลขที่งานจะถูกสร้างอัตโนมัติเมื่อกรอกเลขทะเบียนรถ
              </p>
            )}
          </div>

          {/* Job Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              เลขที่งาน <span className="text-red-400">*</span>
              {mode === "create" && (
                <Badge variant="secondary" className="text-xs">สร้างอัตโนมัติ</Badge>
              )}
            </Label>
            <div className="relative">
              <Input
                className={mode === "create" ? "bg-muted cursor-not-allowed pr-10" : ""}
                value={form.jobNumber}
                onChange={(e) => mode === "edit" && setForm({ ...form, jobNumber: e.target.value })}
                placeholder={mode === "create" ? "กรอกเลขทะเบียนรถก่อน..." : "JOB-001"}
                readOnly={mode === "create"}
                required
              />
              {mode === "create" && form.licensePlate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRegenerateJobNumber}
                  disabled={generatingJobNumber}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  title="สร้างเลขที่งานใหม่"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingJobNumber ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
            {generatingJobNumber && (
              <p className="text-xs text-blue-600 animate-pulse">กำลังสร้างเลขที่งาน...</p>
            )}
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              ชื่อลูกค้า <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="ชื่อลูกค้า"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              เบอร์โทรศัพท์ <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="080-123-4567"
              required
            />
          </div>

          {/* Car Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              ประเภทรถ <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.carType}
              onChange={(e) => setForm({ ...form, carType: e.target.value })}
              placeholder="Toyota Camry"
              required
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              สาขา <span className="text-red-400">*</span>
            </Label>
            <Select
              value={String(form.branchId)}
              onValueChange={(val) => setForm({ ...form, branchId: Number(val) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกสาขา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Main Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Issue / Job Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              รายละเอียดปัญหา
            </Label>
            <Textarea
              rows={3}
              value={form.issueDetail ?? ""}
              onChange={(e) => setForm({ ...form, issueDetail: e.target.value })}
              placeholder="อธิบายปัญหาที่พบ..."
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              รายละเอียดงาน
            </Label>
            <Textarea
              rows={3}
              value={form.jobDetail ?? ""}
              onChange={(e) => setForm({ ...form, jobDetail: e.target.value })}
              placeholder="อธิบายงานที่จะทำ..."
            />
          </div>
        </div>
        </div>

        {/* ═══════ FIXED FOOTER ═══════ */}
        <div className="shrink-0 px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto gap-2"
            >
              <X className="w-4 h-4" />
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isBusy || (mode === "create" && !form.jobNumber)}
              className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {submitLabel || "บันทึก"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog (edit mode) */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-600">ยืนยันการแก้ไข</DialogTitle>
            <DialogDescription>
              คุณต้องการบันทึกการเปลี่ยนแปลงงานสั่งทำนี้หรือไม่?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 text-sm">สรุปการเปลี่ยนแปลง:</h4>
            <div className="space-y-2 text-sm">
              {initial?.customerName !== form.customerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ชื่อลูกค้า:</span>
                  <span className="font-medium">{initial?.customerName} → {form.customerName}</span>
                </div>
              )}
              {initial?.phoneNumber !== form.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เบอร์โทร:</span>
                  <span className="font-medium">{initial?.phoneNumber} → {form.phoneNumber}</span>
                </div>
              )}
              {initial?.carType !== form.carType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ประเภทรถ:</span>
                  <span className="font-medium">{initial?.carType} → {form.carType}</span>
                </div>
              )}
              {initial?.licensePlate !== form.licensePlate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เลขทะเบียน:</span>
                  <span className="font-medium">{initial?.licensePlate} → {form.licensePlate}</span>
                </div>
              )}
              {initial?.issueDetail !== form.issueDetail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">รายละเอียดปัญหา:</span>
                  <span className="font-medium text-blue-600">มีการเปลี่ยนแปลง</span>
                </div>
              )}
              {initial?.jobDetail !== form.jobDetail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">รายละเอียดงาน:</span>
                  <span className="font-medium text-blue-600">มีการเปลี่ยนแปลง</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isBusy}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={confirmSubmit}
              disabled={isBusy}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "ยืนยันการแก้ไข"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
