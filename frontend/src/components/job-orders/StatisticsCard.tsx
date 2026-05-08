import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

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
  icon?: LucideIcon;
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
  icon: Icon,
}: StatisticsCardProps) {
  return (
    <Card className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} border ${borderColor} overflow-hidden`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div
              className={`w-3 h-3 ${bgColor} rounded-full ${isAnimated ? "animate-pulse" : ""}`}
            />
          )}
          <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
        </div>
        <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
        <p className={`text-sm ${textColor} mt-1 opacity-80`}>{description}</p>
      </CardContent>
    </Card>
  );
}
