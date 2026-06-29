import { useState, useEffect, useRef } from "react";
import { ArrowLeft, AlertCircle, CheckCircle, Brain } from "lucide-react";
import { generateChartData } from "../data.js";
import { createChart, AreaSeries } from "lightweight-charts";

export default function StockDetails({ 
  symbol, 
  stocks, 
  cashBalance, 
  portfolio, 
  onBack, 
  onPlaceOrder, 
  onOpenAiAnalysis 
}) {
  const stock = stocks[symbol];
  const [chartRange, setChartRange] = useState("1D");
  const [tradeSide, setTradeSide] = useState("Buy"); // Buy, Sell
  const [priceType, setPriceType] = useState("Market"); // Market, Limit
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [notif, setNotif] = useState(null);

  // Set initial limit price when symbol changes
  useEffect(() => {
    if (stock) {
      setLimitPrice(stock.price.toFixed(2));
    }
  }, [symbol]);

  if (!stock) {
    return (
      <div className="text-center py-20 bg-white border rounded-2xl">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="mt-2 text-slate-500 font-semibold">Stock not found</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">Back</button>
      </div>
    );
  }

  const chartContainerRef = useRef(null);
  const priceChange = stock.price - stock.prevClose;
  const changePercent = (priceChange / stock.prevClose) * 100;

  // Generate chart data based on active range
  const chartData = generateChartData(symbol, chartRange, stock.price);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    
    // Clear any previous chart elements (safety fallback)
    container.innerHTML = "";

    const step = chartRange === "1D" ? 300 : 86400;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const baseTimeStart = nowSeconds - (chartData.length - 1) * step;

    const formattedData = chartData.map((item, index) => {
      return {
        time: baseTimeStart + index * step,
        value: item.price
      };
    });

    const isPositive = priceChange >= 0;

    const chart = createChart(container, {
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#64748b",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#f8fafc" },
        horzLines: { color: "#f8fafc" },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: "#64748b",
      },
      timeScale: {
        borderVisible: false,
        timeVisible: chartRange === "1D",
        secondsVisible: false,
      },
      crosshair: {
        horzLine: {
          color: isPositive ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)",
          labelBackgroundColor: isPositive ? "#10b981" : "#f43f5e",
        },
        vertLine: {
          color: isPositive ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)",
          labelBackgroundColor: isPositive ? "#10b981" : "#f43f5e",
        }
      },
      localization: {
        priceFormatter: (price) => {
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
          }).format(price);
        },
        timeFormatter: (time) => {
          const idx = Math.round((time - baseTimeStart) / step);
          if (chartData[idx]) {
            return chartData[idx].label;
          }
          return new Date(time * 1000).toLocaleDateString();
        }
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseDrag: true,
        touchDrag: true,
      }
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: isPositive ? "#10b981" : "#f43f5e",
      topColor: isPositive ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)",
      bottomColor: "rgba(255, 255, 255, 0)",
      lineWidth: 2.5,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      }
    });

    areaSeries.setData(formattedData);

    // Set interactive fit content
    chart.timeScale().fitContent();

    // ResizeObserver according to guidelines
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      chart.resize(width, height || 256);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, chartRange, stock.price, priceChange]);

  // Calculate order metrics
  const parsedQty = parseInt(quantity) || 0;
  const executionPrice = priceType === "Market" ? stock.price : (parseFloat(limitPrice) || 0);
  const totalCostBeforeFees = parsedQty * executionPrice;
  
  // Simulated fee percentages
  const brokerageRate = 0.0005; // 0.05%
  const sttRate = 0.001; // 0.1% STT
  const brokerage = totalCostBeforeFees * brokerageRate;
  const taxes = totalCostBeforeFees * sttRate;
  const totalAmount = tradeSide === "Buy" 
    ? totalCostBeforeFees + brokerage + taxes 
    : totalCostBeforeFees - brokerage - taxes;

  const currentHolding = portfolio.find(p => p.symbol === symbol) || { qty: 0 };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (parsedQty <= 0) {
      triggerNotification("error", "Please enter a valid quantity.");
      return;
    }

    if (tradeSide === "Buy") {
      if (totalAmount > cashBalance) {
        triggerNotification("error", `Insufficient cash balance. Required: ${formatINR(totalAmount)}`);
        return;
      }
    } else {
      if (parsedQty > currentHolding.qty) {
        triggerNotification("error", `Insufficient shares. You only own ${currentHolding.qty} shares of ${symbol}.`);
        return;
      }
    }

    // Place simulated order
    onPlaceOrder({
      symbol,
      name: stock.name,
      side: tradeSide,
      type: priceType,
      qty: parsedQty,
      price: executionPrice,
      totalAmount,
      date: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    });

    triggerNotification("success", `Order placed successfully! ${tradeSide} ${parsedQty} shares of ${symbol}.`);
    setQuantity("");
  };

  const triggerNotification = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 4000);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };


  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Dynamic Slide Toasts */}
      {notif && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg animate-slide-in ${
          notif.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-rose-50 border-rose-100 text-rose-800"
        }`}>
          {notif.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-sm font-bold">{notif.message}</span>
        </div>
      )}

      {/* Header breadcrumb & back option */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 hover:text-indigo-500 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Search</span>
      </button>

      {/* Main Stock layout block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Chart and Key Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-100 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{stock.name}</h1>
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {stock.cap}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {stock.symbol} • NSE • Sector: {stock.sector}
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-slate-800 leading-tight">
                {formatINR(stock.price)}
              </p>
              <span className={`inline-flex items-center gap-0.5 text-sm font-extrabold mt-1 ${
                priceChange >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}>
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChange >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
                <span className="text-[10px] text-slate-400 font-bold ml-1">Today</span>
              </span>
            </div>
          </div>

          {/* Interactive Chart Canvas Block */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
            {/* TradingView Lightweight Chart Container */}
            <div ref={chartContainerRef} className="relative h-64 w-full" />

            <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase mt-4">
              <span>Market Start</span>
              <span>Prev. Close: {formatINR(stock.prevClose)}</span>
            </div>
          </div>

          {/* Key Stats Block */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-lg text-slate-800 tracking-tight mb-6">Key Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: "Market Cap", value: stock.marketCap },
                { label: "P/E Ratio", value: stock.peRatio },
                { label: "Dividend Yield", value: stock.divYield },
                { label: "52 Week High", value: formatINR(stock.high52) },
                { label: "52 Week Low", value: formatINR(stock.low52) },
                { label: "Sector", value: stock.sector }
              ].map((item, i) => (
                <div key={i} className="border-b border-slate-50 pb-3">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{item.label}</p>
                  <p className="text-base font-black text-slate-800 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Active Trading Execution Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          
          {/* Buy/Sell Tabs Selector */}
          <div className="flex border border-slate-100 p-1 rounded-xl bg-slate-50">
            {["Buy", "Sell"].map((side) => (
              <button
                key={side}
                onClick={() => {
                  setTradeSide(side);
                  setQuantity("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-extrabold transition-all cursor-pointer ${
                  tradeSide === side
                    ? side === "Buy"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-rose-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-6">
            
            {/* Price Selection */}
            <div className="flex border border-slate-100 p-1 rounded-xl bg-slate-50/50">
              {["Market", "Limit"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPriceType(type);
                    if (type === "Limit" && stock) {
                      setLimitPrice(stock.price.toFixed(2));
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${
                    priceType === type
                      ? "bg-white text-slate-800 shadow-xs border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Available balances info */}
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Available Balance</span>
              <span className="text-slate-700">
                {tradeSide === "Buy" 
                  ? formatINR(cashBalance) 
                  : `${currentHolding.qty} shares owned`
                }
              </span>
            </div>

            {/* Limit Price Input if type matches Limit */}
            {priceType === "Limit" && (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-400 uppercase">Limit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-extrabold"
                />
              </div>
            )}

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-400 uppercase">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-extrabold"
              />
            </div>

            {/* Order Summary section */}
            <div className="border-t border-slate-50 pt-4 space-y-3 text-xs font-bold">
              <p className="text-slate-400 uppercase text-[10px] tracking-wide mb-1">Order Summary</p>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Total Quantity</span>
                <span className="text-slate-700">{parsedQty}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Price</span>
                <span className="text-slate-700">{formatINR(executionPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Brokerage (0.05% est.)</span>
                <span className="text-slate-700">{formatINR(brokerage)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">STT/Taxes (0.1% est.)</span>
                <span className="text-slate-700">{formatINR(taxes)}</span>
              </div>

              <div className="border-t border-slate-50 pt-3 flex justify-between text-sm font-black">
                <span className="text-slate-800">Total Amount</span>
                <span className="text-indigo-600">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* Action Execution Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide text-white cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                tradeSide === "Buy"
                  ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
              }`}
            >
              Place {tradeSide} Order
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
