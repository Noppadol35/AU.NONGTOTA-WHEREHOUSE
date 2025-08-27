import StatisticsCard from "./StatisticsCard";

interface StatisticsSummaryProps {
  groupedJobs: {
    PENDING: any[];
    IN_PROGRESS: any[];
    COMPLETED: any[];
  };
}

export default function StatisticsSummary({ groupedJobs }: StatisticsSummaryProps) {
  // คำนวณยอดรวมการเงิน
  const calculateTotalAmount = (jobs: any[]) => {
    return jobs.reduce((total, job) => total + (job.grandTotal || 0), 0);
  };

  const totalPendingAmount = calculateTotalAmount(groupedJobs.PENDING);
  const totalInProgressAmount = calculateTotalAmount(groupedJobs.IN_PROGRESS);
  const totalCompletedAmount = calculateTotalAmount(groupedJobs.COMPLETED);

  return (
    <div className="space-y-6">
      {/* Job Status Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticsCard
          title="เปิดงาน"
          count={groupedJobs.PENDING.length}
          description="งานรอดำเนินการ"
          gradientFrom="from-orange-50"
          gradientTo="to-yellow-50"
          borderColor="border-orange-200"
          bgColor="bg-orange-500"
          textColor="text-orange-800"
        />

        <StatisticsCard
          title="กำลังดำเนินการ"
          count={groupedJobs.IN_PROGRESS.length}
          description="งานที่กำลังทำ"
          gradientFrom="from-blue-50"
          gradientTo="to-indigo-50"
          borderColor="border-blue-200"
          bgColor="bg-blue-500"
          textColor="text-blue-800"
          isAnimated={true}
        />

        <StatisticsCard
          title="เสร็จสิ้น"
          count={groupedJobs.COMPLETED.length}
          description="งานที่เสร็จแล้ว"
          gradientFrom="from-green-50"
          gradientTo="to-emerald-50"
          borderColor="border-green-200"
          bgColor="bg-green-500"
          textColor="text-green-800"
        />
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          สรุปการเงิน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              ฿{totalPendingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">ยอดรวมงานรอดำเนินการ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              ฿{totalInProgressAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">ยอดรวมงานที่กำลังทำ</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 mb-2">
              ฿{totalCompletedAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">ยอดรวมงานที่เสร็จแล้ว</div>
          </div>
        </div>
      </div>
    </div>
  );
}
