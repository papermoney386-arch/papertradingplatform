import { useState, useEffect } from "react";
import { Brain, Search, CheckCircle, AlertTriangle, Loader, X } from "lucide-react";
import ReactSpeedometer from "react-d3-speedometer";

export default function AiAnalysis({ activeStockSymbol, onClose }) {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Auto trigger analysis only when activeStockSymbol is explicitly selected
  useEffect(() => {
    if (activeStockSymbol) {
      setTicker(activeStockSymbol);
      fetchAnalysis(activeStockSymbol);
    } else {
      setTicker("");
      setAnalysis(null);
    }
  }, [activeStockSymbol]);

  const fetchAnalysis = async (symbolToFetch) => {
    if (!symbolToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stock-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbolToFetch }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === "SYMBOL_NOT_FOUND_NSE") {
          throw new Error("NOT_FOUND_NSE:" + (errorData.message || symbolToFetch));
        }
        throw new Error(errorData.message || errorData.error || "Failed to fetch AI analysis.");
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      fetchAnalysis(ticker.toUpperCase().trim());
    }
  };

  // Determine meter color based on score
  const getMeterColor = (score) => {
    if (score >= 80) return "#10b981"; // Emerald green
    if (score >= 60) return "#10b981"; // Green
    if (score >= 40) return "#f59e0b"; // Amber yellow
    return "#ef4444"; // Red
  };

  const scoreValue = analysis?.score || 50;
  const ratingText = analysis?.rating || "Hold";
  const meterColor = getMeterColor(scoreValue);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden w-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <div className="flex items-center gap-2 text-indigo-600">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-lg text-slate-800">AI Analysis</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input for Ticker */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter stock name to analyse"
            className="w-full pl-4 pr-11 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-sm transition-all bg-white"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Main Analysis Body */}
      <div className="flex-grow overflow-y-auto p-6 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <p className="text-slate-600 text-sm font-bold tracking-tight">Analyzing market data...</p>
            <p className="text-slate-400 text-xs font-semibold">Compiling real-time report</p>
          </div>
        ) : error ? (
          error.startsWith("NOT_FOUND_NSE:") ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 max-w-xs mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-500 mb-2.5" />
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                "{error.substring(14)}" is not a recognized company name or ticker symbol listed on the National Stock Exchange of India.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm font-medium space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Error Loading Analysis</span>
              </div>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )
        ) : analysis ? (
          analysis.isListedOnNse === false ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 max-w-xs mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-500 mb-2.5" />
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                {analysis.nseMessage || `"${analysis.symbol}" is not a recognized company name or ticker symbol listed on the National Stock Exchange of India.`}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Warning header for mocks */}
              {analysis.warning && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-xl font-medium">
                  {analysis.warning}
                </div>
              )}

              {/* Target Asset Detail */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 tracking-tight">{analysis.symbol}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{analysis.name}</p>
                </div>
                <span className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                  Analysed today
                </span>
              </div>

              {/* Strengths Section */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Strengths</h4>
                <ul className="space-y-3">
                  {analysis.strengths?.map((str, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm font-medium leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Section */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Weaknesses</h4>
                <ul className="space-y-3">
                  {analysis.weaknesses?.map((weak, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm font-medium leading-relaxed">{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Investment Meter (Gauge) */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Investment Meter</h4>
                <div className="bg-slate-50/50 border border-slate-100/50 rounded-2xl p-6 flex flex-col items-center">
                  
                  {/* React Speedometer component */}
                  <div className="w-full flex justify-center items-center h-[160px] overflow-hidden">
                    <ReactSpeedometer
                      value={scoreValue}
                      minValue={0}
                      maxValue={100}
                      segments={5}
                      needleColor="#4f46e5"
                      startColor="#ef4444"
                      endColor="#10b981"
                      textColor="#475569"
                      width={240}
                      height={160}
                      ringWidth={18}
                      needleTransitionDuration={800}
                      currentValueText={`Score: ${scoreValue} / 100`}
                    />
                  </div>

                  {/* Rating Badge */}
                  <div className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs border inline-flex items-center gap-1.5"
                    style={{ 
                      backgroundColor: `${meterColor}10`, 
                      color: meterColor,
                      borderColor: `${meterColor}30`
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: meterColor }}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: meterColor }}></span>
                    </span>
                    <span>{ratingText.toUpperCase()}</span>
                  </div>

                  {/* AI Summary statement */}
                  <p className="text-center text-slate-500 text-xs font-semibold leading-relaxed mt-4">
                    {analysis.summary}
                  </p>
                </div>
              </div>

            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-sm mx-auto">
            <p className="text-slate-500 text-sm font-semibold">
              Enter any NSE stock ticker above to start analysis.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
