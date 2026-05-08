"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Calendar,
  Building,
} from "lucide-react";
import UserForm from "./UserForm";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AuditLogDetailModal from "./AuditLogDetailModal";
import { trpc } from "@/lib/trpc";

interface UserItem {
  id: string;
  username: string;
  fullName: string | null;
  role: "OWNER" | "MANAGER" | "WORKER";
  createdAt: string;
  branchId: number;
  branch: { id: number; name: string };
}

interface UserFormData {
  username: string;
  fullName: string;
  email: string;
  role: "OWNER" | "MANAGER" | "WORKER";
  branchId: number;
  password?: string;
}

interface AuditLog {
  id: number;
  user: string;
  action: string;
  details: string;
  ip: string;
  time: string;
  entityType: string;
  entityId?: number;
  oldValues?: unknown;
  newValues?: unknown;
}

export default function UserManagement() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<UserItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [auditDetailModal, setAuditDetailModal] = useState<AuditLog | null>(null);

  const utils = trpc.useUtils();

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: usersData, isLoading: loading } = trpc.users.list.useQuery({
    page: currentPage,
    pageSize,
  });
  const users = (usersData?.items ?? []) as unknown as UserItem[];
  const totalUsers = usersData?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const { data: branchesData } = trpc.branches.list.useQuery();
  const branches = branchesData?.items ?? [];

  const { data: auditData, isLoading: auditLoading } = trpc.auditLogs.list.useQuery(
    { page: currentPage, pageSize },
    { enabled: activeTab === "audit" }
  );
  const auditLogs = (auditData?.items ?? []) as unknown as AuditLog[];

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setOpenCreate(false);
    },
    onError: (err) => alert(err.message),
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setOpenEdit(null);
    },
    onError: (err) => alert(err.message),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setDeleteConfirm(null);
    },
    onError: (err) => alert(err.message),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "OWNER":
        return { label: "เจ้าของระบบ", color: "bg-red-100 text-red-800", icon: Shield };
      case "MANAGER":
        return { label: "ผู้จัดการ", color: "bg-blue-100 text-blue-800", icon: Users };
      case "WORKER":
        return { label: "พนักงาน", color: "bg-green-100 text-green-800", icon: User };
      default:
        return { label: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: User };
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">ผู้ใช้ & Audit</h2>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มผู้ใช้
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(["users", "audit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === "users" ? <Users className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                {tab === "users" ? `จัดการผู้ใช้ (${totalUsers})` : "Audit Log"}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === "users" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สิทธิ์</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สาขา</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
                          <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">ไม่พบข้อมูลผู้ใช้</td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const roleInfo = getRoleInfo(user.role);
                      const RoleIcon = roleInfo.icon;
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.fullName || "ไม่ระบุชื่อ"}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                              <RoleIcon className="w-3 h-3" />
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{user.branch?.name || "ไม่ระบุสาขา"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setOpenEdit(user)}
                                className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(user)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    แสดง <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> ถึง{" "}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> จาก{" "}
                    <span className="font-medium">{totalUsers}</span> รายการ
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Audit Log Tab */
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ผู้ใช้</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">การดำเนินการ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">รายละเอียด</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 hidden md:table-cell">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">เวลา</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
                          <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
                        </div>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">ไม่พบข้อมูล Audit Log</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate max-w-20">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-full truncate">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-900 truncate max-w-48 sm:max-w-64 md:max-w-80 lg:max-w-96" title={log.details}>
                              {log.details}
                            </div>
                            <button
                              onClick={() => setAuditDetailModal(log)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-500 font-mono truncate max-w-24 block">{log.ip}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 truncate max-w-28">{log.time}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {(openCreate || openEdit) && (
        <UserForm
          open={openCreate || !!openEdit}
          onClose={() => { setOpenCreate(false); setOpenEdit(null); }}
          user={openEdit}
          branches={branches as unknown as { id: number; name: string }[]}
          onSubmit={async (data: UserFormData) => {
            if (openEdit) {
              updateMutation.mutate({
                id: openEdit.id,
                fullName: data.fullName,
                role: data.role,
                branchId: data.branchId,
              });
            } else {
              createMutation.mutate({
                username: data.username,
                fullName: data.fullName,
                name: data.fullName,
                email: data.email,
                role: data.role,
                branchId: data.branchId,
                password: data.password!,
              });
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          user={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={async (id: string) => { await deleteMutation.mutateAsync({ id }); }}
        />
      )}

      {/* Audit Log Detail Modal */}
      {auditDetailModal && (
        <AuditLogDetailModal
          auditLog={auditDetailModal}
          onClose={() => setAuditDetailModal(null)}
        />
      )}
    </div>
  );
}
