"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, Snackbar } from "@mui/material";

interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  categoryId: number | null;
  costPrice: number;
  sellPrice: number;
  minStockLevel: number;
  branchId: number;
  stockQuantity: number;
}

interface StockInItem {
  id: string;
  product: Product;
  addDate: Date;
  quantity: number;
}

export default function StockInPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [stockInItems, setStockInItems] = useState<StockInItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "info" | "warning" | "error">("info");

  // Handle barcode input and search
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Search product by barcode
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/search?barcode=${encodeURIComponent(barcode.trim())}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to search product");
      }

      const data = await res.json();
      
      if (!data.product) {
        // Product not found - show alert
        setAlertMessage("ไม่พบสินค้านี้ในระบบ โปรดเพิ่มสินค้าใหม่ก่อน");
        setAlertSeverity("warning");
        setShowAlert(true);
        setBarcode("");
        return;
      }

      // Check if product already exists in stock in list
      const existingItem = stockInItems.find(item => item.product.id === data.product.id);
      if (existingItem) {
        setAlertMessage("สินค้านี้มีอยู่ในรายการแล้ว");
        setAlertSeverity("info");
        setShowAlert(true);
        setBarcode("");
        return;
      }

      // Add product to stock in list
      const newItem: StockInItem = {
        id: Date.now().toString(),
        product: data.product,
        addDate: new Date(),
        quantity: 1,
      };

      setStockInItems(prev => [...prev, newItem]);
      setBarcode("");
      setError(null);

    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการค้นหาสินค้า");
    } finally {
      setLoading(false);
    }
  };

  // Remove item from stock in list
  const handleRemoveItem = (id: string) => {
    setStockInItems(prev => prev.filter(item => item.id !== id));
  };

  // Update quantity
  const handleQuantityChange = (id: string, quantity: number) => {
    setStockInItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Submit stock in
  const handleSubmitStockIn = async () => {
    if (stockInItems.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Process each stock in item
      for (const item of stockInItems) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${item.product.id}/stock-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            quantity: item.quantity,
            costPrice: item.product.costPrice,
            notes: `Stock In - ${new Date().toLocaleDateString('th-TH')}`,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to update stock for ${item.product.name}`);
        }
      }

      // Clear the list after successful submission
      setStockInItems([]);
      setError(null);
      
      // Show success message
      setAlertMessage("เพิ่มสต็อกสินค้าเรียบร้อยแล้ว");
      setAlertSeverity("success");
      setShowAlert(true);

    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการเพิ่มสต็อก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">เพิ่มสต็อกสินค้า</h1>
                <p className="text-gray-600">สแกนหรือกรอก Barcode เพื่อเพิ่มสินค้าเข้าระบบ</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/products")}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              จัดการสินค้า
            </button>
          </div>
        </div>

        {/* Barcode Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleBarcodeSubmit} className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Barcode Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="สแกนหรือกรอก Barcode..."
                className="flex-1 px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !barcode.trim()}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              กด Enter หรือคลิกปุ่มค้นหาเพื่อค้นหาสินค้า
            </p>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          </div>
        )}

        {/* Stock In Table */}
        {stockInItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                รายการสินค้าที่จะเพิ่มสต็อก ({stockInItems.length} รายการ)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อสินค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่เพิ่ม
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockInItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.product.barcode || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          {item.product.description && (
                            <div className="text-gray-500 text-xs truncate max-w-xs">
                              {item.product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.addDate.toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleSubmitStockIn}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? "กำลังเพิ่มสต็อก..." : "เพิ่มสต็อกสินค้า"}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stockInItems.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรายการสินค้า</h3>
            <p className="text-gray-500">กรอก Barcode เพื่อเริ่มเพิ่มสินค้าเข้าระบบ</p>
          </div>
        )}
      </div>

      {/* Material-UI Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}


