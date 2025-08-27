"use client";

import { AlertTriangle, Package, Eye } from "lucide-react";
import Link from "next/link";

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
  // Ensure products is an array and has the expected structure
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Debug logging
  console.log('LowStockAlert received products:', products);
  console.log('Safe products after validation:', safeProducts);
  
  if (safeProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">สินค้าใกล้หมด</h3>
          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
        </div>
        <div className="text-center py-6 md:py-8 text-gray-500">
          <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm md:text-base">ไม่มีสินค้าใกล้หมด</p>
        </div>
      </div>
    );
  }

  // Filter products safely with additional checks
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">สินค้าใกล้หมด</h3>
        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
      </div>
      
      {/* Critical Stock */}
      {criticalProducts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            สินค้าใกล้หมด ({criticalProducts.length} รายการ)
          </h4>
          <div className="space-y-2">
            {criticalProducts.slice(0, 3).map((product, index) => (
              <div key={`critical-${product.id}-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{product.stockQuantity}</p>
                  <p className="text-xs text-gray-500">จาก {product.minStockLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Stock */}
      {warningProducts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-orange-600 mb-3 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            เตือน ({warningProducts.length} รายการ)
          </h4>
          <div className="space-y-2">
            {warningProducts.slice(0, 3).map((product, index) => (
              <div key={`warning-${product.id}-${index}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">{product.stockQuantity}</p>
                  <p className="text-xs text-gray-500">จาก {product.minStockLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link 
          href="/products" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    </div>
  );
}
