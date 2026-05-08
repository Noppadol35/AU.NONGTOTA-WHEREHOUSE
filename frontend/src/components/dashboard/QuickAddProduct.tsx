"use client";
import { Plus, TrendingUp, Truck, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg relative overflow-hidden h-full">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100/50 relative z-10">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">การดำเนินการด่วน</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* เพิ่มสินค้าใหม่ */}
          <button 
            onClick={() => handleQuickAction('add-product')}
            className="group p-4 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 shadow-sm border border-blue-100/50 relative z-10">
              <Plus className="h-6 w-6 text-blue-600" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-gray-600 group-hover:text-blue-700 relative z-10">เพิ่มสินค้า</p>
          </button>
          
          {/* รับสินค้าเข้า */}
          <button 
            onClick={() => handleQuickAction('stock-in')}
            className="group p-4 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300 shadow-sm border border-green-100/50 relative z-10">
              <TrendingUp className="h-6 w-6 text-green-600" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-gray-600 group-hover:text-green-700 relative z-10">รับเข้า</p>
          </button>
          
          {/* เบิกสินค้าออก */}
          <button 
            onClick={() => handleQuickAction('stock-out')}
            className="group p-4 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-3 bg-orange-50 rounded-xl group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300 shadow-sm border border-orange-100/50 relative z-10">
              <Truck className="h-6 w-6 text-orange-600" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-gray-600 group-hover:text-orange-700 relative z-10">เบิกออก</p>
          </button>
          
          {/* สร้างงานใหม่ */}
          <button 
            onClick={() => handleQuickAction('job-order')}
            className="group p-4 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-3 bg-purple-50 rounded-xl group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300 shadow-sm border border-purple-100/50 relative z-10">
              <FileText className="h-6 w-6 text-purple-600" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-gray-600 group-hover:text-purple-700 relative z-10">สร้างงาน</p>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
