"use client";

import {
  Clock,
  Package,
  TrendingUp,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { RecentActivity } from "@/services/dashboardService";

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
          <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
        </div>
        <div className="text-center py-6 md:py-8 text-gray-500">
          <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm md:text-base">ยังไม่มีกิจกรรมล่าสุด</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
        <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {activities.slice(0, 5).map((activity, index) => (
          <div
            key={`activity-${activity.id}-${index}`}
            className="flex flex-col p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start space-x-3 mb-2 md:mb-3">
              <div
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getActivityColor(
                  activity.type
                )} mt-2 flex-shrink-0`}
              ></div>
              <div className="flex items-start space-x-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm md:text-base font-medium text-gray-900 break-words">
                    {activity.action}
                    {activity.product && `: ${activity.product}`}
                    {activity.customer && `: ${activity.customer}`}
                  </p>
                  {activity.car && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1 break-words">
                      รถ: {activity.car}
                    </p>
                  )}
                  {activity.qty && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1 break-words">
                      จำนวน: {activity.qty.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                <span className="text-xs md:text-sm text-gray-500 font-medium">
                  {activity.time}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                ID: {activity.id}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 md:mt-5 text-center">
        <button className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium px-4 md:px-5 py-2 md:py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
          ดูทั้งหมด →
        </button>
      </div>
    </div>
  );
}
