"use client";

import { Receipt, Printer, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BillingHeaderProps {
  onPrint: () => void;
  onDownload: () => void;
}

export default function BillingHeader({ onPrint, onDownload }: BillingHeaderProps) {
  return (
    <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg">
      <CardContent className="p-4 md:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
            <Receipt className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">ใบแจ้งหนี้ (Billing)</h1>
            <p className="text-sm text-gray-500 mt-1">รายละเอียดงานและประวัติการเบิกสินค้า</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrint} className="gap-2">
            <Printer className="w-4 h-4" />
            พิมพ์
          </Button>
          <Button variant="outline" onClick={onDownload} className="gap-2 text-orange-700 border-orange-200 hover:bg-orange-50">
            <Download className="w-4 h-4" />
            ดาวน์โหลด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
