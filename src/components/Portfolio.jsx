import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function Portfolio({ portfolio, stocks, onStockSelect }) {
  const [sortBy, setSortBy] = useState("currentValueHighToLow");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Aggregate stats
  const totalInvested = portfolio.reduce((sum, item) => sum + (item.qty * item.avgPrice), 0);
  const totalCurrentValue = portfolio.reduce((sum, item) => {
    const livePrice = stocks[item.symbol]?.price || item.avgPrice;
    return sum + (item.qty * livePrice);
  }, 0);

  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  // Let's assume average 1D portfolio returns based on individual stock ticks
  const total1DChange = portfolio.reduce((sum, item) => {
    const stock = stocks[item.symbol];
    if (!stock) return sum;
    const priceChange = stock.price - stock.prevClose;
    return sum + (item.qty * priceChange);
  }, 0);
  const total1DPercent = totalCurrentValue > 0 ? (total1DChange / (totalCurrentValue - total1DChange)) * 100 : 0;

  // Format currency
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  // Compile detailed holdings array with calculated returns
  const detailedHoldings = portfolio.map(item => {
    const stock = stocks[item.symbol] || { price: item.avgPrice, prevClose: item.avgPrice, name: item.symbol };
    const livePrice = stock.price;
    const invested = item.qty * item.avgPrice;
    const currentVal = item.qty * livePrice;
    const returns = currentVal - invested;
    const returnsPercent = invested > 0 ? (returns / invested) * 100 : 0;
    
    const oneDayChange = livePrice - stock.prevClose;
    const oneDayPercent = (oneDayChange / stock.prevClose) * 100;

    return {
      ...item,
      name: stock.name,
      livePrice,
      invested,
      currentVal,
      returns,
      returnsPercent,
      oneDayPercent
    };
  });

  // Sort logic
  const sortedHoldings = [...detailedHoldings].sort((a, b) => {
    switch(sortBy) {
      case "currentValueHighToLow":
        return b.currentVal - a.currentVal;
      case "currentValueLowToHigh":
        return a.currentVal - b.currentVal;
      case "pnlHighToLow":
        return b.returns - a.returns;
      case "pnlLowToHigh":
        return a.returns - b.returns;
      case "alphabetical":
        return a.symbol.localeCompare(b.symbol);
      default:
        return b.currentVal - a.currentVal;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedHoldings.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHoldings = sortedHoldings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Portfolio Headline Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio</h1>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Current Value</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatINR(totalCurrentValue)}</h3>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Invested Value</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatINR(totalInvested)}</h3>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Returns</p>
          <div className="flex items-center gap-1.5 mt-1">
            <h3 className={`text-2xl font-black tracking-tight ${totalReturns >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatINR(totalReturns)}
            </h3>
            <span className={`inline-flex items-center text-xs font-bold gap-0.5 ${totalReturns >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ({totalReturns >= 0 ? "+" : ""}{totalReturnsPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">1D Returns</p>
          <div className="flex items-center gap-1.5 mt-1">
            <h3 className={`text-2xl font-black tracking-tight ${total1DChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatINR(total1DChange)}
            </h3>
            <span className={`inline-flex items-center text-xs font-bold gap-0.5 ${total1DChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ({total1DChange >= 0 ? "+" : ""}{total1DPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

      </div>

      {/* Holdings List block with Filters & Sorters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-lg text-slate-800 tracking-tight">Holdings ({sortedHoldings.length})</h2>
          
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="currentValueHighToLow">Current Value (High to Low)</option>
              <option value="currentValueLowToHigh">Current Value (Low to High)</option>
              <option value="pnlHighToLow">Returns / Profit (High to Low)</option>
              <option value="pnlLowToHigh">Returns / Profit (Low to High)</option>
              <option value="alphabetical">Symbol (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                <th className="pb-4 px-2 whitespace-nowrap">Stock</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Invested Value</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Current Value</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Returns</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">Returns %</th>
                <th className="pb-4 px-2 text-right whitespace-nowrap">1D Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-800">
              {paginatedHoldings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold">
                    No active stock investments. Head over to Search to buy some stocks!
                  </td>
                </tr>
              ) : (
                paginatedHoldings.map((item, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => onStockSelect(item.symbol)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Round Stock visual icon */}
                        <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0">
                          {item.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-slate-800 font-extrabold leading-tight">{item.symbol}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.qty} Shares</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-2 text-right whitespace-nowrap">
                      <p className="text-slate-700 font-semibold">{formatINR(item.invested)}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Avg. {formatINR(item.avgPrice)}</p>
                    </td>

                    <td className="py-4 px-2 text-right whitespace-nowrap">
                      <p className="text-slate-800 font-extrabold">{formatINR(item.currentVal)}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">LTP {formatINR(item.livePrice)}</p>
                    </td>

                    <td className={`py-4 px-2 text-right whitespace-nowrap ${item.returns >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.returns >= 0 ? "+" : ""}{formatINR(item.returns)}
                    </td>

                    <td className={`py-4 px-2 text-right whitespace-nowrap ${item.returnsPercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.returnsPercent >= 0 ? "+" : ""}{item.returnsPercent.toFixed(2)}%
                    </td>

                    <td className={`py-4 px-2 text-right whitespace-nowrap ${item.oneDayPercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      <span className="inline-flex items-center gap-0.5">
                        {item.oneDayPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {item.oneDayPercent >= 0 ? "+" : ""}{item.oneDayPercent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls block */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-50 pt-6">
            <span className="text-xs text-slate-400 font-semibold">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedHoldings.length)} of {sortedHoldings.length} holdings
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
