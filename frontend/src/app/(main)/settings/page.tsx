"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FolderCog,
  Users,
  HardDriveDownload,
  Shield,
} from "lucide-react";
import CategoryManagement from "@/components/settings/CategoryManagement";
import UserManagement from "@/components/settings/UserManagement";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("category");

  // Redirect if not OWNER
  useEffect(() => {
    if (user && user.role !== "OWNER") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Show loading if user not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show access denied if not OWNER
  if (user.role !== "OWNER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      id: "category",
      label: "หมวดหมู่",
      icon: FolderCog,
      description: "จัดการหมวดหมู่สินค้า",
    },
    {
      id: "users",
      label: "ผู้ใช้ & Audit",
      icon: Users,
      description: "จัดการผู้ใช้และตรวจสอบการใช้งาน",
    },
    {
      id: "backup",
      label: "Backup",
      icon: HardDriveDownload,
      description: "สำรองและกู้คืนข้อมูล",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "category":
        return <CategoryManagement />;
      
      case "users":
        return <UserManagement />;
      
      case "backup":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <HardDriveDownload className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Backup</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">หน้าจัดการ Backup จะแสดงที่นี่</p>
              {/* TODO: Add Backup management component */}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                การตั้งค่าระบบ
              </h1>
              <p className="text-gray-600">จัดการการตั้งค่าระบบและผู้ใช้งาน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Menu */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              เมนูการตั้งค่า
            </h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === item.id
                          ? "text-orange-600"
                          : "text-gray-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
