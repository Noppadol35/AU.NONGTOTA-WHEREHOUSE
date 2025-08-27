"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600'
};

export default function StatsCard({ icon: Icon, title, value, color, subtitle, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-2 md:p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="ml-3 md:ml-4 flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">จากเดือนที่แล้ว</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
