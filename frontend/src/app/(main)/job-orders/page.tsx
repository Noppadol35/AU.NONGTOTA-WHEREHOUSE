"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Modal from "@/components/ui/Modal";
import JobOrderForm from "@/components/job-orders/JobOrderForm";
import JobOrderDetail from "@/components/job-orders/JobOrderDetail";
import PageHeader from "@/components/job-orders/PageHeader";
import FilterSection from "@/components/job-orders/FilterSection";
import StatisticsSummary from "@/components/job-orders/StatisticsSummary";
import JobOrdersList from "@/components/job-orders/JobOrdersList";
import LoadingState from "@/components/job-orders/LoadingState";
import EmptyState from "@/components/job-orders/EmptyState";
import { Snackbar, Alert } from "@mui/material";

interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail: string;
  jobDetail: string;
  status: string;
  createdAt: string;
}

interface JobOrderInput {
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail?: string;
  jobDetail?: string;
  branchId: number;
}

export default function JobOrdersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<JobOrder[]>([]);
  const [consumers, setConsumers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOrder | null>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Group job orders by status
  const groupedJobs = useMemo(() => {
    console.log("🔍 Grouping jobs - items:", items);
    console.log(
      "🔍 Items statuses:",
      items.map((job) => ({
        id: job.id,
        status: job.status,
        jobNumber: job.jobNumber,
      }))
    );

    const groups = {
      PENDING: items.filter(
        (job) => job.status === "PENDING" || job.status === "OPEN"
      ), // Map OPEN to PENDING
      IN_PROGRESS: items.filter((job) => job.status === "IN_PROGRESS"),
      COMPLETED: items.filter((job) => job.status === "COMPLETED"),
    };

    console.log("🔍 Grouped results:", {
      PENDING: groups.PENDING.length,
      IN_PROGRESS: groups.IN_PROGRESS.length,
      COMPLETED: groups.COMPLETED.length,
    });

    return groups;
  }, [items]);

  async function fetchConsumers() {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/job-orders/consumers`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch consumers");
      const data = await res.json();
      setConsumers(data.consumers ?? []);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    }
  }

  async function fetchJobOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (customer) params.set("customer", customer);

      console.log("🔍 Fetching job orders with params:", params.toString());
      console.log(
        "🔍 API URL:",
        `${process.env.NEXT_PUBLIC_API_URL}/job-orders?${params.toString()}`
      );

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/job-orders?${params.toString()}`, {
        credentials: "include",
      });

      console.log("🔍 Response status:", res.status);
      console.log(
        "🔍 Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error("🔍 Response not OK:", errorData);
        throw new Error(
          `Failed to fetch job orders: ${res.status} ${errorData}`
        );
      }

      const data = await res.json();
      console.log("🔍 Received data:", data);
      console.log("🔍 Data length:", data?.length || 0);

      setItems(data || []); // Remove .items since API returns array directly
      setLastRefreshTime(new Date()); // Update last refresh time
      console.log("🔍 Items state updated:", data?.length || 0, "items");
      console.log(
        "🔍 Last refresh time updated:",
        new Date().toLocaleTimeString()
      );
    } catch (error) {
      console.error("🔍 Error fetching job orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConsumers();
  }, []);

  useEffect(() => {
    console.log("🔍 useEffect triggered - customer changed:", customer);
    fetchJobOrders();
  }, [customer]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    console.log("🔍 Setting up auto-refresh every 5 minutes...");

    const interval = setInterval(() => {
      console.log("🔍 Auto-refresh triggered (5 minutes)");
      fetchJobOrders();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => {
      console.log("🔍 Cleaning up auto-refresh interval");
      clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once on mount

  async function createJobOrder(data: JobOrderInput) {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/job-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Create failed");
      }

      setOpenCreate(false);
      await fetchJobOrders();
      await fetchConsumers(); // refresh consumer list
    } catch (error) {
      console.error("Error creating job order:", error);
      alert(error instanceof Error ? error.message : "Create failed");
    }
  }

  async function updateJobOrder(id: number, data: JobOrderInput) {
    try {
      console.log("🔍 JobOrdersPage: updateJobOrder called with:", {
        id,
        data,
      });
      console.log("🔍 JobOrdersPage: Data type:", typeof data);
      console.log("🔍 JobOrdersPage: Data keys:", Object.keys(data));

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/job-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      console.log("🔍 JobOrdersPage: Update response status:", res.status);
      console.log(
        "🔍 JobOrdersPage: Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        const error = await res.json();
        console.error("🔍 JobOrdersPage: Update API Error:", error);
        throw new Error(error.message || "Update failed");
      }

      const result = await res.json();
      console.log("🔍 JobOrdersPage: Update successful:", result);

      await fetchJobOrders();
      await fetchConsumers(); // refresh consumer list

      // Close the modal and show success snackbar
      setSelectedJob(null);
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error("🔍 JobOrdersPage: Error updating job order:", error);
      alert(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function deleteJobOrder(id: number) {
    if (!confirm("ยืนยันการลบ Job Order นี้?")) return;

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/job-orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }

      await fetchJobOrders();
      await fetchConsumers(); // refresh consumer list
    } catch (error) {
      console.error("Error deleting job order:", error);
      alert(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function handleCardClick(job: JobOrder) {
    try {
      console.log("Fetching job order detail for ID:", job.id);

      // Fetch full detail from backend
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/job-orders/${job.id}`, {
        credentials: "include",
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to fetch job order detail");
      }

      const data = await res.json();
      console.log("Job order detail data:", data);
      setSelectedJob(data);
    } catch (error) {
      console.error("Error fetching job order detail:", error);
      alert("ไม่สามารถดึงข้อมูลรายละเอียดได้");
    }
  }



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        lastRefreshTime={lastRefreshTime}
        onCreateClick={() => setOpenCreate(true)}
        onRefreshClick={() => {
          console.log("🔍 Manual refresh triggered");
          fetchJobOrders();
        }}
      />

      {/* Filter Section */}
      <FilterSection
        customer={customer}
        consumers={consumers}
        onCustomerChange={setCustomer}
      />

      {/* Statistics Summary */}
      {!loading && items.length > 0 && (
        <StatisticsSummary groupedJobs={groupedJobs} />
      )}

      {/* Job Orders by Status */}
      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <JobOrdersList
          groupedJobs={groupedJobs}
          onCardClick={handleCardClick as any}
        />
      )}

      {/* Modals */}
      {openCreate && (
        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <JobOrderForm
            mode="create"
            onSubmit={createJobOrder}
            onCancel={() => setOpenCreate(false)}
          />
        </Modal>
      )}

      {selectedJob && (
        <Modal
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          size="xl"
        >
          <JobOrderDetail
            jobOrder={selectedJob}
            onEdit={(data) => updateJobOrder(selectedJob.id, data)}
            onDelete={() => deleteJobOrder(selectedJob.id)}
            onClose={() => setSelectedJob(null)}
          />
        </Modal>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          อัปเดตข้อมูลงานสั่งทำเรียบร้อยแล้ว!
        </Alert>
      </Snackbar>
    </div>
  );
}
