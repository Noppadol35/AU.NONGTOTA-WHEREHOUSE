"use client";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings, Bell, Menu } from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function TopNavbar({ onMenuClick }: Props) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'OWNER': return 'เจ้าของ';
      case 'MANAGER': return 'ผู้จัดการ';
      case 'WORKER': return 'พนักงาน';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'WORKER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile Menu Button & App Title */}
        <div className="flex items-center gap-3">
          {/* Mobile/Tablet Menu Button - Show on md and below */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="xl:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
          
        </div>

        {/* Right side - User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notifications - Hidden on small screens */}
          <button className="hidden sm:flex p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>


          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Info - Hidden on small screens */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                {getRoleText(user?.role || '')}
              </span>
            </div>
            
            {/* User Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
