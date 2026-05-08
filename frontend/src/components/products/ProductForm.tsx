"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Package, Tag, DollarSign, Box, Barcode } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ProductInput = {
  sku: string;
  barcode: string;
  name: string;
  description: string | undefined;
  categoryId: number | null;
  costPrice: number;
  sellPrice: number;
  minStockLevel: number;
  branchId: number;
  stockQuantity?: number;
};

type Props = {
  mode: "create" | "edit";
  initial?: Partial<ProductInput> & { id?: number };
  onSubmit: (data: ProductInput) => Promise<void> | void;
  onCancel: () => void;
};

export default function ProductForm({ mode, initial, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<ProductInput | null>(null);

  const [form, setForm] = useState<any>({
    sku: initial?.sku ?? "",
    barcode: initial?.barcode ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? null,
    costPrice: initial?.costPrice ?? "",
    sellPrice: initial?.sellPrice ?? "",
    minStockLevel: initial?.minStockLevel ?? 1,
    branchId: initial?.branchId ?? 1,
    stockQuantity: initial?.stockQuantity ?? "",
  });

  // ── tRPC: categories list (no auth required)
  const { data: categoriesData } = trpc.categories.list.useQuery();
  const categories = categoriesData?.items ?? [];

  // ── tRPC: next SKU preview
  const [skuTrigger, setSkuTrigger] = useState<string | null>(null);
  const { data: nextSkuData } = trpc.products.nextSku.useQuery(
    { prefix: skuTrigger ?? "" },
    { enabled: !!skuTrigger }
  );
  const skuPreview = nextSkuData?.nextSku ?? null;

  useEffect(() => {
    if (initial && mode === "edit") {
      setForm({
        sku: initial.sku ?? "",
        barcode: initial.barcode ?? "",
        name: initial.name ?? "",
        description: initial.description ?? "",
        categoryId: initial.categoryId ?? null,
        costPrice: initial.costPrice ?? "",
        sellPrice: initial.sellPrice ?? "",
        minStockLevel: initial.minStockLevel ?? 1,
        branchId: initial.branchId ?? 1,
        stockQuantity: initial.stockQuantity ?? "",
      });
    }
  }, [initial, mode]);

  useEffect(() => {
    const prefix = form.sku.trim();
    if (mode === "create" && /^[A-Za-z0-9]{1,6}$/.test(prefix)) {
      setSkuTrigger(prefix);
    } else {
      setSkuTrigger(null);
    }
  }, [form.sku, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Convert empty strings to 0 before submit
    const sanitizedData: ProductInput = {
      ...form,
      costPrice: form.costPrice === "" ? 0 : Number(form.costPrice),
      sellPrice: form.sellPrice === "" ? 0 : Number(form.sellPrice),
      minStockLevel: form.minStockLevel === "" ? 0 : Number(form.minStockLevel),
      stockQuantity: form.stockQuantity === "" ? 0 : Number(form.stockQuantity),
    };
    
    setFormData(sanitizedData);
    setShowConfirmModal(true);
  }

  async function handleConfirmSubmit() {
    if (!formData) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      setShowConfirmModal(false);
      setFormData(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">ข้อมูลพื้นฐาน</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  placeholder="ABC001..."
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  maxLength={10}
                />
                {skuPreview && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      SKU ถัดไป: <span className="font-semibold">{skuPreview}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Barcode <span className="text-destructive">*</span> </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <Input
                    className="pl-10"
                    placeholder="1234567890123"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    maxLength={20}
                  />
                  
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>
                  ชื่อสินค้า 
                </Label>
                <Input
                  required
                  placeholder="ชื่อสินค้า"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label>คำอธิบาย</Label>
                <Textarea
                  rows={3}
                  className="resize-none"
                  placeholder="รายละเอียดสินค้า..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Category & Branch */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">หมวดหมู่และสาขา</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>
                  หมวดหมู่ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.categoryId ? String(form.categoryId) : undefined}
                  onValueChange={(val) => setForm({ ...form, categoryId: Number(val) })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>
                  สาขา <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={String(form.branchId)}
                  onValueChange={(val) => setForm({ ...form, branchId: Number(val) })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Main Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">ราคาและต้นทุน</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>
                  ต้นทุน (บาท) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">฿</span>
                  <Input
                    type="number"
                    required
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>
                  ราคาขาย (บาท) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">฿</span>
                  <Input
                    type="number"
                    required
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    value={form.sellPrice}
                    onChange={(e) => setForm({ ...form, sellPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Box className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">การจัดการสต็อก</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>จำนวนคงเหลือ</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div className="space-y-3">
                <Label>ระดับสต็อกต่ำสุด</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.minStockLevel}
                  onChange={(e) => setForm({ ...form, minStockLevel: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex-none flex items-center justify-end gap-4 p-6 border-t bg-background">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {mode === "create" ? "เพิ่มสินค้า" : "บันทึกการแก้ไข"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 " onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-background rounded-2xl shadow-2xl border border-border p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {mode === "create" ? "ยืนยันการเพิ่มสินค้า" : "ยืนยันการแก้ไข"}
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                {mode === "create" ? "คุณต้องการเพิ่มสินค้า" : "คุณต้องการบันทึกการแก้ไขสินค้า"}{" "}
                <span className="font-semibold text-foreground">{formData?.name}</span> หรือไม่?
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">SKU:</span>
                  <span className="text-sm font-medium text-foreground">{formData?.sku}</span>
                </div>
                {formData?.barcode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Barcode:</span>
                    <span className="text-sm font-medium text-foreground">{formData.barcode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">หมวดหมู่:</span>
                  <span className="text-sm font-medium text-foreground">
                    {categories.find((c) => c.id === formData?.categoryId)?.name || "ไม่ระบุ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ราคาขาย:</span>
                  <span className="text-sm font-medium text-foreground">฿{Number(formData?.sellPrice)?.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)}>
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ยืนยัน
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
