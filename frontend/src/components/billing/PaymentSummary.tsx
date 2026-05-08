"use client";

import { DollarSign, CreditCard, QrCode, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import PromptPayQR from "./PromptPayQR";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

interface PaymentSummaryProps {
  transactions: StockTransaction[];
  totalAmount: number;
  selectedPaymentMethod: "cash" | "promptpay";
  promptPayAmount: number;
  showQR: boolean;
  laborCost: number;
  onPaymentMethodChange: (method: "cash" | "promptpay") => void;
  onPromptPayAmountChange: (amount: number) => void;
  onLaborCostChange: (cost: number) => void;
  onConfirmPayment: () => void;
}

export default function PaymentSummary({
  transactions,
  totalAmount,
  selectedPaymentMethod,
  promptPayAmount,
  showQR,
  laborCost,
  onPaymentMethodChange,
  onPromptPayAmountChange,
  onLaborCostChange,
  onConfirmPayment,
}: PaymentSummaryProps) {
  const [showLaborModal, setShowLaborModal] = useState(false);

  const subtotal = totalAmount + laborCost;
  const vatAmount = subtotal * 0.07;
  const grandTotal = subtotal + vatAmount;

  useEffect(() => {
    if (selectedPaymentMethod === "promptpay") {
      onPromptPayAmountChange(grandTotal);
    }
  }, [grandTotal, selectedPaymentMethod, onPromptPayAmountChange]);

  const summaryRows = [
    { label: "จำนวนรายการ", value: `${transactions?.length || 0} รายการ` },
    { label: "รวมจำนวนสินค้า", value: `${transactions?.reduce((sum, t) => sum + Math.abs(t.qtyChange || 0), 0) || 0} ชิ้น` },
    { label: "ยอดรวมสินค้า", value: `฿${(totalAmount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}` },
  ];

  return (
    <>
      <Card className="border-none shadow-lg sticky top-20">
        <CardHeader className="pb-4 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <CardTitle className="text-lg">สรุปการชำระเงิน</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Summary Rows */}
          <div className="space-y-0">
            {summaryRows.map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-semibold text-gray-900">{row.value}</span>
              </div>
            ))}

            {/* Labor Cost Row — inline input */}
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm text-muted-foreground">ค่าแรงงาน</span>
              </div>
              <div className="relative w-32">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">฿</span>
                <Input
                  type="number"
                  value={laborCost || ""}
                  onChange={(e) => onLaborCostChange(Number(e.target.value) || 0)}
                  className="h-8 pl-6 pr-2 text-right text-sm font-semibold"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
              <span className="text-sm text-muted-foreground">รวมก่อน VAT</span>
              <span className="text-sm font-semibold text-gray-900">
                ฿{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
              <span className="text-sm text-muted-foreground">VAT 7%</span>
              <span className="text-sm font-semibold text-gray-900">
                ฿{vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center py-4 bg-orange-50/60 rounded-xl px-4 -mx-1">
            <span className="text-base font-bold text-gray-900">ยอดรวมทั้งหมด</span>
            <span className="text-2xl font-bold text-orange-600">
              ฿{grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <Separator />

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">เลือกวิธีการชำระเงิน</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onPaymentMethodChange("cash")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  selectedPaymentMethod === "cash"
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                เงินสด
              </button>
              <button
                onClick={() => onPaymentMethodChange("promptpay")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  selectedPaymentMethod === "promptpay"
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <QrCode className="w-4 h-4" />
                PromptPay
              </button>
            </div>
          </div>

          {/* PromptPay Amount Input */}
          {selectedPaymentMethod === "promptpay" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">จำนวนเงิน (PromptPay)</label>
              <Input
                type="number"
                value={promptPayAmount || grandTotal}
                onChange={(e) => onPromptPayAmountChange(Number(e.target.value))}
                className="h-11"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  ยอดรวมทั้งหมด: ฿{grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-orange-600"
                  onClick={() => onPromptPayAmountChange(grandTotal)}
                >
                  ใช้ยอดรวมทั้งหมด
                </Button>
              </div>
            </div>
          )}

          {/* PromptPay QR Code */}
          {showQR && (
            <div className="rounded-2xl overflow-hidden">
              <PromptPayQR amount={promptPayAmount} />
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={onConfirmPayment}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {selectedPaymentMethod === "cash"
              ? "ยืนยันการชำระเงินสด"
              : "ยืนยันการชำระเงิน PromptPay"}
          </Button>
        </CardContent>
      </Card>

      {/* Labor Cost Dialog */}
      <Dialog open={showLaborModal} onOpenChange={setShowLaborModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              ค่าแรงงาน
            </DialogTitle>
            <DialogDescription>กรอกจำนวนเงินค่าแรงงาน</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">฿</span>
              <Input
                type="number"
                value={laborCost}
                onChange={(e) => onLaborCostChange(Number(e.target.value) || 0)}
                className="pl-8 h-12 text-lg font-semibold"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50/80 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                <span className="font-semibold">฿{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าแรงงาน</span>
                <span className="font-semibold">฿{laborCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">รวมก่อน VAT</span>
                <span className="font-semibold">฿{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT 7%</span>
                <span className="font-semibold">฿{vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span className="text-gray-900">ยอดรวมทั้งหมด</span>
                <span className="text-orange-600">฿{grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLaborModal(false)}>ยกเลิก</Button>
            <Button onClick={() => setShowLaborModal(false)} className="bg-orange-600 hover:bg-orange-700">ยืนยัน</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
