"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = {
  days: number;
};

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(221, 83%, 58%)",
  "hsl(221, 70%, 62%)",
  "hsl(221, 60%, 66%)",
  "hsl(221, 50%, 70%)",
  "hsl(221, 45%, 73%)",
  "hsl(221, 40%, 76%)",
  "hsl(221, 35%, 79%)",
  "hsl(221, 30%, 82%)",
  "hsl(221, 25%, 85%)",
];

export default function TopSalesChart({ days }: Props) {
  const { data, isLoading } = trpc.reports.salesBreakdown.useQuery({ days });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      ...d,
      // Truncate long names for chart display
      shortName: d.productName.length > 12 ? d.productName.slice(0, 12) + "…" : d.productName,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-80">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            สินค้าขายดี Top 10
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          ไม่มีข้อมูลการขายในช่วงเวลานี้
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          สินค้าขายดี Top 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="shortName"
                type="category"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "hsl(var(--popover-foreground))",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "totalSold") return [`${value} ชิ้น`, "จำนวนขาย"];
                  return [`฿${Number(value).toLocaleString()}`, "รายได้"];
                }}
                labelFormatter={(_: any, payload: any) => {
                  return payload?.[0]?.payload?.productName || "";
                }}
              />
              <Bar dataKey="totalSold" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
