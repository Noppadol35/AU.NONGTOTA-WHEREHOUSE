import JobCard from "./JobCard";

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

interface JobSectionProps {
  title: string;
  description: string;
  jobs: JobOrder[];
  onCardClick: (job: JobOrder) => void;
  emptyMessage: string;
  emptySubMessage: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export default function JobSection({
  title,
  description,
  jobs,
  onCardClick,
  emptyMessage,
  emptySubMessage,
  gradientFrom,
  gradientTo,
  borderColor,
  bgColor,
  textColor,
  icon,
}: JobSectionProps) {
  return (
    <div className="relative">
      {/* Section Divider Line */}
      <div
        className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-full`}
      ></div>

      <div className="ml-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} border-b ${borderColor} px-6 py-5`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 ${bgColor} rounded-full shadow-sm`}></div>
            <h2 className={`text-2xl font-bold ${textColor}`}>{title}</h2>
            <span
              className={`${bgColor} text-white px-4 py-2 rounded-full text-sm font-semibold`}
            >
              {jobs.length} งาน
            </span>
          </div>
          <p className={`${textColor} mt-2 ml-9`}>{description}</p>
        </div>

        <div className={`p-8 ${bgColor}/20`}>
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onCardClick={onCardClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{icon}</div>
              <p className={`${textColor} font-medium`}>{emptyMessage}</p>
              <p className={`${textColor} text-sm mt-1 opacity-80`}>
                {emptySubMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
