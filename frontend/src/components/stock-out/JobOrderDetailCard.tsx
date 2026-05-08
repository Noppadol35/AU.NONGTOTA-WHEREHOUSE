"use client";
import { useState } from "react";
import { Trash2, Car, Phone, User, ShieldCheck, ClipboardList, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type JobOrderItem = {
  id: number;
  qty: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  } | null;
};

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
  items: JobOrderItem[];
};

type Props = {
  jobOrder: JobOrderDetail;
  onItemDelete: (itemId: number) => Promise<void>;
};

export default function JobOrderDetailCard({ jobOrder, onItemDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<null | { itemId: number; name: string }>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">เสร็จสิ้น</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">กำลังดำเนินการ</Badge>;
      case "CANCELLED": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">ยกเลิก</Badge>;
      case "OPEN": return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">เปิดงาน</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const infoItems = [
    { icon: User, label: "ลูกค้า", value: jobOrder.customerName, color: "bg-blue-100 text-blue-600" },
    { icon: Phone, label: "เบอร์โทร", value: jobOrder.phoneNumber, color: "bg-green-100 text-green-600" },
    { icon: Car, label: "ประเภทรถ", value: jobOrder.carType, color: "bg-purple-100 text-purple-600" },
    { icon: ShieldCheck, label: "ทะเบียน", value: jobOrder.licensePlate, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <>
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">รายละเอียดงาน #{jobOrder.jobNumber}</CardTitle>
              <CardDescription>ข้อมูลงานและประวัติการเบิกสินค้า</CardDescription>
            </div>
            {getStatusBadge(jobOrder.status)}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color.split(" ")[0]}`}>
                  <item.icon className={`w-5 h-5 ${item.color.split(" ")[1]}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Job Details */}
          {(jobOrder.issueDetail || jobOrder.jobDetail) && (
            <div className="p-4 bg-gray-50/80 rounded-xl space-y-3">
              {jobOrder.issueDetail && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">อาการเสีย</p>
                  <p className="text-sm text-gray-900">{jobOrder.issueDetail}</p>
                </div>
              )}
              {jobOrder.jobDetail && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">รายละเอียดงาน</p>
                  <p className="text-sm text-gray-900">{jobOrder.jobDetail}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            สร้างเมื่อ: {new Date(jobOrder.createdAt).toLocaleString("th-TH")}
          </div>

          <Separator />

          {/* Consumption History */}
          {jobOrder.items && jobOrder.items.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">ประวัติการเบิกสินค้า</h4>
                <Badge variant="secondary" className="ml-auto">{jobOrder.items.length} รายการ</Badge>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow>
                      <TableHead className="pl-4">SKU</TableHead>
                      <TableHead>ชื่อสินค้า</TableHead>
                      <TableHead className="text-center w-[100px]">จำนวน</TableHead>
                      <TableHead className="text-right w-[60px] pr-4"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobOrder.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-sm pl-4">{item.product?.sku || "-"}</TableCell>
                        <TableCell className="text-sm">{item.product?.name || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{item.qty} ชิ้น</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDelete({ itemId: item.id, name: item.product?.name || "-" })}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">ยังไม่มีประวัติการเบิกสินค้า</p>
              <p className="text-gray-400 text-xs mt-1">สินค้าที่เบิกจะแสดงที่นี่</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              ต้องการลบ &ldquo;{confirmDelete?.name}&rdquo; ออกจากประวัติการเบิกหรือไม่? สต็อกจะถูกคืนกลับอัตโนมัติ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                if (!confirmDelete) return;
                setIsDeleting(true);
                try {
                  await onItemDelete(confirmDelete.itemId);
                  setConfirmDelete(null);
                } catch (err) {
                  console.error("Failed to delete item:", err);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              ลบรายการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
