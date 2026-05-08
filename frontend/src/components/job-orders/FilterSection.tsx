import { Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSectionProps {
  customer: string;
  consumers: string[];
  onCustomerChange: (customer: string) => void;
}

export default function FilterSection({
  customer,
  consumers,
  onCustomerChange,
}: FilterSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="lg:w-72 space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Filter className="w-4 h-4 text-muted-foreground" />
              กรองตามลูกค้า
            </Label>
            <Select
              value={customer || "__all__"}
              onValueChange={(val) => onCustomerChange(val === "__all__" ? "" : val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ทุกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">ทุกลูกค้า</SelectItem>
                {consumers.map((c, index) => (
                  <SelectItem key={`customer-${index}-${c}`} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
