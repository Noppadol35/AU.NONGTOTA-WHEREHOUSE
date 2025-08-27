export default function ProductDetail({ id }: { id: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-4">
        <h1 className="text-xl font-semibold">Product {id}</h1>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="w-full h-48 bg-gray-100 rounded" />
          </div>
          <div className="text-sm space-y-1">
            <p>Supplier: Default Supplier</p>
            <p>Cost: 10</p>
            <p>Price: 20</p>
            <p>Reorder level: 1</p>
          </div>
        </div>
      </div>
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Stock Movements</h2>
        <ul className="text-sm list-disc pl-5">
          <li>+20 Received (PO-001)</li>
          <li>-5 Used (JOB-001)</li>
        </ul>
      </div>
    </div>
  );
}


