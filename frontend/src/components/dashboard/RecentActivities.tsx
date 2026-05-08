"use client";

import {
  Clock,
  Package,
  TrendingUp,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface RecentActivity {
  id: number;
  action: string;
  product?: string;
  customer?: string;
  car?: string;
  qty?: number;
  time: string;
  type: 'stock-out' | 'stock-in' | 'job-order' | 'low-stock';
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const getActivityIcon = (type: RecentActivity["type"]) => {
  switch (type) {
    case "stock-out":
      return <Package className="h-4 w-4 text-red-500" />;
    case "stock-in":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "job-order":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "low-stock":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default:
      return <Package className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityColor = (type: RecentActivity["type"]) => {
  switch (type) {
    case "stock-out":
      return "bg-red-500";
    case "stock-in":
      return "bg-green-500";
    case "job-order":
      return "bg-blue-500";
    case "low-stock":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

export default function RecentActivities({
  activities,
}: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base md:text-lg">กิจกรรมล่าสุด</CardTitle>
          <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center py-6 md:py-8 text-muted-foreground">
          <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm md:text-base">ยังไม่มีกิจกรรมล่าสุด</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100/50">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">กิจกรรมล่าสุด</CardTitle>
        <div className="p-2 bg-gray-100 rounded-full">
          <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => (
            <div
              key={`activity-${activity.id}-${index}`}
              className="group relative flex flex-col p-4 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >
              {/* Decorative accent line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${getActivityColor(activity.type)} opacity-70 group-hover:opacity-100 transition-opacity`} />
              
              <div className="flex items-start space-x-4">
                <div className={`p-2.5 rounded-xl bg-gray-50 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100/50`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <p className="text-sm md:text-base font-semibold text-gray-900 break-words leading-tight">
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full w-fit">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {activity.product && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <span className="font-medium text-gray-700">{activity.product}</span>
                      </p>
                    )}
                    {activity.customer && (
                      <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        ลูกค้า: <span className="text-gray-700">{activity.customer}</span>
                      </p>
                    )}
                    {activity.car && (
                      <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        รถ: <span className="font-medium text-gray-700">{activity.car}</span>
                      </p>
                    )}
                    {activity.qty && (
                      <p className="text-xs md:text-sm font-medium text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-md mt-2 border border-blue-100">
                        จำนวน: {activity.qty.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 md:mt-8 text-center">
          <Button variant="outline" className="w-full sm:w-auto rounded-full border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium px-8 transition-colors">
            ดูประวัติทั้งหมด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
