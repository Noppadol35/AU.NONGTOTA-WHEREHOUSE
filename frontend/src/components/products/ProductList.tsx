"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import ProductForm from "./ProductForm";
import { SquarePen, Trash2, EllipsisVertical, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function ProductList() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

  const utils = trpc.useUtils();

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: categoriesData } = trpc.categories.list.useQuery();
  const categories = categoriesData?.items ?? [];

  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    q: q || undefined,
    categoryId: categoryId ?? undefined,
    page,
    pageSize: 20,
  });
  const items = productsData?.items ?? [];
  const total = productsData?.total ?? 0;

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setOpenCreate(false);
      toast.success("เพิ่มสินค้าเรียบร้อยแล้ว");
    },
    onError: (err) => {
      toast.error(err.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setOpenEdit(null);
      toast.success("บันทึกการแก้ไขเรียบร้อยแล้ว");
    },
    onError: (err) => {
      toast.error(err.message || "เกิดข้อผิดพลาดในการแก้ไขสินค้า");
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setDeleteConfirm(null);
      toast.success("ลบสินค้าเรียบร้อยแล้ว");
    },
    onError: (err) => {
      toast.error(err.message || "เกิดข้อผิดพลาดในการลบสินค้า");
    },
  });

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseCols: ColumnDef<any>[] = [
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {row.getValue("sku")}
          </Badge>
        ),
      },
      {
        accessorKey: "name",
        header: "ชื่อสินค้า",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div>
              <div className="font-medium">{p.name}</div>
              {p.description && (
                <div className="text-sm text-muted-foreground truncate max-w-[200px] lg:max-w-[300px]">
                  {p.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "หมวดหมู่",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.category?.name ?? "-"}
          </Badge>
        ),
      },
    ];

    if (user?.role === "OWNER") {
      baseCols.push({
        accessorKey: "costPrice",
        header: "ต้นทุน",
        cell: ({ row }) => {
          const cost = row.original.costPrice;
          return `฿${typeof cost === "number" ? cost.toFixed(2) : "-"}`;
        },
      });
    }

    baseCols.push(
      {
        accessorKey: "stockQuantity",
        header: "จำนวนคงเหลือ",
        cell: ({ row }) => {
          const p = row.original;
          const isLow = p.stockQuantity <= (p.minStockLevel || 0);
          return (
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isLow ? "text-destructive" : ""}`}>
                {p.stockQuantity.toLocaleString()}
              </span>
              {isLow && (
                <Badge variant="destructive" className="text-[10px] px-1 py-0 leading-none">
                  ต่ำ
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "sellPrice",
        header: "ราคาขาย",
        cell: ({ row }) => `฿${row.original.sellPrice.toFixed(2)}`,
      },
      {
        id: "actions",
        header: () => <div className="text-right">จัดการ</div>,
        meta: { className: "text-right" },
        cell: ({ row }) => {
          const p = row.original;
          if (user?.role === "WORKER") {
            return (
              <span className="text-xs text-muted-foreground italic flex justify-end items-center h-8">
                ดูข้อมูลเท่านั้น
              </span>
            );
          }
          return (
            <div className="flex justify-end">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">เปิดเมนู</span>
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenEdit(p)} className="cursor-pointer">
                    <SquarePen className="mr-2 h-4 w-4" />
                    <span>แก้ไข</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteConfirm(p)}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>ลบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }
    );

    return baseCols;
  }, [user?.role]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">จัดการสินค้า</CardTitle>
            <CardDescription>ค้นหา แก้ไข และจัดการข้อมูลสินค้าทั้งหมด</CardDescription>
          </div>
          <div>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => setOpenCreate(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มสินค้าใหม่
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">ค้นหาสินค้า</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="ค้นหาจากชื่อ, SKU หรือคำอธิบาย..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:w-64 space-y-2">
              <label className="text-sm font-medium">หมวดหมู่</label>
              <Select
                value={categoryId ? String(categoryId) : "all"}
                onValueChange={(val) => setCategoryId(val === "all" ? undefined : Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ทุกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Data Table */}
      <Card>
        <DataTable columns={columns} data={items} isLoading={isLoading} />

        {/* Pagination Info */}
        {total > 20 && (
          <div className="px-6 py-4 border-t text-sm text-muted-foreground bg-muted/20">
            แสดง <span className="font-medium text-foreground">1</span> ถึง{" "}
            <span className="font-medium text-foreground">20</span> จาก{" "}
            <span className="font-medium text-foreground">{total}</span> รายการ
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
            <DialogDescription>กรอกรายละเอียดเพื่อเพิ่มสินค้าเข้าระบบคลัง</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ProductForm
              mode="create"
              onSubmit={async (data) => { await createMutation.mutateAsync(data as any); }}
              onCancel={() => setOpenCreate(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!openEdit} onOpenChange={(open) => !open && setOpenEdit(null)}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
            <DialogDescription>แก้ไขรายละเอียดสินค้า {openEdit?.name}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {openEdit && (
              <ProductForm
                mode="edit"
                initial={{
                  id: openEdit.id,
                  sku: openEdit.sku,
                  barcode: openEdit.barcode ?? "",
                  name: openEdit.name,
                  description: openEdit.description || undefined,
                  costPrice: openEdit.costPrice,
                  sellPrice: openEdit.sellPrice,
                  minStockLevel: openEdit.minStockLevel,
                  stockQuantity: openEdit.stockQuantity,
                  categoryId: openEdit.category?.id ?? null,
                  branchId: openEdit.branchId,
                  
                }}
                onSubmit={async (data) => { await updateMutation.mutateAsync({ id: openEdit.id, ...data } as any); }}
                onCancel={() => setOpenEdit(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> ยืนยันการลบสินค้า
            </DialogTitle>
            <DialogDescription>
              คุณกำลังจะลบสินค้า <span className="font-semibold text-foreground">"{deleteConfirm?.name}"</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
              ⚠️ การกระทำนี้ไม่สามารถยกเลิกได้ และอาจส่งผลกระทบต่อประวัติการทำรายการ
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: deleteConfirm.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "กำลังลบ..." : "ลบสินค้า"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
