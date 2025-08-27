"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { PackageSearch, PlusCircle, Trash2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  sellPrice: number;
};

type ItemToIssue = {
  productId: number;
  qty: number;
  product: Product;
};

type Props = {
  jobOrderId: number | null;
  onIssueItems: (items: ItemToIssue[]) => Promise<void>;
  loading: boolean;
  onRefreshJobOrder: () => void; // Add callback to refresh job order
};

export default function ProductSearch({
  jobOrderId,
  onIssueItems,
  loading,
  onRefreshJobOrder,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [itemsToIssue, setItemsToIssue] = useState<ItemToIssue[]>([]);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  async function fetchProducts(term: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?search=${encodeURIComponent(term)}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      // Filter products that match the search term
      const filteredProducts = (data.items || []).filter((product: Product) => {
        const searchLower = term.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower)
        );
      });

      setSearchResults(filteredProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setSearchResults([]);
    }
  }

  // Simple debounced search handler
  const debouncedSearch = useCallback(
    (term: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (term.length > 0) {
          fetchProducts(term);
        } else {
          setSearchResults([]);
        }
      }, 300);
    },
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handleAddProduct(product: Product) {
    const existing = itemsToIssue.find((item) => item.productId === product.id);
    if (existing) {
      setItemsToIssue((prev) =>
        prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setItemsToIssue((prev) => [
        ...prev,
        { productId: product.id, qty: 1, product },
      ]);
    }
    // ไม่ต้องล้าง searchTerm และ searchResults ออก
    // setSearchTerm("");
    // setSearchResults([]);
  }

  function handleRemoveProduct(productId: number) {
    setItemsToIssue((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  }

  function handleQtyChange(productId: number, newQty: number) {
    if (newQty <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setItemsToIssue((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, qty: newQty } : item
      )
    );
  }

  async function handleIssueItems() {
    if (itemsToIssue.length === 0) return;

    try {
      // แสดง Loading overlay
      setShowLoadingOverlay(true);
      
      // เริ่ม timer 3 วินาที
      const loadingTimer = setTimeout(() => {
        setShowLoadingOverlay(false);
      }, 3000);

      await onIssueItems(itemsToIssue);

      // Clear form after successful issue
      setItemsToIssue([]);
      setSearchTerm("");
      setSearchResults([]);

      // Refresh job order details to show updated history
      onRefreshJobOrder();
      
      // Clear timer if function completes before 3 seconds
      clearTimeout(loadingTimer);
      setShowLoadingOverlay(false);
    } catch (err) {
      console.error("Failed to issue items:", err);
      // Don't clear form on error, let user retry
      // Error will be shown by the parent component's AlertBox
      
      // Clear loading overlay on error
      setShowLoadingOverlay(false);
    }
  }

  if (!jobOrderId) return null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <PackageSearch />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">ค้นหาและเบิกสินค้า</h2>
          <p className="text-sm text-gray-600 mt-1">ค้นหาสินค้าและทำการเบิกออกจากคลัง</p>
        </div>
      </div>

      {!jobOrderId ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">กรุณาเลือกงานก่อน</p>
          <p className="text-gray-400 text-xs">เลือกงานที่ต้องการเบิกสินค้าจากด้านบน</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ค้นหาสินค้า
            </label>
            <div className="relative text-gray-700">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="พิมพ์ชื่อสินค้าหรือ SKU..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">ผลการค้นหา ({searchResults.length})</h3>
                <button
                  onClick={() => setSearchResults([])}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="ปิดผลการค้นหา"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((product) => {
                  // ตรวจสอบว่าสินค้านี้ถูกเพิ่มไปแล้วหรือไม่
                  const isAlreadyAdded = itemsToIssue.some(item => item.productId === product.id);
                  
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        isAlreadyAdded ? 'bg-green-50 border-green-200' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">SKU: {product.sku}</span>
                          <span>คงเหลือ: {product.stockQuantity} ชิ้น</span>
                          <span className="font-medium text-green-600">฿{product.sellPrice.toLocaleString()}</span>
                          {isAlreadyAdded && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              เพิ่มแล้ว
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        disabled={isAlreadyAdded}
                        className={`ml-4 p-2 rounded-lg transition-colors ${
                          isAlreadyAdded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={isAlreadyAdded ? "เพิ่มแล้ว" : "เพิ่มสินค้า"}
                      >
                        <PlusCircle size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items to Issue */}
          {itemsToIssue.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                <h3 className="text-sm font-medium text-blue-700">สินค้าที่จะเบิก ({itemsToIssue.length})</h3>
              </div>
              <div className="p-4 space-y-3">
                {itemsToIssue.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="font-mono bg-white px-2 py-1 rounded text-xs">SKU: {item.product.sku}</span>
                        <span>คงเหลือ: {item.product.stockQuantity} ชิ้น</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <input
                        type="number"
                        min="1"
                        max={item.product.stockQuantity}
                        value={item.qty}
                        onChange={(e) => handleQtyChange(item.productId, parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveProduct(item.productId)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="ลบสินค้า"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Issue Button */}
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleIssueItems}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      กำลังประมวลผล...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      เบิกสินค้า ({itemsToIssue.reduce((sum, item) => sum + item.qty, 0)} ชิ้น)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchTerm && searchResults.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">ไม่พบสินค้าที่ค้นหา</p>
              <p className="text-gray-400 text-xs">ลองเปลี่ยนคำค้นหาหรือตรวจสอบ SKU</p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">กำลังเบิกสินค้า...</h3>
            <p className="text-gray-600 text-center">
              กรุณารอสักครู่ ระบบกำลังประมวลผล<br />
              การเบิกสินค้าจำนวน {itemsToIssue.reduce((sum, item) => sum + item.qty, 0)} ชิ้น
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
