"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { PackageSearch, PlusCircle, Trash2, Search, X, Loader2, PackageMinus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Product = {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  sellPrice: number;
};

type ItemToIssue = {
  productId: number;
  qty: number;
  product: Product;
};

type Props = {
  jobOrderId: number | null;
  onIssueItems: (items: ItemToIssue[]) => Promise<void>;
  loading: boolean;
  onRefreshJobOrder: () => void;
};

export default function ProductSearch({
  jobOrderId,
  onIssueItems,
  loading,
  onRefreshJobOrder,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [itemsToIssue, setItemsToIssue] = useState<ItemToIssue[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  const { data: productsData } = trpc.products.list.useQuery(
    { q: debouncedTerm, page: 1, pageSize: 20 },
    { enabled: debouncedTerm.length > 0 }
  );

  const searchResults: Product[] = (productsData?.items ?? []).filter((p) => {
    const lower = debouncedTerm.toLowerCase();
    return p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower);
  }) as Product[];

  const handleAddProduct = useCallback((product: Product) => {
    setItemsToIssue((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { productId: product.id, qty: 1, product }];
    });
  }, []);

  const handleRemoveProduct = (productId: number) => {
    setItemsToIssue((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleQtyChange = (productId: number, newQty: number) => {
    if (newQty <= 0) { handleRemoveProduct(productId); return; }
    setItemsToIssue((prev) =>
      prev.map((item) => item.productId === productId ? { ...item, qty: newQty } : item)
    );
  };

  const handleIssueItems = async () => {
    if (itemsToIssue.length === 0) return;
    try {
      await onIssueItems(itemsToIssue);
      setItemsToIssue([]);
      setSearchTerm("");
      onRefreshJobOrder();
    } catch {
      // error handled by parent
    }
  };

  if (!jobOrderId) return null;

  return (
    <Card className="border-none shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
      <CardHeader className="pb-4 border-b border-gray-100/50 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <PackageSearch className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg">ค้นหาและเบิกสินค้า</CardTitle>
            <CardDescription>ค้นหาสินค้าและทำการเบิกออกจากคลัง</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="พิมพ์ชื่อสินค้าหรือ SKU..."
            className="h-12 pl-10 pr-10 bg-white border-2 border-gray-200 focus-visible:ring-0 focus-visible:border-green-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">ผลการค้นหา ({searchResults.length})</span>
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="h-7 text-xs text-muted-foreground">
                ปิด
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {searchResults.map((product) => {
                const isAlreadyAdded = itemsToIssue.some((item) => item.productId === product.id);
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors ${isAlreadyAdded ? "bg-green-50/50" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">{product.sku}</Badge>
                        <span className="text-xs text-muted-foreground">คงเหลือ: {product.stockQuantity}</span>
                        <span className="text-xs font-medium text-green-600">฿{product.sellPrice.toLocaleString()}</span>
                        {isAlreadyAdded && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">เพิ่มแล้ว</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isAlreadyAdded ? "ghost" : "outline"}
                      size="icon"
                      onClick={() => handleAddProduct(product)}
                      disabled={isAlreadyAdded}
                      className={`ml-3 h-9 w-9 rounded-full flex-shrink-0 ${!isAlreadyAdded ? "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" : "text-gray-400"}`}
                    >
                      <PlusCircle className="w-5 h-5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty search result */}
        {debouncedTerm && searchResults.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">ไม่พบสินค้าที่ค้นหา</p>
            <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือตรวจสอบ SKU</p>
          </div>
        )}

        {/* Items to Issue */}
        {itemsToIssue.length > 0 && (
          <div className="border border-blue-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-700">สินค้าที่จะเบิก</span>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{itemsToIssue.length} รายการ</Badge>
            </div>
            <div className="p-3 space-y-2">
              {itemsToIssue.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="font-mono text-xs">{item.product.sku}</Badge>
                      <span className="text-xs text-muted-foreground">คงเหลือ: {item.product.stockQuantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Input
                      type="number"
                      min="1"
                      max={item.product.stockQuantity}
                      value={item.qty}
                      onChange={(e) => handleQtyChange(item.productId, parseInt(e.target.value) || 1)}
                      className="w-20 text-center font-bold h-9"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProduct(item.productId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-blue-100 bg-blue-50/30">
              <Button
                onClick={handleIssueItems}
                disabled={loading}
                className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />กำลังประมวลผล...</>
                ) : (
                  <><PackageMinus className="w-5 h-5 mr-2" />เบิกสินค้า ({itemsToIssue.reduce((sum, item) => sum + item.qty, 0)} ชิ้น)</>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
