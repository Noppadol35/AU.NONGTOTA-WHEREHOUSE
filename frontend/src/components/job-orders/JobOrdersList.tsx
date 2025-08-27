import JobSection from "./JobSection";

interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  status: string;
  createdAt: string;
  issueDetail?: string;
  jobDetail?: string;
  branchId?: number;
  branch?: {
    name: string;
  };
  items?: Array<{
    id: number;
    qty: number;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
  // ข้อมูลการเงิน
  subtotal?: number;        // ยอดรวมสินค้า
  laborCost?: number;       // ค่าแรง
  vatAmount?: number;       // ภาษีมูลค่าเพิ่ม
  grandTotal?: number;      // ยอดรวมทั้งหมด
}

interface JobOrdersListProps {
  groupedJobs: {
    PENDING: JobOrder[];
    IN_PROGRESS: JobOrder[];
    COMPLETED: JobOrder[];
  };
  onCardClick: (job: JobOrder) => void;
}

export default function JobOrdersList({
  groupedJobs,
  onCardClick,
}: JobOrdersListProps) {
  return (
    <div className="space-y-10">
      {/* เปิดงาน Section */}
      <JobSection
        title="เปิดงาน"
        description="งานที่รอการดำเนินการ"
        jobs={groupedJobs.PENDING}
        onCardClick={onCardClick}
        emptyMessage="ไม่มีงานรอดำเนินการ"
        emptySubMessage="งานใหม่จะปรากฏที่นี่"
        gradientFrom="from-orange-50"
        gradientTo="to-orange-500"
        borderColor="border-orange-200"
        bgColor="bg-orange-500"
        textColor="text-orange-800"
        icon="🏎️"
      />

      {/* กำลังดำเนินการ Section */}
      <JobSection
        title="กำลังดำเนินการ"
        description="งานที่เริ่มแล้ว"
        jobs={groupedJobs.IN_PROGRESS}
        onCardClick={onCardClick}
        emptyMessage="ไม่มีงานที่กำลังดำเนินการ"
        emptySubMessage="งานที่เริ่มแล้วจะปรากฏที่นี่"
        gradientFrom="from-blue-50"
        gradientTo="to-blue-500"
        borderColor="border-blue-200"
        bgColor="bg-blue-500"
        textColor="text-blue-800"
        icon="⚙️"
      />

      {/* เสร็จสิ้น Section */}
      <JobSection
        title="เสร็จสิ้น"
        description="งานที่ดำเนินการเสร็จสิ้นแล้ว"
        jobs={groupedJobs.COMPLETED}
        onCardClick={onCardClick}
        emptyMessage="ยังไม่มีงานที่เสร็จสิ้น"
        emptySubMessage="งานที่เสร็จแล้วจะปรากฏที่นี่"
        gradientFrom="from-green-50"
        gradientTo="to-green-500"
        borderColor="border-green-200"
        bgColor="bg-green-500"
        textColor="text-green-800"
        icon="✅"
      />
    </div>
  );
}
