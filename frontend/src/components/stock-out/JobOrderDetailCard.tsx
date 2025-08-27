"use client";
import { useState } from "react";
import { Trash2, Car, Phone, User, ShieldCheck } from "lucide-react";

type JobOrderItem = {
  id: number;
  qty: number;
  product?: {
    id: number;
    name: string;
    sku: string
  } | null;
};

type JobOrderDetail = {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail: string;
  jobDetail: string;
  status: string;
  createdAt: string;
  items: JobOrderItem[];
};

type Props = {
  jobOrder: JobOrderDetail;
  onItemDelete: (itemId: number) => Promise<void>;
};

export default function JobOrderDetailCard({ jobOrder, onItemDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<null | { itemId: number; name: string }>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'IN_PROGRESS': return 'กำลังดำเนินการ';
      case 'CANCELLED': return 'ยกเลิก';
      case 'OPEN': return 'เปิดงาน';
      default: return status;
    }
  };

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">รายละเอียดงาน #{jobOrder.jobNumber}</h3>
            <p className="text-sm text-gray-600 mt-1">ข้อมูลงานและประวัติการเบิกสินค้า</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobOrder.status)}`}>
            {getStatusText(jobOrder.status)}
          </span>
        </div>
        
        {/* Job Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <User />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ลูกค้า</p>
                <p className="font-semibold text-gray-900">{jobOrder.customerName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <Phone />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">เบอร์โทร</p>
                <p className="font-semibold text-gray-900">{jobOrder.phoneNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <Car />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ประเภทรถ</p>
                <p className="font-semibold text-gray-900">{jobOrder.carType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <ShieldCheck />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ทะเบียน</p>
                <p className="font-semibold text-gray-900">{jobOrder.licensePlate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        {(jobOrder.issueDetail || jobOrder.jobDetail) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            {jobOrder.issueDetail && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">อาการเสีย:</p>
                <p className="text-gray-900">{jobOrder.issueDetail}</p>
              </div>
            )}
            {jobOrder.jobDetail && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">รายละเอียดงาน:</p>
                <p className="text-gray-900">{jobOrder.jobDetail}</p>
              </div>
            )}
          </div>
        )}

        {/* Creation Date */}
        <div className="text-xs text-gray-500 mb-6">
          สร้างเมื่อ: {new Date(jobOrder.createdAt).toLocaleString('th-TH')}
        </div>

        {/* Consumption History */}
        {jobOrder.items && jobOrder.items.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">ประวัติการเบิกสินค้า</h4>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobOrder.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.product?.sku || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.product?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.qty} ชิ้น
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors group"
                            onClick={() => setConfirmDelete({ itemId: item.id, name: item.product?.name || '-' })}
                            aria-label="ลบรายการนี้"
                          >
                            <Trash2 size={16} className="text-red-600 group-hover:text-red-700" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!jobOrder.items || jobOrder.items.length === 0) && (
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">ยังไม่มีประวัติการเบิกสินค้า</p>
              <p className="text-gray-400 text-xs">สินค้าที่เบิกจะแสดงที่นี่</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg max-w-sm w-full p-4">
            <div className="font-semibold text-gray-900 mb-2">ยืนยันการลบ</div>
            <p className="text-sm text-gray-700 mb-4">
              ต้องการลบ &ldquo;{confirmDelete.name}&rdquo; ออกจากประวัติการเบิกหรือไม่? สต็อกจะถูกคืนกลับอัตโนมัติ
            </p>
            <div className="flex justify-end gap-2">
              <button 
                className="px-3 py-2 border rounded" 
                onClick={() => setConfirmDelete(null)}
              >
                ยกเลิก
              </button>
              <button
                className="px-3 py-2 bg-red-600 text-white rounded"
                onClick={async () => {
                  try {
                    await onItemDelete(confirmDelete.itemId);
                    setConfirmDelete(null);
                  } catch (err) {
                    console.error("Failed to delete item:", err);
                  }
                }}
              >
                ลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
