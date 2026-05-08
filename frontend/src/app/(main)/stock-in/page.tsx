"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Package, Search, History, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarcodeScannerDialog } from "@/components/products/BarcodeScannerDialog";

interface StockInItem {
  id: string;
  product: {
    id: number;
    sku: string;
    barcode: string | null;
    name: string;
    description?: string | null;
    costPrice: number;
  };
  addDate: Date;
  quantity: number;
}

export default function StockInPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [stockInItems, setStockInItems] = useState<StockInItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // ── Lazy barcode search via tRPC ─────────────────────────────────────────────
  const searchQuery = trpc.products.search.useQuery(
    { barcode: pendingBarcode ?? "" },
    { enabled: !!pendingBarcode, retry: false }
  );

  // Keep focus helper
  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    // Initial focus
    focusInput();
  }, []);

  useEffect(() => {
    if (!pendingBarcode || searchQuery.isFetching) return;

    if (searchQuery.data) {
      const data = searchQuery.data;
      setPendingBarcode(null);

      if (!data.product) {
        toast.error("ไม่พบสินค้านี้ในระบบ โปรดเพิ่มสินค้าใหม่ก่อน", { duration: 4000 });
        setBarcode("");
        focusInput();
        return;
      }

      const existing = stockInItems.find((i) => i.product.id === data.product!.id);
      if (existing) {
        // Increment quantity
        setStockInItems((prev) =>
          prev.map((i) =>
            i.product.id === data.product!.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
        toast.success(`อัปเดตจำนวน ${data.product!.name} เป็น ${existing.quantity + 1} ชิ้น`);
      } else {
        // Add new item
        setStockInItems((prev) => [
          ...prev,
          { id: Date.now().toString(), product: data.product!, addDate: new Date(), quantity: 1 },
        ]);
        toast.success(`เพิ่ม ${data.product!.name} ในรายการแล้ว`);
      }

      setBarcode("");
      focusInput();
    }

    if (searchQuery.error) {
      setPendingBarcode(null);
      toast.error(searchQuery.error.message);
      setBarcode("");
      focusInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery.data, searchQuery.error, searchQuery.isFetching]);

  // ── Stock-in mutation ─────────────────────────────────────────────────────────
  const stockInMutation = trpc.products.stockIn.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("บันทึกการรับสต็อกสินค้าเรียบร้อยแล้ว");
      setStockInItems([]);
      focusInput();
    },
    onError: (err) => {
      toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึก");
      focusInput();
    },
  });

  const handleCameraScan = async (scannedBarcode: string) => {
    try {
      // Imperative fetch to avoid triggering React lifecycle spaghetti
      const data = await utils.products.search.fetch({ barcode: scannedBarcode });
      
      if (!data.product) {
        toast.error(`ไม่พบสินค้ารหัส ${scannedBarcode} ในระบบ`, { duration: 3000 });
        return;
      }

      setStockInItems((prev) => {
        const existing = prev.find((i) => i.product.id === data.product!.id);
        if (existing) {
          toast.success(`อัปเดตจำนวน ${data.product!.name} เป็น ${existing.quantity + 1} ชิ้น`);
          return prev.map((i) =>
            i.product.id === data.product!.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          toast.success(`เพิ่ม ${data.product!.name} ในรายการแล้ว`);
          return [
            ...prev,
            { id: Date.now().toString(), product: data.product!, addDate: new Date(), quantity: 1 },
          ];
        }
      });
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการค้นหาบาร์โค้ด");
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || searchQuery.isFetching) return;
    setPendingBarcode(barcode.trim());
  };

  const handleRemoveItem = (id: string) => {
    setStockInItems((prev) => prev.filter((i) => i.id !== id));
    focusInput();
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setStockInItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const handleSubmitStockIn = async () => {
    if (stockInItems.length === 0) return;
    try {
      for (const item of stockInItems) {
        await stockInMutation.mutateAsync({
          id: item.product.id,
          quantity: item.quantity,
          costPrice: item.product.costPrice,
          notes: `Stock In - ${new Date().toLocaleDateString("th-TH")}`,
        });
      }
    } catch {
      // error handled via mutation onError
    }
  };

  const isSearching = searchQuery.isFetching;
  const isSubmitting = stockInMutation.isPending;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg">
        <CardContent className="p-4 md:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">รับสินค้าเข้า (Stock In)</h1>
              <p className="text-sm text-gray-500 mt-1">สแกนบาร์โค้ดเพื่อเพิ่มสินค้าเข้าระบบอย่างรวดเร็ว</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/products")}
              className="bg-white"
            >
              <History className="w-4 h-4 mr-2" />
              ประวัติรับเข้า
            </Button>
            <Button
              onClick={() => router.push("/products?action=new")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              สินค้าใหม่
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <Card className="border-none shadow-lg relative overflow-hidden">
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />

            <CardHeader className="pb-4 border-b border-gray-100/50 bg-gray-50/50">
              <CardTitle className="text-lg">สแกนบาร์โค้ด</CardTitle>
              <CardDescription>ใช้เครื่องยิงบาร์โค้ดหรือพิมพ์เลขเอง</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="h-14 text-lg text-center font-mono bg-gray-50 border-2 border-gray-200 focus-visible:ring-0 focus-visible:border-green-500 transition-colors"
                    disabled={isSearching}
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSearching || !barcode.trim()}
                    className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <>
                      <Search className={"w-5 h-5 mr-2"} />ค้นหา</>}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    variant="outline"
                    className="h-12 w-12 flex-shrink-0 border-2 border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-600 hover:bg-green-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/><path d="M10 12h4"/></svg>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-lg h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-gray-100/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">รายการรอรับเข้า</CardTitle>
                <CardDescription>ตรวจสอบความถูกต้องและระบุจำนวนก่อนยืนยัน</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                {stockInItems.length} รายการ
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              {stockInItems.length > 0 ? (
                <>
                  <div className="flex-1 overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                        <TableRow>
                          <TableHead className="w-[80px] pl-4 md:pl-6">#</TableHead>
                          <TableHead>สินค้า</TableHead>
                          <TableHead className="text-center w-[140px]">จำนวน</TableHead>
                          <TableHead className="text-right w-[80px] pr-4 md:pr-6"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockInItems.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium text-gray-500 pl-4 md:pl-6">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-gray-900">{item.product.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {item.product.sku} {item.product.barcode ? `| ${item.product.barcode}` : ""}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                className="w-24 mx-auto text-center font-bold"
                              />
                            </TableCell>
                            <TableCell className="text-right pr-4 md:pr-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
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

                  <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50">
                    <Button
                      onClick={handleSubmitStockIn}
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />กำลังบันทึก...</>
                      ) : (
                        "ยืนยันการรับสินค้าเข้าสต็อก"
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">ยังไม่มีรายการสินค้า</h3>
                  <p className="text-gray-500 max-w-xs">สแกนบาร์โค้ดทางซ้ายมือเพื่อเริ่มเพิ่มรายการสินค้าที่ต้องการรับเข้า</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Camera Scanner Dialog */}
      <BarcodeScannerDialog
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          focusInput();
        }}
        onScanSuccess={handleCameraScan}
      />
    </div>
  );
}
