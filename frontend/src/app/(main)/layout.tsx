"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { Menu, X } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-gray-100 bg-opacity-10" 
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Sidebar */}
        <Sidebar 
          mobileOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="xl:pl-64">
          {/* Top Navigation */}
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Main Content */}
          <main className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile/Tablet Menu Button - Fixed Bottom Right - For md and below */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-4 right-4 z-50 xl:hidden w-14 h-14 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
        >
          <Menu size={24} />
        </button>
      </div>
    </ProtectedRoute>
  );
}


