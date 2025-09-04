"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Box,
  PackageOpen,
  Truck,
  ClipboardList,
  Repeat,
  BarChart3,
  Users,
  HardDriveDownload,
  Car,
  ChevronDown,
  ChevronRight,
  Wrench,
  FolderCog,
  Settings,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  href?: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
};

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Management",
    icon: <FolderCog size={18} />,
    children: [
      { href: "/products", label: "Products", icon: <Box size={18} /> },
      { href: "/stock-in", label: "Stock In", icon: <PackageOpen size={18} /> },
      { href: "/stock-out", label: "Stock Out", icon: <Truck size={18} /> },
      {
        href: "/billing",
        label: "Billing",
        icon: <ClipboardList size={18} />,
      },
      {
        href: "/cycle-count",
        label: "Cycle Count",
        icon: <Repeat size={18} />,
      },
      { href: "/reports", label: "Reports", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    label: "Job",
    icon: <Wrench size={18} />,
    children: [
      {
        href: "/job-orders",
        label: "Job Orders",
        icon: <ClipboardList size={16} />,
      },
    ],
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { user } = useAuth();

  // Create navigation items with conditional Settings menu
  const getNavigationItems = () => {
    const baseItems = [...items];
    
    // Filter Management children to hide Reports for non-OWNER users
    const managementItem = baseItems.find(item => item.label === "Management");
    if (managementItem && managementItem.children) {
      if (user?.role !== "OWNER") {
        // Remove Reports from Management menu for non-OWNER users
        managementItem.children = managementItem.children.filter(child => child.label !== "Reports");
      }
    }
    
    // Add Settings menu only for OWNER role
    if (user?.role === "OWNER") {
      baseItems.push({
        href: "/settings",
        label: "Settings",
        icon: <Settings size={18} />,
      });
    }
    
    return baseItems;
  };

  const toggleItem = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (href?: string) => {
    if (href) {
      router.push(href);
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Fixed - Only on large screens */}
      <div className="hidden xl:flex xl:flex-col xl:w-64 xl:fixed xl:inset-y-0 xl:z-40 bg-white border-r  shadow-lg">
        {/* Sidebar Header */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <Car />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                AU.NONGTOTA
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                WAREHOUSE SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {getNavigationItems().map((item, index) => (
            <div key={`nav-item-${index}-${item.label}`}>
              {item.href ? (
                // Single item with link
                <button
                  onClick={() => handleItemClick(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ) : (
                // Group item with children
                <div>
                  <button
                    onClick={() => toggleItem(item.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                      {expandedItems.has(item.label) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </button>

                  {/* Children items */}
                  {expandedItems.has(item.label) && item.children && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <button
                          key={`nav-child-${index}-${childIndex}-${child.label}`}
                          onClick={() => handleItemClick(child.href)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-5 h-5 flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                            {child.icon}
                          </div>
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">Version 1.0.0</p>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} AU.NONGTOTA
            </p>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sidebar - Slide in from left - For md and below */}
      <div
        className={`xl:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-50 bg-opacity-10"
          onClick={onClose}
        />
        <div className="fixed inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <Car />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  AU.NONGTOTA
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  WAREHOUSE SYSTEM
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {getNavigationItems().map((item, index) => (
              <div key={`nav-item-${index}-${item.label}`}>
                {item.href ? (
                  <button
                    onClick={() => handleItemClick(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleItem(item.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                        {expandedItems.has(item.label) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                    </button>

                    {expandedItems.has(item.label) && item.children && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <button
                            key={`nav-child-${index}-${childIndex}-${child.label}`}
                            onClick={() => handleItemClick(child.href)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
                          >
                            <div className="w-5 h-5 flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                              {child.icon}
                            </div>
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">Version 1.0.0</p>
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} AU.NONGTOTA
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
