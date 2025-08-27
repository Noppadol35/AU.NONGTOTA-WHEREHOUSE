"use client";
import { useEffect, useState } from "react";
import { Clipboard } from "lucide-react";


type JobOrder = {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  status: string;
};

type Props = {
  selectedJobId: number | null;
  onJobSelect: (jobId: number | null) => void;
};

export default function JobOrderSelector({ selectedJobId, onJobSelect }: Props) {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobOrders();
    fetchCustomers();
  }, []);

  async function fetchJobOrders() {
    setLoading(true);
    try {
      console.log("Fetching job orders...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-orders`, {
        credentials: "include",
      });
      
      console.log("Job orders response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Job orders API error:", errorData);
        throw new Error("Failed to fetch job orders");
      }
      
      const data = await res.json();
      console.log("Fetched job orders:", data);
      
      // Validate that data is an array
      if (Array.isArray(data)) {
        setJobOrders(data);
      } else {
        console.error("Invalid job orders data format:", data);
        setJobOrders([]);
        setError("ข้อมูลรายการงานไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Failed to fetch job orders:", err);
      setJobOrders([]);
      setError("ไม่สามารถโหลดรายการงานได้");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      console.log("Fetching customers...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-orders/consumers`, {
        credentials: "include",
      });
      
      console.log("Customers response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Customers API error:", errorData);
        throw new Error("Failed to fetch customers");
      }
      
      const data = await res.json();
      console.log("Fetched customers:", data);
      
      // Validate that data.consumers is an array
      if (Array.isArray(data.consumers)) {
        setCustomers(data.consumers);
      } else {
        console.error("Invalid customers data format:", data);
        setCustomers([]);
        setError("ข้อมูลลูกค้าไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
      setError("ไม่สามารถโหลดรายชื่อลูกค้าได้");
    }
  }

  const filteredJobOrders = jobOrders.filter(
    (job) => !selectedCustomer || job.customerName === selectedCustomer
  );

  // Debug logging
  console.log("JobOrderSelector Debug:", {
    jobOrders: jobOrders.length,
    customers: customers.length,
    selectedCustomer,
    filteredJobOrders: filteredJobOrders.length,
    availableJobs: filteredJobOrders.filter(job => job.status === "OPEN" || job.status === "IN_PROGRESS").length
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <Clipboard />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">เลือกงานที่ต้องการเบิกสินค้า</h2>
          <p className="text-sm text-gray-600 mt-1">กรุณาเลือกงานที่ต้องการเบิกสินค้าจากคลัง</p>
        </div>
      </div>
      
      {/* Customer Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          กรองตามลูกค้า
        </label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
        >
          <option value="">ทุกลูกค้า</option>
          {Array.isArray(customers) && customers.map((customer, index) => (
            <option key={`customer-${index}-${customer}`} value={customer}>
              {customer}
            </option>
          ))}
        </select>
      </div>

      {/* Job Order Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เลือกงาน
        </label>
        <select
          value={selectedJobId || ""}
          onChange={(e) => onJobSelect(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
          disabled={loading}
        >
          <option value="">-- เลือกงาน --</option>
          {Array.isArray(filteredJobOrders) && filteredJobOrders
            .filter((job) => job.status === "OPEN" || job.status === "IN_PROGRESS")
            .map((job) => (
              <option key={job.id} value={job.id}>
                Job #{job.jobNumber} - {job.customerName} ({job.carType})
              </option>
            ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            กำลังโหลดข้อมูล...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && Array.isArray(filteredJobOrders) && filteredJobOrders.length === 0 && (
        <div className="mt-6 text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">ไม่พบงานที่สามารถเบิกสินค้าได้</p>
          <p className="text-gray-400 text-xs">ตรวจสอบสถานะงานหรือตัวกรองลูกค้า</p>
        </div>
      )}

      {/* Job Orders Count */}
      {Array.isArray(filteredJobOrders) && filteredJobOrders.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          พบงานทั้งหมด {filteredJobOrders.filter(job => job.status === "OPEN" || job.status === "IN_PROGRESS").length} รายการ
        </div>
      )}
    </div>
  );
}
