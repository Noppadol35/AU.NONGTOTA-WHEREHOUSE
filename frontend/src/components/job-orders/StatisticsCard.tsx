interface StatisticsCardProps {
  title: string;
  count: number;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  isAnimated?: boolean;
}

export default function StatisticsCard({
  title,
  count,
  description,
  gradientFrom,
  gradientTo,
  borderColor,
  bgColor,
  textColor,
  isAnimated = false,
}: StatisticsCardProps) {
  return (
    <div
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl p-6 border ${borderColor}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 ${bgColor} rounded-full ${
            isAnimated ? "animate-pulse" : ""
          }`}
        ></div>
        <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
      </div>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
      <p className={`text-sm ${textColor} mt-1 opacity-80`}>{description}</p>
    </div>
  );
}
