"use client";
import { useState } from "react";
import { Plus, TrendingUp, Truck, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickAddProduct() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        router.push("/products");
        break;
      case "stock-in":
        router.push("/stock-in");
        break;
      case "stock-out":
        router.push("/stock-out");
        break;
      case "job-order":
        router.push("/job-orders");
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">การดำเนินการด่วน</h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* เพิ่มสินค้าใหม่ */}
        <button 
          onClick={() => handleQuickAction('add-product')}
          className="group p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
        >
          <div className="text-center">
            <div className="p-2 md:p-3 bg-blue-100 rounded-xl mx-auto mb-2 md:mb-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Plus className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-blue-700">เพิ่มสินค้าใหม่</p>
          </div>
        </button>
        
        {/* รับสินค้าเข้า */}
        <button 
          onClick={() => handleQuickAction('stock-in')}
          className="group p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200"
        >
          <div className="text-center">
            <div className="p-2 md:p-3 bg-green-100 rounded-xl mx-auto mb-2 md:mb-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-green-700">รับสินค้าเข้า</p>
          </div>
        </button>
        
        {/* เบิกสินค้าออก */}
        <button 
          onClick={() => handleQuickAction('stock-out')}
          className="group p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
        >
          <div className="text-center">
            <div className="p-2 md:p-3 bg-orange-100 rounded-xl mx-auto mb-2 md:mb-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Truck className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-orange-700">เบิกสินค้าออก</p>
          </div>
        </button>
        
        {/* สร้างงานใหม่ */}
        <button 
          onClick={() => handleQuickAction('job-order')}
          className="group p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
        >
          <div className="text-center">
            <div className="p-2 md:p-3 bg-purple-100 rounded-xl mx-auto mb-2 md:mb-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-purple-700">สร้างงานใหม่</p>
          </div>
        </button>
      </div>
    </div>
  );
}


