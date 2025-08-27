"use client";

type IssuedItem = {
  productId: number;
  qtyIssued: number;
  remainingStock: number;
  product?: {
    sku: string;
    name: string;
  } | null;
};

type Props = {
  jobNumber: string;
  items: IssuedItem[];
};

export default function IssueSummary({ jobNumber, items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gray-100 border rounded p-4 text-sm">
      <h3 className="font-semibold text-gray-800 mb-2">
        สรุปการเบิกล่าสุดสำหรับ Job #{jobNumber}
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-1">SKU</th>
            <th className="py-1">ชื่อสินค้า</th>
            <th className="py-1">จำนวนที่เบิก</th>
            <th className="py-1">คงเหลือหลังเบิก</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId} className="border-b last:border-b-0">
              <td className="py-1">{item.product?.sku || '-'}</td>
              <td className="py-1">{item.product?.name || '-'}</td>
              <td className="py-1">{item.qtyIssued}</td>
              <td className="py-1">{item.remainingStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
