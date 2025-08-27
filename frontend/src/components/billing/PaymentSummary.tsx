"use client";

import { DollarSign, CreditCard, QrCode, Wrench, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import PromptPayQR from "./PromptPayQR";

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
  laborCost: number; // Add this
  onPaymentMethodChange: (method: "cash" | "promptpay") => void;
  onPromptPayAmountChange: (amount: number) => void;
  onLaborCostChange: (cost: number) => void; // Add this
  onConfirmPayment: () => void;
}

export default function PaymentSummary({
  transactions,
  totalAmount,
  selectedPaymentMethod,
  promptPayAmount,
  showQR,
  laborCost, // Add this
  onPaymentMethodChange,
  onPromptPayAmountChange,
  onLaborCostChange, // Add this
  onConfirmPayment,
}: PaymentSummaryProps) {
  const [showLaborModal, setShowLaborModal] = useState(false);

  // คำนวณ VAT และยอดรวมทั้งหมด
  const subtotal = totalAmount + laborCost;
  const vatAmount = subtotal * 0.07;
  const grandTotal = subtotal + vatAmount;

  // อัพเดท PromptPay amount เมื่อ grandTotal เปลี่ยน
  useEffect(() => {
    if (selectedPaymentMethod === "promptpay") {
      onPromptPayAmountChange(grandTotal);
    }
  }, [grandTotal, selectedPaymentMethod, onPromptPayAmountChange]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          สรุปการชำระเงิน
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600">จำนวนรายการ</span>
          <span className="font-medium text-gray-900">
            {transactions?.length || 0} รายการ
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600">รวมจำนวนสินค้า</span>
          <span className="font-medium text-gray-900">
            {transactions?.reduce(
              (sum, t) => sum + Math.abs(t.qtyChange || 0),
              0
            ) || 0}{" "}
            ชิ้น
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600">ยอดรวมสินค้า</span>
          <span className="font-medium text-gray-900">
            ฿{(totalAmount || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">ค่าแรงงาน</span>
            <button
              onClick={() => setShowLaborModal(true)}
              className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
              title="แก้ไขค่าแรงงาน"
            >
              <Wrench className="w-4 h-4" />
            </button>
          </div>
          <span className="font-medium text-gray-900">
            ฿{laborCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600">รวมก่อน VAT</span>
          <span className="font-medium text-gray-900">
            ฿{subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600">VAT 7%</span>
          <span className="font-medium text-gray-900">
            ฿{vatAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-4">
          <span className="text-lg font-semibold text-gray-900">
            ยอดรวมทั้งหมด
          </span>
          <span className="text-2xl font-bold text-orange-600">
            ฿{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          เลือกวิธีการชำระเงิน
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={selectedPaymentMethod === "cash"}
              onChange={() => onPaymentMethodChange("cash")}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">เงินสด</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="promptpay"
              checked={selectedPaymentMethod === "promptpay"}
              onChange={() => onPaymentMethodChange("promptpay")}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">PromptPay QR</span>
            </div>
          </label>
        </div>

        {/* PromptPay Amount Input */}
        {selectedPaymentMethod === "promptpay" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              จำนวนเงิน (PromptPay)
            </label>
            <input
              type="number"
              value={promptPayAmount || grandTotal}
              onChange={(e) =>
                onPromptPayAmountChange(Number(e.target.value))
              }
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ยอดรวมทั้งหมด: ฿{grandTotal.toFixed(2)}</span>
              <button
                onClick={() => onPromptPayAmountChange(grandTotal)}
                className="text-orange-600 hover:text-orange-700 hover:underline"
                type="button"
              >
                ใช้ยอดรวมทั้งหมด
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PromptPay QR Code */}
      {showQR && (
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PromptPay QR Code</h3>
            <p className="text-sm text-gray-600">สแกนเพื่อชำระเงิน</p>
          </div>
          <PromptPayQR amount={promptPayAmount} />
        </div>
      )}

      {/* Payment Button */}
      <button 
        onClick={onConfirmPayment} 
        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
      >
        {selectedPaymentMethod === "cash"
          ? "ยืนยันการชำระเงินสด"
          : "ยืนยันการชำระเงิน PromptPay"}
      </button>

      {/* Labor Cost Modal */}
      {showLaborModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl w-full max-w-md mx-4 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">ค่าแรงงาน</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนเงินค่าแรงงาน
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">฿</span>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => onLaborCostChange(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Summary Preview */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 space-y-2 border border-white/30">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ยอดรวมสินค้า:</span>
                  <span className="font-medium text-gray-900">฿{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ค่าแรงงาน:</span>
                  <span className="font-medium text-gray-900">฿{laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200/50 pt-2">
                  <span className="text-gray-600">รวมก่อน VAT:</span>
                  <span className="font-medium text-gray-900">฿{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT 7%:</span>
                  <span className="font-medium text-gray-900">฿{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200/50 pt-2">
                  <span className="text-gray-900">ยอดรวมทั้งหมด:</span>
                  <span className="text-orange-600">฿{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLaborModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100/80 backdrop-blur-sm rounded-xl hover:bg-gray-200/90 transition-all duration-200 font-medium border border-gray-200/50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => setShowLaborModal(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
