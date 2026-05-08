"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Calendar,
  Star,
  Clock,
  Car,
  X,
  FileText,
  Wrench,
  Package,
} from "lucide-react";
import {
  CustomerHistory,
  CustomerSummary,
  JobDetail,
} from "@/types/reports";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export default function CustomerHistoryReport() {
  const [filter, setFilter] = useState<"all" | "active" | "vip">("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // tRPC queries
  const { data: historyData, isLoading: loading, error, refetch } = trpc.reports.customerHistory.useQuery({ filter });
  const customers = historyData?.customers || [];
  const summary = historyData?.summary || null;

  const { data: jobsData, isLoading: jobsLoading } = trpc.reports.customerJobs.useQuery(
    { customerId: selectedCustomer?.id || 0 },
    { enabled: !!selectedCustomer && selectedCustomer.totalJobs > 0 }
  );
  
  // Use real data or fallback to empty array
  const jobDetails = jobsData || [];

  const handleFilterChange = (value: string) => {
    setFilter(value as "all" | "active" | "vip");
  };

  const handleCustomerClick = (customer: CustomerHistory) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vip":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            VIP
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getCustomerType = (totalSpent: number, totalJobs: number) => {
    if (totalSpent >= 100000 || totalJobs >= 20) return "VIP";
    if (totalSpent >= 50000 || totalJobs >= 10) return "Regular";
    if (totalSpent >= 10000 || totalJobs >= 5) return "Occasional";
    return "New";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>เกิดข้อผิดพลาด: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between ">
        <div>
          <h3 className="text-lg font-semibold text-black">ประวัติลูกค้า</h3>
          <p className="text-sm text-gray-600">
            ข้อมูลลูกค้าและการใช้งานบริการ
          </p>
        </div>
        <Select value={filter} onValueChange={(val: any) => handleFilterChange(val)}>
          <SelectTrigger className="w-[150px] bg-white text-black">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">ลูกค้าทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.totalCustomers?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-500">รายชื่อ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้า Active</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary?.activeCustomers?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-500">รายชื่อ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้า VIP</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary?.vipCustomers?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-500">รายชื่อ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ฿{summary?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-500">รวมรายได้</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>รายชื่อลูกค้า</span>
          </CardTitle>
          <CardDescription>
            คลิกที่รายชื่อลูกค้าเพื่อดูรายละเอียดการทำงาน
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">ลูกค้า</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">รถยนต์</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">ติดต่อ</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">งาน</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">ยอดใช้จ่าย</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">บริการที่ใช้</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {customer.customerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getCustomerType(
                            customer.totalSpent,
                            customer.totalJobs
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.carType}</div>
                        <div className="text-sm text-gray-600 font-mono">
                          {customer.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {customer.totalJobs}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-lg text-green-600">
                        ฿{customer.totalSpent.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.favoriteServices
                          .slice(0, 2)
                          .map((service, index) => (
                            <span
                              key={`${customer.id}-service-${index}`}
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                service === "ยังไม่เคยใช้บริการ"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {service}
                            </span>
                          ))}
                        {customer.favoriteServices.length > 2 && (
                          <span
                            key={`${customer.id}-service-more`}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            +{customer.favoriteServices.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(customer.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedCustomer.customerName}
                </h2>
                <p className="text-gray-600 mt-2 text-lg">
                  ประวัติการใช้งานบริการและรายละเอียดงาน
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-3 hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-8 border-b bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">รถยนต์</p>
                    <p className="font-medium">{selectedCustomer.carType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">ทะเบียน</p>
                    <p className="font-medium">
                      {selectedCustomer.licensePlate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">สถานะ</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedCustomer.totalJobs}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">งานทั้งหมด</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ฿{selectedCustomer.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">ใช้จ่ายรวม</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ฿
                    {selectedCustomer.totalJobs > 0
                      ? Math.round(
                          selectedCustomer.totalSpent /
                            selectedCustomer.totalJobs
                        ).toLocaleString()
                      : "0"}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">เฉลี่ยต่องาน</div>
                </div>
              </div>
            </div>

            {/* Job History */}
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-gray-800">
                <Wrench className="w-6 h-6 text-indigo-600" />
                <span>ประวัติการทำงาน</span>
              </h3>

              {selectedCustomer.totalJobs === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wrench className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  <p className="text-xl font-medium text-gray-600">ยังไม่เคยใช้บริการ</p>
                  <p className="text-gray-500 mt-2">ลูกค้าคนนี้ยังไม่เคยใช้บริการในระบบ</p>
                </div>
              ) : jobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {jobDetails.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {job.jobNumber}
                          </span>
                          <span className="text-sm text-gray-500">
                            {job.date}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status === "COMPLETED"
                            ? "เสร็จสิ้น"
                            : job.status === "IN_PROGRESS"
                            ? "กำลังดำเนินการ"
                            : job.status === "CANCELLED"
                            ? "ยกเลิก"
                            : job.status === "OPEN"
                            ? "รอดำเนินการ"
                            : job.status}
                        </span>
                        <span className="font-bold text-green-600">
                          ฿{job.grandTotal?.toLocaleString()}
                        </span>
                      </div>
                      </div>

                      <h4 className="font-medium mb-2">{job.serviceType}</h4>

                      {/* Financial Summary */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-3 border-l-4 border-blue-400">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">สินค้า:</span>
                            <span className="font-medium ml-2">฿{job.subtotal?.toLocaleString() || '0'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ค่าแรง:</span>
                            <span className="font-medium ml-2">฿{job.laborCost?.toLocaleString() || '0'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ภาษี:</span>
                            <span className="font-medium ml-2">฿{job.vatAmount?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="font-bold text-blue-700">
                            <span className="text-gray-600">รวม:</span>
                            <span className="ml-2">฿{job.grandTotal?.toLocaleString() || job.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        {!job.subtotal && !job.laborCost && !job.vatAmount && (
                          <div className="text-xs text-gray-500 mt-2 text-center">
                            ข้อมูลการเงินยังไม่ถูกบันทึก
                          </div>
                        )}
                      </div>

                      {job.notes && (
                        <p className="text-sm text-gray-600 mb-3">
                          {job.notes}
                        </p>
                      )}

                      {/* Job Items */}
                      <div className="bg-gray-50 rounded p-3">
                        <h5 className="text-sm font-medium mb-2 flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>รายการสินค้า</span>
                        </h5>
                        <div className="space-y-2">
                          {job.items.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{item.productName}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-gray-500">
                                  {item.qty} x ฿
                                  {item.unitPrice.toLocaleString()}
                                </span>
                                <span className="font-medium">
                                  ฿{item.totalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
