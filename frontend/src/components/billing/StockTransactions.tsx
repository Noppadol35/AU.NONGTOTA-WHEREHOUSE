"use client";

import { Package } from "lucide-react";

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
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          ประวัติการเบิกสินค้า
        </h2>
      </div>

      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>ยังไม่มีประวัติการเบิกสินค้า</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  สินค้า
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  SKU
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  จำนวน
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  ราคาต่อหน่วย
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  รวม
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {transaction.product?.name || "ไม่ระบุ"}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.product?.sku || "ไม่ระบุ"}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {Math.abs(transaction.qtyChange)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    ฿
                    {(transaction.product?.sellPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    ฿
                    {(
                      (transaction.product?.sellPrice || 0) *
                      Math.abs(transaction.qtyChange)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
