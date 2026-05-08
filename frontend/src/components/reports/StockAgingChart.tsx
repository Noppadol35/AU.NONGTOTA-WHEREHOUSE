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
import { Package, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const getBarColor = (days: number) => {
  if (days >= 60) return "hsl(0, 72%, 51%)";     // Red — very stale
  if (days >= 30) return "hsl(25, 95%, 53%)";     // Orange — stale
  if (days >= 14) return "hsl(45, 93%, 47%)";     // Yellow — getting stale
  return "hsl(221, 83%, 53%)";                      // Blue — recent
};

export default function StockAgingChart() {
  const { data, isLoading } = trpc.reports.stockAging.useQuery();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      ...d,
      shortName: d.productName.length > 14 ? d.productName.slice(0, 14) + "…" : d.productName,
      agingLabel:
        d.daysSinceLastSale >= 999
          ? "ไม่เคยขาย"
          : `${d.daysSinceLastSale} วัน`,
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
            <Package className="w-4 h-4 text-orange-500" />
            สินค้าค้างสต็อก
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          ไม่มีสินค้าค้างสต็อก
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" />
          สินค้าค้างสต็อก (ไม่มีการขายนาน)
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
                label={{ value: "จำนวนคงเหลือ", position: "insideBottom", offset: -5, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                dataKey="shortName"
                type="category"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={110}
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
                formatter={(value: any, _name: any, props: any) => {
                  const aging = props?.payload?.agingLabel || "";
                  const sku = props?.payload?.sku || "";
                  return [`${value} ชิ้น (${sku}) — ขายล่าสุด: ${aging}`, "คงเหลือ"];
                }}
                labelFormatter={(_: any, payload: any) => {
                  return payload?.[0]?.payload?.productName || "";
                }}
              />
              <Bar dataKey="stockQuantity" radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(item.daysSinceLastSale)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(0, 72%, 51%)" }} />
            <span>60+ วัน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(25, 95%, 53%)" }} />
            <span>30-59 วัน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} />
            <span>14-29 วัน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(221, 83%, 53%)" }} />
            <span>&lt;14 วัน</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
