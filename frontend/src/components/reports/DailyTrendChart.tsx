"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = {
  days: number;
};

const formatCurrency = (value: number) =>
  `฿${value.toLocaleString("th-TH")}`;

const formatDate = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  if (days <= 1) {
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  }
  if (days <= 7) {
    return date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric" });
  }
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

export default function DailyTrendChart({ days }: Props) {
  const { data, isLoading } = trpc.reports.dailyTrend.useQuery({ days });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      ...d,
      label: formatDate(d.date, days),
    }));
  }, [data, days]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-80">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          ยอดงาน & รายได้รายวัน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "revenue") return [formatCurrency(value as number), "รายได้"];
                  return [value, "จำนวนงาน"];
                }}
                labelFormatter={(label: any) => `วันที่: ${label}`}
              />
              <Legend
                formatter={(value: string) => (value === "jobCount" ? "จำนวนงาน" : "รายได้")}
                wrapperStyle={{ fontSize: "13px" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="jobCount"
                stroke="hsl(221, 83%, 53%)"
                fill="url(#colorJobs)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(221, 83%, 53%)" }}
                activeDot={{ r: 5 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(142, 71%, 45%)"
                fill="url(#colorRevenue)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(142, 71%, 45%)" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
