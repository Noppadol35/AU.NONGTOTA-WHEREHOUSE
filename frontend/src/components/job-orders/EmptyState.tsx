import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            ไม่พบ Job Orders
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ลองสร้าง Job Order ใหม่หรือเปลี่ยนตัวกรอง
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
