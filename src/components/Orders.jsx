import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Orders({ orders, onCancelOrder }) {
  const [activeTab, setActiveTab] = useState("All Orders"); // All, Open, Executed, Cancelled
  const [sortBy, setSortBy] = useState("dateNewest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  // Filter orders by status tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All Orders") return true;
    if (activeTab === "Open Orders") return order.status === "Open";
    if (activeTab === "Executed Orders") return order.status === "Executed";
    if (activeTab === "Cancelled Orders") return order.status === "Cancelled";
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "dateNewest":
        return new Date(b.date) - new Date(a.date);
      case "dateOldest":
        return new Date(a.date) - new Date(b.date);
      case "qtyHigh":
        return b.qty - a.qty;
      case "qtyLow":
        return a.qty - b.qty;
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Executed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "Open":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "Cancelled":
        return "bg-slate-50 text-slate-500 border border-slate-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-100";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
      </div>

      {/* Tabs list with filter buttons */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-0 gap-4">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 -mb-px scrollbar-none">
          {["All Orders", "Open Orders", "Executed Orders", "Cancelled Orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 pb-3 self-start md:self-auto shrink-0">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="dateNewest">Date (Newest)</option>
            <option value="dateOldest">Date (Oldest)</option>
            <option value="qtyHigh">Quantity (High to Low)</option>
            <option value="qtyLow">Quantity (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                <th className="pb-4 px-2 whitespace-nowrap">Order ID</th>
                <th className="pb-4 px-2 whitespace-nowrap">Stock</th>
                <th className="pb-4 px-2 whitespace-nowrap">Type</th>
                <th className="pb-4 px-2 whitespace-nowrap">Side</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Qty</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Price</th>
                <th className="pb-4 px-2 text-center whitespace-nowrap">Status</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Order Date</th>
                <th className="pb-4 px-2 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-semibold">
                    No orders found under this status.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                    <td className="py-4 px-2 text-slate-500 font-mono text-xs whitespace-nowrap">{order.orderId}</td>
                    
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0">
                          {order.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-slate-800 font-extrabold leading-tight">{order.symbol}</p>
                          <p className="text-[10px] text-slate-400 font-bold">NSE</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-2 text-slate-600 font-medium whitespace-nowrap">{order.type}</td>
                    
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.side === "Buy" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                      }`}>
                        {order.side}
                      </span>
                    </td>

                    <td className="py-4 px-2 text-right font-mono whitespace-nowrap">{order.qty}</td>
                    
                    <td className="py-4 px-2 text-right font-mono whitespace-nowrap">
                      {order.price ? formatINR(order.price) : "—"}
                    </td>

                    <td className="py-4 px-2 text-center whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold leading-tight ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4 px-2 text-right text-slate-400 text-xs font-medium whitespace-nowrap">{order.date}</td>

                    <td className="py-4 px-2 text-center whitespace-nowrap">
                      {order.status === "Open" ? (
                        <button
                          type="button"
                          onClick={() => onCancelOrder && onCancelOrder(order.orderId)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-colors cursor-pointer border border-rose-200/50"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-50 pt-6">
            <span className="text-xs text-slate-400 font-semibold">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedOrders.length)} of {sortedOrders.length} orders
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "border border-slate-100 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
