"use client";

import { AlertTriangle, Package, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LowStockProduct {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  minStockLevel: number;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  
  if (safeProducts.length === 0) {
    return (
      <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100/50">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">สินค้าใกล้หมด</CardTitle>
          <div className="p-2 bg-orange-50 rounded-full">
            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-base font-medium text-gray-700">สต็อกสินค้าอยู่ในเกณฑ์ปกติ</p>
          <p className="text-sm mt-1">ไม่มีสินค้าใกล้หมดในขณะนี้</p>
        </CardContent>
      </Card>
    );
  }

  const criticalProducts = safeProducts.filter(p => 
    p && typeof p === 'object' && 
    typeof p.stockQuantity === 'number' && 
    typeof p.minStockLevel === 'number' &&
    p.stockQuantity <= p.minStockLevel
  );
  
  const warningProducts = safeProducts.filter(p => 
    p && typeof p === 'object' && 
    typeof p.stockQuantity === 'number' && 
    typeof p.minStockLevel === 'number' &&
    p.stockQuantity > p.minStockLevel && 
    p.stockQuantity <= p.minStockLevel * 2
  );

  return (
    <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100/50">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">สินค้าใกล้หมด</CardTitle>
        <div className="p-2 bg-red-50 rounded-full animate-pulse">
          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1">
        <ScrollArea className="h-[300px] pr-4 -mr-4">
          <div className="space-y-6">
            {/* Critical Stock */}
            {criticalProducts.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2 px-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                  </span>
                  วิกฤต ({criticalProducts.length} รายการ)
                </h4>
                <div className="space-y-3">
                  {criticalProducts.map((product, index) => (
                    <div key={`critical-${product.id}-${index}`} className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-red-50 group-hover:scale-110 transition-transform duration-300">
                          <Package className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Badge variant="destructive" className="mb-1 text-[11px] font-bold px-2 py-0.5 shadow-sm shadow-red-200">เหลือ {product.stockQuantity}</Badge>
                        <p className="text-[10px] font-medium text-gray-400">Min: {product.minStockLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Stock */}
            {warningProducts.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                <h4 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2 px-1">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                  เฝ้าระวัง ({warningProducts.length} รายการ)
                </h4>
                <div className="space-y-3">
                  {warningProducts.map((product, index) => (
                    <div key={`warning-${product.id}-${index}`} className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-50/50 to-white rounded-2xl border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-orange-50 group-hover:scale-110 transition-transform duration-300">
                          <Package className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{product.name}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Badge variant="outline" className="mb-1 text-[11px] font-bold px-2 py-0.5 text-orange-700 border-orange-200 bg-orange-100 shadow-sm shadow-orange-100/50">เหลือ {product.stockQuantity}</Badge>
                        <p className="text-[10px] font-medium text-gray-400">Min: {product.minStockLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2 pb-6 px-6">
        <Link 
          href="/products" 
          className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors h-11 font-medium")}
        >
          <Eye className="h-4 w-4 mr-2" />
          จัดการสต็อกสินค้า
        </Link>
      </CardFooter>
    </Card>
  );
}
