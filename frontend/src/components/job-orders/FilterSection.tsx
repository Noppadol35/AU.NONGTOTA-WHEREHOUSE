interface FilterSectionProps {
  customer: string;
  consumers: string[];
  onCustomerChange: (customer: string) => void;
}

export default function FilterSection({
  customer,
  consumers,
  onCustomerChange,
}: FilterSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            กรองตามลูกค้า
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={customer}
            onChange={(e) => onCustomerChange(e.target.value)}
          >
            <option value="">ทุกลูกค้า</option>
            {consumers.map((c, index) => (
              <option key={`customer-${index}-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
