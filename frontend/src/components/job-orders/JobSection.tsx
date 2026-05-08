import JobCard from "./JobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

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
  subtotal?: number;
  laborCost?: number;
  vatAmount?: number;
  grandTotal?: number;
}

interface JobSectionProps {
  title: string;
  description: string;
  jobs: JobOrder[];
  onCardClick: (job: JobOrder) => void;
  emptyMessage: string;
  emptySubMessage: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: LucideIcon | string;
}

export default function JobSection({
  title,
  description,
  jobs,
  onCardClick,
  emptyMessage,
  emptySubMessage,
  bgColor,
  textColor,
  icon,
}: JobSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center shadow-sm`}>
            {typeof icon === "string" ? (
              <span className="text-sm">{icon}</span>
            ) : (
              (() => { const Icon = icon; return <Icon className="w-4 h-4 text-white" />; })()
            )}
          </div>
          <div className="flex-1">
            <CardTitle className={`text-lg ${textColor}`}>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {jobs.length} งาน
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onCardClick={onCardClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-3xl mb-3">
              {typeof icon === "string" ? icon : (() => { const Icon = icon; return <Icon className="w-8 h-8 text-muted-foreground mx-auto" />; })()}
            </div>
            <p className="text-muted-foreground font-medium">{emptyMessage}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {emptySubMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
