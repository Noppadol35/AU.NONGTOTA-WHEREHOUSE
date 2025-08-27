export default function LoadingState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
}
