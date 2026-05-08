import { RefreshCw, Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageHeaderProps {
  lastRefreshTime: Date;
  onCreateClick: () => void;
  onRefreshClick: () => void;
}

export default function PageHeader({
  lastRefreshTime,
  onCreateClick,
  onRefreshClick,
}: PageHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                จัดการ Job Orders
              </h1>
              <p className="text-muted-foreground">
                สร้างและจัดการงานซ่อมรถยนต์ของลูกค้า
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                อัปเดตล่าสุด: {lastRefreshTime.toLocaleTimeString("th-TH")}
              </p>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={onRefreshClick}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              รีเฟรช
            </Button>
            <Button
              onClick={onCreateClick}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม Job Order ใหม่
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
