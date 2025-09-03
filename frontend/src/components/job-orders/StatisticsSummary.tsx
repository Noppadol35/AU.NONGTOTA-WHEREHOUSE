import StatisticsCard from "./StatisticsCard";

interface StatisticsSummaryProps {
  groupedJobs: {
    PENDING: any[];
    IN_PROGRESS: any[];
    COMPLETED: any[];
  };
}

export default function StatisticsSummary({
  groupedJobs,
}: StatisticsSummaryProps) {


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
    </div>
  );
}
