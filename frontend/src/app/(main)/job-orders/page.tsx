"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobOrderForm from "@/components/job-orders/JobOrderForm";
import JobOrderDetail from "@/components/job-orders/JobOrderDetail";
import PageHeader from "@/components/job-orders/PageHeader";
import FilterSection from "@/components/job-orders/FilterSection";
import StatisticsSummary from "@/components/job-orders/StatisticsSummary";
import JobOrdersList from "@/components/job-orders/JobOrdersList";
import LoadingState from "@/components/job-orders/LoadingState";
import EmptyState from "@/components/job-orders/EmptyState";

export default function JobOrdersPage() {
  const [customer, setCustomer] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: consumersData } = trpc.jobOrders.consumers.useQuery();
  const consumers = consumersData?.consumers ?? [];

  const { data: jobOrdersData, isLoading } = trpc.jobOrders.list.useQuery({
    customer: customer || undefined,
  });
  const items = jobOrdersData ?? [];

  const { data: selectedJob } = trpc.jobOrders.getById.useQuery(
    { id: selectedJobId! },
    { enabled: !!selectedJobId }
  );

  const lastRefreshTime = new Date();

  // ── Group by status ───────────────────────────────────────────────────────────
  const groupedJobs = useMemo(() => ({
    PENDING: items.filter((j) => j.status === "OPEN" || (j.status as string) === "PENDING"),
    IN_PROGRESS: items.filter((j) => j.status === "IN_PROGRESS"),
    COMPLETED: items.filter((j) => j.status === "COMPLETED"),
  }), [items]);

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMutation = trpc.jobOrders.create.useMutation({
    onSuccess: () => {
      utils.jobOrders.list.invalidate();
      utils.jobOrders.consumers.invalidate();
      setOpenCreate(false);
      toast.success("สร้าง Job Order สำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.jobOrders.update.useMutation({
    onSuccess: () => {
      utils.jobOrders.list.invalidate();
      utils.jobOrders.consumers.invalidate();
      if (selectedJobId) utils.jobOrders.getById.invalidate({ id: selectedJobId });
      setSelectedJobId(null);
      toast.success("อัปเดตข้อมูลงานสั่งทำเรียบร้อยแล้ว!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.jobOrders.delete.useMutation({
    onSuccess: () => {
      utils.jobOrders.list.invalidate();
      utils.jobOrders.consumers.invalidate();
      setSelectedJobId(null);
      toast.success("ลบ Job Order สำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        lastRefreshTime={lastRefreshTime}
        onCreateClick={() => setOpenCreate(true)}
        onRefreshClick={() => utils.jobOrders.list.invalidate()}
      />

      <FilterSection
        customer={customer}
        consumers={consumers}
        onCustomerChange={setCustomer}
      />

      {!isLoading && items.length > 0 && (
        <StatisticsSummary groupedJobs={groupedJobs} />
      )}

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <JobOrdersList
          groupedJobs={groupedJobs}
          onCardClick={(job) => setSelectedJobId(job.id)}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>สร้าง Job Order ใหม่</DialogTitle>
          </DialogHeader>
          <JobOrderForm
            mode="create"
            onSubmit={(data) => createMutation.mutate(data as any)}
            onCancel={() => setOpenCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail/Edit Dialog */}
      <Dialog open={!!selectedJobId && !!selectedJob} onOpenChange={(open) => { if (!open) setSelectedJobId(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>รายละเอียด Job Order</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <JobOrderDetail
              jobOrder={selectedJob as any}
              onEdit={async (data) => { await updateMutation.mutateAsync({ id: selectedJobId!, ...data } as any); }}
              onDelete={async () => {
                if (confirm("ยืนยันการลบ Job Order นี้?")) {
                  await deleteMutation.mutateAsync({ id: selectedJobId! });
                }
              }}
              onClose={() => setSelectedJobId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
