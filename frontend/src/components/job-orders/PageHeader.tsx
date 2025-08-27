interface PageHeaderProps {
  lastRefreshTime: Date;
  onCreateClick: () => void;
  onRefreshClick: () => void;
}

export default function PageHeader({
  lastRefreshTime,
  onCreateClick,
  onRefreshClick,
}: PageHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            จัดการ Job Orders
          </h1>
          <p className="text-gray-600">สร้างและจัดการงานซ่อมรถยนต์ของลูกค้า</p>
          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span>
              อัปเดตล่าสุด: {lastRefreshTime.toLocaleTimeString("th-TH")}
            </span>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex gap-3">
          <button
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            onClick={onRefreshClick}
            title="รีเฟรชข้อมูล"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            รีเฟรช
          </button>
          <button
            className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            onClick={onCreateClick}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            เพิ่ม Job Order ใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
