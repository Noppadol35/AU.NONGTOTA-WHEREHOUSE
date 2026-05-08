"use client";

import { Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface StockTransaction {
  id: number;
  productId: number;
  product: {
    name: string;
    sku: string;
    sellPrice: number;
  };
  qtyChange: number;
  type: "SALE";
  createdAt: string;
}

interface StockTransactionsProps {
  transactions: StockTransaction[];
}

export default function StockTransactions({ transactions }: StockTransactionsProps) {
  const totalItems = transactions?.reduce((sum, t) => sum + Math.abs(t.qtyChange), 0) || 0;
  const totalAmount = transactions?.reduce(
    (sum, t) => sum + (t.product?.sellPrice || 0) * Math.abs(t.qtyChange), 0
  ) || 0;

  return (
    <Card className="border-none shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
      <CardHeader className="pb-4 border-b border-gray-100/50 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">ประวัติการเบิกสินค้า</CardTitle>
              <CardDescription>รายการสินค้าที่ใช้ในงานนี้</CardDescription>
            </div>
          </div>
          {transactions && transactions.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
              {transactions.length} รายการ
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">ยังไม่มีประวัติการเบิกสินค้า</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="pl-6">สินค้า</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">จำนวน</TableHead>
                    <TableHead className="text-right">ราคา/หน่วย</TableHead>
                    <TableHead className="text-right pr-6">รวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-6 font-medium text-gray-900">
                        {transaction.product?.name || "ไม่ระบุ"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{transaction.product?.sku || "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {Math.abs(transaction.qtyChange)} ชิ้น
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ฿{(transaction.product?.sellPrice || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-semibold">
                        ฿{((transaction.product?.sellPrice || 0) * Math.abs(transaction.qtyChange)).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Table Footer Summary */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                รวม {totalItems} ชิ้น จาก {transactions.length} รายการ
              </span>
              <span className="text-base font-bold text-gray-900">
                ฿{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
