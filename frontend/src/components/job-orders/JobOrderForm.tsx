"use client";
import { useState, useEffect } from "react";
import { 
  FileText, 
  User, 
  Phone, 
  Car, 
  Hash, 
  AlertCircle, 
  Wrench, 
  Building,
  Save,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";


export type JobOrderInput = {
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail?: string;
  jobDetail?: string;
  branchId: number;
};

type Props = {
  mode: "create" | "edit";
  onSubmit: (data: JobOrderInput) => Promise<void> | void;
  onCancel: () => void;
  initial?: Partial<JobOrderInput> & { id?: number };
  submitLabel?: string;
  onSuccess?: (data: JobOrderInput) => void; // Add callback for successful updates
};

export default function JobOrderForm({ mode, onSubmit, onCancel, initial, submitLabel, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingJobNumber, setGeneratingJobNumber] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<JobOrderInput | null>(null);

  const [form, setForm] = useState<JobOrderInput>({
    jobNumber: initial?.jobNumber || "",
    customerName: initial?.customerName || "",
    phoneNumber: initial?.phoneNumber || "",
    carType: initial?.carType || "",
    licensePlate: initial?.licensePlate || "",
    issueDetail: initial?.issueDetail || "",
    jobDetail: initial?.jobDetail || "",
    branchId: initial?.branchId || 1,
  });

  // Generate job number when license plate changes (only in create mode)
  useEffect(() => {
    if (mode === "create" && form.licensePlate.trim()) {
      generateJobNumber(form.licensePlate.trim());
    }
  }, [form.licensePlate, mode]);

  const generateJobNumber = async (licensePlate: string) => {
    if (!licensePlate || mode === "edit") return;
    
    setGeneratingJobNumber(true);
    try {
      // Clean license plate (remove spaces and special characters)
      const cleanLicensePlate = licensePlate.replace(/[^a-zA-Z0-9ก-๙]/g, '');
      
      // Fetch the next sequence number for this license plate
      const API_URL = 'http://localhost:5001';
      const response = await fetch(`${API_URL}/job-orders/next-sequence?licensePlate=${encodeURIComponent(cleanLicensePlate)}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        const jobNumber = `JOB-${cleanLicensePlate}-${String(data.nextSequence).padStart(3, '0')}`;
        setForm(prev => ({ ...prev, jobNumber }));
      } else {
        // Fallback: generate with timestamp if API fails
        const timestamp = Date.now().toString().slice(-4);
        const jobNumber = `JOB-${cleanLicensePlate}-${timestamp}`;
        setForm(prev => ({ ...prev, jobNumber }));
      }
    } catch (error) {
      console.error("Error generating job number:", error);
      // Fallback: generate with timestamp
      const cleanLicensePlate = licensePlate.replace(/[^a-zA-Z0-9ก-๙]/g, '');
      const timestamp = Date.now().toString().slice(-4);
      const jobNumber = `JOB-${cleanLicensePlate}-${timestamp}`;
      setForm(prev => ({ ...prev, jobNumber }));
    } finally {
      setGeneratingJobNumber(false);
    }
  };

  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, licensePlate: value });
  };

  const handleRegenerateJobNumber = () => {
    if (form.licensePlate.trim()) {
      generateJobNumber(form.licensePlate.trim());
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted:", { mode, form });
    
    if (mode === "edit") {
      // Show confirmation modal for edit mode
      setPendingFormData(form);
      setShowConfirmModal(true);
      return;
    }
    
    // For create mode, submit directly
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      console.log("Form submission successful");
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  const confirmSubmit = async () => {
    if (!pendingFormData) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 JobOrderForm: Submitting data to backend:", pendingFormData);
      console.log("🔍 JobOrderForm: Data type:", typeof pendingFormData);
      console.log("🔍 JobOrderForm: Data keys:", Object.keys(pendingFormData));
      
      // Send data directly to backend for edit mode
      if (mode === "edit") {
        console.log("🔍 JobOrderForm: Sending PUT request to backend...");
        
        const API_URL = 'http://localhost:5001';
        const response = await fetch(`${API_URL}/job-orders/${initial?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(pendingFormData),
        });
        
        console.log("🔍 JobOrderForm: Backend response status:", response.status);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Update failed");
        }
        
        const result = await response.json();
        console.log("🔍 JobOrderForm: Backend update successful:", result);
        
        // Call onSuccess callback with updated data from backend
        if (onSuccess) {
          console.log("🔍 JobOrderForm: Calling onSuccess with backend data:", result.item);
          onSuccess(result.item);
        }
      } else {
        // For create mode, use the original onSubmit
        await onSubmit(pendingFormData);
        console.log("🔍 JobOrderForm: Form submission successful");
      }
      
      // Close modal and form
      setShowConfirmModal(false);
      setPendingFormData(null);
      onCancel();
      
    } catch (err: any) {
      console.error("🔍 JobOrderForm: Form submission error:", err);
      setError(err?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 px-4 md:py-6 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
          <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
            {mode === "create" ? "สร้างงานสั่งทำใหม่" : "แก้ไขงานสั่งทำ"}
          </h2>
          <p className="text-gray-600 text-sm md:text-lg">
            {mode === "create" 
              ? "กรอกข้อมูลงานสั่งทำใหม่" 
              : "อัปเดตข้อมูลงานสั่งทำ"
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-red-600" />
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* License Plate - Move to first position */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                เลขทะเบียนรถ *
              </div>
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              value={form.licensePlate}
              onChange={handleLicensePlateChange}
              placeholder="กข-1234"
              required
            />
            {mode === "create" && (
              <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                เลขที่งานจะถูกสร้างอัตโนมัติเมื่อกรอกเลขทะเบียนรถ
              </p>
            )}
          </div>

          {/* Job Number - Auto-generated, read-only in create mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                เลขที่งาน *
                {mode === "create" && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    สร้างอัตโนมัติ
                  </span>
                )}
              </div>
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  mode === "create" ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
                value={form.jobNumber}
                onChange={(e) => mode === "edit" && setForm({ ...form, jobNumber: e.target.value })}
                placeholder={mode === "create" ? "กรอกเลขทะเบียนรถก่อน..." : "JOB-001"}
                readOnly={mode === "create"}
                required
              />
              {mode === "create" && form.licensePlate && (
                <button
                  type="button"
                  onClick={handleRegenerateJobNumber}
                  disabled={generatingJobNumber}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="สร้างเลขที่งานใหม่"
                >
                  <RefreshCw className={`w-4 h-4 ${generatingJobNumber ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>
            {generatingJobNumber && (
              <p className="text-xs text-blue-600 animate-pulse">
                กำลังสร้างเลขที่งาน...
              </p>
            )}
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                ชื่อลูกค้า *
              </div>
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="ชื่อลูกค้า"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                เบอร์โทรศัพท์ *
              </div>
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="080-123-4567"
              required
            />
          </div>

          {/* Car Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-500" />
                ประเภทรถ *
              </div>
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={form.carType}
              onChange={(e) => setForm({ ...form, carType: e.target.value })}
              placeholder="Toyota Camry"
              required
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                สาขา *
              </div>
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: Number(e.target.value) })}
              required
            >
              <option value={1}>Main Branch</option>
            </select>
          </div>
        </div>

        {/* Full Width Fields */}
        <div className="space-y-6">
          {/* Issue Detail */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                รายละเอียดปัญหา
              </div>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              rows={3}
              value={form.issueDetail ?? ""}
              onChange={(e) => setForm({ ...form, issueDetail: e.target.value })}
              placeholder="อธิบายปัญหาที่พบ..."
            />
          </div>

          {/* Job Detail */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-500" />
                รายละเอียดงาน
              </div>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              rows={3}
              value={form.jobDetail ?? ""}
              onChange={(e) => setForm({ ...form, jobDetail: e.target.value })}
              placeholder="อธิบายงานที่จะทำ..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 md:gap-6 pt-6 md:pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm md:text-base"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading || (mode === "create" && !form.jobNumber)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg md:rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm md:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 md:w-5 md:h-5" />
                {submitLabel || "บันทึก"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal for Edit Mode */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-lg md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg md:text-xl font-semibold text-blue-600 mb-3 md:mb-4">ยืนยันการแก้ไข</h3>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">คุณต้องการบันทึกการเปลี่ยนแปลงงานสั่งทำนี้หรือไม่?</p>
            
            {/* Show changes summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">สรุปการเปลี่ยนแปลง:</h4>
              <div className="space-y-2 text-sm">
                {initial?.customerName !== form.customerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อลูกค้า:</span>
                    <span className="font-medium text-gray-600">{initial?.customerName} → {form.customerName}</span>
                  </div>
                )}
                {initial?.phoneNumber !== form.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">เบอร์โทร:</span>
                    <span className="font-medium text-gray-600">{initial?.phoneNumber} → {form.phoneNumber}</span>
                  </div>
                )}
                {initial?.carType !== form.carType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ประเภทรถ:</span>
                    <span className="font-medium">{initial?.carType} → {form.carType}</span>
                  </div>
                )}
                {initial?.licensePlate !== form.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">เลขทะเบียน:</span>
                    <span className="font-medium">{initial?.licensePlate} → {form.licensePlate}</span>
                  </div>
                )}
                {initial?.issueDetail !== form.issueDetail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">รายละเอียดปัญหา:</span>
                    <span className="font-medium text-blue-600">มีการเปลี่ยนแปลง</span>
                  </div>
                )}
                {initial?.jobDetail !== form.jobDetail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">รายละเอียดงาน:</span>
                    <span className="font-medium text-blue-600">มีการเปลี่ยนแปลง</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm md:text-base"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg md:rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'ยืนยันการแก้ไข'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
