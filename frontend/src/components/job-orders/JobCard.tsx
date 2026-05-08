import { User, Phone, Car, Hash, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  status: string;
  createdAt: string;
  issueDetail?: string;
  jobDetail?: string;
  branchId?: number;
  branch?: {
    name: string;
  };
  items?: Array<{
    id: number;
    qty: number;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
  // ข้อมูลการเงิน
  subtotal?: number;
  laborCost?: number;
  vatAmount?: number;
  grandTotal?: number;
}

interface JobCardProps {
  job: JobOrder;
  onCardClick: (job: JobOrder) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "เปิดงาน", variant: "outline" },
  OPEN: { label: "เปิดงาน", variant: "outline" },
  IN_PROGRESS: { label: "กำลังดำเนินการ", variant: "default" },
  COMPLETED: { label: "เสร็จสิ้น", variant: "secondary" },
};

export default function JobCard({ job, onCardClick }: JobCardProps) {
  const status = statusConfig[job.status] ?? { label: job.status, variant: "outline" as const };

  // Dynamic border-left color based on status
  const borderLeftColor =
    job.status === "IN_PROGRESS"
      ? "border-l-blue-500"
      : job.status === "COMPLETED"
        ? "border-l-green-500"
        : "border-l-orange-500";

  return (
    <Card
      className={`border-l-4 ${borderLeftColor} hover:shadow-md transition-all duration-200 cursor-pointer group`}
      onClick={() => onCardClick(job)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              #{job.jobNumber}
            </h3>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(job.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate">{job.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{job.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{job.carType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground font-mono">{job.licensePlate}</span>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="pt-3 pb-3">
        <div className="flex items-center justify-between w-full">
          {job.grandTotal ? (
            <>
              <span className="text-xs text-muted-foreground">ยอดรวม</span>
              <span className="text-sm font-bold text-green-600">
                ฿{job.grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">ดูรายละเอียด</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
