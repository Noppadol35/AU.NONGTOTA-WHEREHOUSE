export default function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
      <div className="text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg">ไม่พบ Job Orders</p>
        <p className="text-gray-400">
          ลองสร้าง Job Order ใหม่หรือเปลี่ยนตัวกรอง
        </p>
      </div>
    </div>
  );
}
