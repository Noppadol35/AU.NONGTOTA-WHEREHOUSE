"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CheckCircle2 } from "lucide-react";

type IssuedItem = {
  productId: number;
  qtyIssued: number;
  remainingStock: number;
  product?: {
    sku: string;
    name: string;
  } | null;
};

type Props = {
  jobNumber: string;
  items: IssuedItem[];
};

export default function IssueSummary({ jobNumber, items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <Card className="border-none shadow-lg border-green-200 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
      <CardHeader className="pb-3 bg-green-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base">รายการเบิกล่าสุด</CardTitle>
            <p className="text-sm text-muted-foreground">Job #{jobNumber}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="pl-4">SKU</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead className="text-center">เบิก</TableHead>
              <TableHead className="text-center pr-4">คงเหลือ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell className="font-mono text-sm pl-4">{item.product?.sku || "-"}</TableCell>
                <TableCell className="text-sm">{item.product?.name || "-"}</TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{item.qtyIssued} ชิ้น</Badge>
                </TableCell>
                <TableCell className="text-center pr-4">
                  <span className="text-sm font-medium text-muted-foreground">{item.remainingStock}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
