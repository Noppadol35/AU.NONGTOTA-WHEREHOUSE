"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
  red: 'from-red-500 to-red-600 shadow-red-500/20',
  green: 'from-green-500 to-green-600 shadow-green-500/20',
  purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
  orange: 'from-orange-500 to-orange-600 shadow-orange-500/20'
};

const textClasses = {
  blue: 'text-blue-600',
  red: 'text-red-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600'
};

export default function StatsCard({ icon: Icon, title, value, color, subtitle, trend }: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-none bg-white/60 backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative background blur */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${colorClasses[color]} blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
      
      <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col justify-between h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 md:p-3.5 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
          </div>
          {trend && (
            <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-muted-foreground mb-1 truncate">{title}</p>
          <p className="text-2xl md:text-3xl font-extrabold text-foreground truncate tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2 truncate font-medium">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
