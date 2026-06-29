import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Wallet, Briefcase, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { createChart, AreaSeries } from "lightweight-charts";

export default function Dashboard({ 
  stocks, 
  portfolio, 
  cashBalance, 
  onStockSelect, 
  onOpenAiAnalysis 
}) {
  const chartContainerRef = useRef(null);

  // Helper: calculate total portfolio value dynamically
  const calculatePortfolioValue = () => {
    let holdingsValue = 0;
    portfolio.forEach(holding => {
      const livePrice = stocks[holding.symbol]?.price || holding.avgPrice;
      holdingsValue += holding.qty * livePrice;
    });
    return holdingsValue;
  };

  const totalInvested = portfolio.reduce((sum, item) => sum + (item.qty * item.avgPrice), 0);
  const currentHoldingsValue = calculatePortfolioValue();
  const totalPortfolioValue = currentHoldingsValue + cashBalance;
  
  // Calculate P&L
  const netProfit = currentHoldingsValue - totalInvested;
  const netProfitPercent = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

  // Render dynamic historical performance points
  const generatePerformancePoints = () => {
    let pts = [];
    let startVal = totalPortfolioValue * 0.94;
    let pointsCount = 30;

    // Seed-based stable randomized progression ending exactly at our current totalPortfolioValue
    for(let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      const randomDrift = Math.sin(i * 0.5) * (totalPortfolioValue * 0.02) + (Math.cos(i * 0.2) * (totalPortfolioValue * 0.015));
      const value = startVal + (totalPortfolioValue - startVal) * progress + randomDrift;
      pts.push({
        val: Number(value.toFixed(2))
      });
    }
    pts[pts.length - 1].val = Number(totalPortfolioValue.toFixed(2));
    return pts;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    container.innerHTML = "";

    const pts = generatePerformancePoints();
    const step = 86400; // Daily step
    const nowSeconds = Math.floor(Date.now() / 1000);
    const baseTimeStart = nowSeconds - (pts.length - 1) * step;

    const formattedData = pts.map((item, index) => {
      return {
        time: baseTimeStart + index * step,
        value: item.val
      };
    });

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
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        horzLine: {
          color: "rgba(99, 102, 241, 0.4)",
          labelBackgroundColor: "#6366f1",
        },
        vertLine: {
          color: "rgba(99, 102, 241, 0.4)",
          labelBackgroundColor: "#6366f1",
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
          return new Date(time * 1000).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
          });
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
      lineColor: "#6366f1",
      topColor: "rgba(99, 102, 241, 0.25)",
      bottomColor: "rgba(255, 255, 255, 0)",
      lineWidth: 2.5,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      }
    });

    areaSeries.setData(formattedData);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      chart.resize(width, height || 240);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [totalPortfolioValue]);

  // Format currency
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Arjun</h1>
          <p className="text-slate-400 font-semibold text-sm mt-1">Here's what's happening with your portfolio today.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Value Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Portfolio Value</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(totalPortfolioValue)}</h3>
            </div>
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-emerald-600 font-bold text-xs">
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>+2.45% Today</span>
          </div>
        </div>

        {/* Total Invested Value Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Invested</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(totalInvested)}</h3>
            </div>
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-slate-400 font-bold text-xs min-h-[16px]">
            <span>&nbsp;</span>
          </div>
        </div>

        {/* Overall P&L Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Overall P&L</span>
              <h3 className={`text-2xl font-black tracking-tight ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {netProfit >= 0 ? "+" : ""}{formatINR(netProfit)}
              </h3>
            </div>
            <span className={`p-2.5 rounded-xl ${netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 mt-4 font-bold text-xs ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {netProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{netProfit >= 0 ? "+" : ""}{netProfitPercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Available Cash Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Available Cash</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(cashBalance)}</h3>
            </div>
            <span className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-slate-400 font-bold text-xs min-h-[16px]">
            <span>&nbsp;</span>
          </div>
        </div>
      </div>

      {/* Performance Graph and Holdings Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Block */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 tracking-tight">Portfolio Performance</h3>
          </div>

          {/* TradingView Lightweight Chart Container */}
          <div ref={chartContainerRef} className="relative h-60 w-full mt-4" />

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase mt-4">
            <span>Starting Value</span>
            <span>Current Portfolio Value: {formatINR(totalPortfolioValue)}</span>
          </div>
        </div>

        {/* Mini Holdings Overview List */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 tracking-tight">Active Holdings</h3>
          </div>

          {/* Holdings List table block */}
          <div className="flex-grow space-y-4 overflow-y-auto max-h-64">
            {portfolio.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <span className="text-slate-300 text-3xl">📭</span>
                <p className="text-slate-400 font-semibold text-sm">No shares owned currently.</p>
              </div>
            ) : (
              portfolio.map((item, idx) => {
                const stockDetail = stocks[item.symbol];
                const livePrice = stockDetail?.price || item.avgPrice;
                const priceChange = livePrice - item.avgPrice;
                const changePercent = (priceChange / item.avgPrice) * 100;
                
                return (
                  <div 
                    key={idx}
                    onClick={() => onStockSelect(item.symbol)}
                    className="flex items-center justify-between p-3.5 border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10 rounded-xl transition-all cursor-pointer group"
                  >
                    <div>
                      <p className="font-extrabold text-sm text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.symbol}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.qty} Shares</p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-sm text-slate-800 tracking-tight">
                        {formatINR(livePrice)}
                      </p>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold mt-0.5 ${
                        priceChange >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {priceChange >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Total returns helper */}
          <div className="border-t border-slate-50 pt-4 mt-4 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Holdings Value</span>
            <span className="text-base font-black text-slate-800">{formatINR(currentHoldingsValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
