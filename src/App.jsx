import { useState, useEffect } from "react";
import { INITIAL_STOCKS, INITIAL_ORDERS } from "./data.js";
import { ALL_NSE_STOCKS, getNseStockTemplate } from "./nse_stocks.js";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import StockDetails from "./components/StockDetails.jsx";
import Portfolio from "./components/Portfolio.jsx";
import Orders from "./components/Orders.jsx";
import AiAnalysis from "./components/AiAnalysis.jsx";
import { 
  LineChart, 
  Search, 
  TrendingUp, 
  User, 
  Brain, 
  X, 
  LogOut, 
  Home, 
  Briefcase, 
  Clock, 
  Bell,
  ArrowRight,
  ChevronDown,
  Lock,
  RefreshCw
} from "lucide-react";

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : { name: "Arjun", email: "arjun@investtrade.com" };
  });

  // Navigation and Views State
  const [activeTab, setActiveTab] = useState("Dashboard"); // Dashboard, Search Stock, Portfolio, Orders
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null); // Ticker of active detail view
  const [aiSidebarSymbol, setAiSidebarSymbol] = useState(null); // Symbol loaded in AI panel
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Core Financial Database States (backed by localStorage)
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem("stocks");
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });
  const [cashBalance, setCashBalance] = useState(() => {
    const saved = localStorage.getItem("cashBalance");
    return saved ? parseFloat(saved) : 124560.50; // Mockup matching starting balance
  });
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem("portfolio");
    return saved ? JSON.parse(saved) : [
      { symbol: "RELIANCE", qty: 20, avgPrice: 2850.00 },
      { symbol: "TCS", qty: 15, avgPrice: 3410.20 },
      { symbol: "HDFCBANK", qty: 10, avgPrice: 1600.00 },
      { symbol: "INFY", qty: 25, avgPrice: 1380.00 }
    ];
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Search Stock state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Profile dropdown and security settings states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [changePassForm, setChangePassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changePassStatus, setChangePassStatus] = useState({
    error: "",
    success: ""
  });

  const handleResetData = () => {
    localStorage.removeItem("stocks");
    localStorage.removeItem("orders");
    localStorage.removeItem("cashBalance");
    localStorage.removeItem("portfolio");

    setStocks(INITIAL_STOCKS);
    setCashBalance(124560.50);
    setPortfolio([
      { symbol: "RELIANCE", qty: 20, avgPrice: 2850.00 },
      { symbol: "TCS", qty: 15, avgPrice: 3410.20 },
      { symbol: "HDFCBANK", qty: 10, avgPrice: 1600.00 },
      { symbol: "INFY", qty: 25, avgPrice: 1380.00 }
    ]);
    setOrders(INITIAL_ORDERS);
    setNotif("Portfolio holdings, orders, and cash balance have been reset to defaults!");
    setIsResetConfirmOpen(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setChangePassStatus({ error: "", success: "" });

    if (!changePassForm.currentPassword || !changePassForm.newPassword || !changePassForm.confirmPassword) {
      setChangePassStatus({ error: "All fields are required.", success: "" });
      return;
    }

    if (changePassForm.newPassword.length < 6) {
      setChangePassStatus({ error: "New password must be at least 6 characters.", success: "" });
      return;
    }

    if (changePassForm.newPassword !== changePassForm.confirmPassword) {
      setChangePassStatus({ error: "Passwords do not match.", success: "" });
      return;
    }

    setChangePassStatus({ error: "", success: "Password changed successfully!" });
    setChangePassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

    setTimeout(() => {
      setIsChangePasswordOpen(false);
      setChangePassStatus({ error: "", success: "" });
    }, 1500);
  };

  // System Notification alerts
  const [notif, setNotif] = useState(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("stocks", JSON.stringify(stocks));
    localStorage.setItem("cashBalance", cashBalance.toString());
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [isLoggedIn, user, stocks, cashBalance, portfolio, orders]);

  // Real-time market simulator: Tick prices slightly every 3 seconds to feel alive!
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => {
        const updatedStocks = {};
        let priceMatchedLimitOrders = [];

        Object.keys(prevStocks).forEach(symbol => {
          const s = prevStocks[symbol];
          // Standard Brownian Random Walk (+/- 0.25% tick fluctuation)
          const pct = (Math.random() - 0.5) * 0.005;
          const nextPrice = Math.max(10.0, Number((s.price * (1 + pct)).toFixed(2)));
          
          updatedStocks[symbol] = {
            ...s,
            price: nextPrice
          };

          // Check Limit Orders execution trigger
          orders.forEach((order) => {
            if (order.symbol === symbol && order.status === "Open" && order.type === "Limit") {
              // Buy triggers if market price is lower or equal to limit price
              if (order.side === "Buy" && nextPrice <= order.price) {
                priceMatchedLimitOrders.push(order);
              }
              // Sell triggers if market price is higher or equal to limit price
              if (order.side === "Sell" && nextPrice >= order.price) {
                priceMatchedLimitOrders.push(order);
              }
            }
          });
        });

        // Handle triggered Limit Orders execution
        if (priceMatchedLimitOrders.length > 0) {
          executeLimitOrders(priceMatchedLimitOrders, updatedStocks);
        }

        return updatedStocks;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoggedIn, orders, cashBalance, portfolio]);

  // Execute limit orders once they trigger
  const executeLimitOrders = (matchedOrders, liveStocks) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        const isMatched = matchedOrders.some(m => m.orderId === order.orderId);
        if (isMatched) {
          // Process execution
          const triggerPrice = liveStocks[order.symbol]?.price || order.price;
          const orderTotal = order.qty * triggerPrice;

          if (order.side === "Buy") {
            // Update available cash balance
            setCashBalance(cash => Math.max(0, cash - orderTotal));
            // Update portfolio holding
            setPortfolio(p => {
              const exists = p.find(item => item.symbol === order.symbol);
              if (exists) {
                const totalQty = exists.qty + order.qty;
                const avgPrice = ((exists.qty * exists.avgPrice) + (order.qty * triggerPrice)) / totalQty;
                return p.map(item => item.symbol === order.symbol ? { ...item, qty: totalQty, avgPrice } : item);
              } else {
                return [...p, { symbol: order.symbol, qty: order.qty, avgPrice: triggerPrice }];
              }
            });
          } else {
            // Sell: Update available cash balance
            setCashBalance(cash => cash + orderTotal);
            // Update portfolio holding
            setPortfolio(p => {
              return p.map(item => item.symbol === order.symbol ? { ...item, qty: Math.max(0, item.qty - order.qty) } : item)
                      .filter(item => item.qty > 0);
            });
          }

          // Trigger dynamic success alert
          triggerNotification(`Limit Order Triggered: Executed ${order.side} ${order.qty} shares of ${order.symbol} at ₹ ${triggerPrice}`);
          return { ...order, status: "Executed" };
        }
        return order;
      });
    });
  };

  const triggerNotification = (message) => {
    setNotif(message);
    setTimeout(() => setNotif(null), 5000);
  };

  // Placing an active trade order (triggers portfolio/cash balance updates)
  const handlePlaceOrder = (orderDetail) => {
    const { symbol, name, side, type, qty, price, totalAmount, date } = orderDetail;
    const generatedOrderId = "ORD" + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      orderId: generatedOrderId,
      symbol,
      name,
      type,
      side,
      qty,
      price,
      status: type === "Limit" ? "Open" : "Executed",
      date
    };

    setOrders(prev => [newOrder, ...prev]);

    // If "Market" or Limit executed immediately, update state
    if (type === "Market") {
      if (side === "Buy") {
        setCashBalance(prev => prev - totalAmount);
        setPortfolio(prev => {
          const exists = prev.find(item => item.symbol === symbol);
          if (exists) {
            const totalQty = exists.qty + qty;
            const avgPrice = ((exists.qty * exists.avgPrice) + (qty * price)) / totalQty;
            return prev.map(item => item.symbol === symbol ? { ...item, qty: totalQty, avgPrice } : item);
          } else {
            return [...prev, { symbol, qty, avgPrice: price }];
          }
        });
      } else {
        setCashBalance(prev => prev + totalAmount);
        setPortfolio(prev => {
          return prev.map(item => item.symbol === symbol ? { ...item, qty: item.qty - qty } : item)
                     .filter(item => item.qty > 0);
        });
      }
    }
    // Limit order locks nothing initially, waits for tick executor!
  };

  const handleCancelOrder = (orderId) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.orderId === orderId && order.status === "Open") {
          return { ...order, status: "Cancelled" };
        }
        return order;
      });
    });
    triggerNotification(`Order ${orderId} has been successfully cancelled.`);
  };

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  // All 75 NSE stocks loaded dynamically from our database
  const searchSuggestions = ALL_NSE_STOCKS.map(s => ({
    symbol: s.symbol,
    name: s.name,
    nse: `${s.symbol} • NSE`
  }));

  // Filter primary tracked stocks for search query
  const cleanQuery = searchQuery.trim().toUpperCase();
  let filteredSearchList = searchSuggestions.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  // Routing Handler for search clicks
  const handleStockClick = (symbol) => {
    const cleanSym = symbol.toUpperCase().trim();
    // Check if we have active configuration for this stock, else create a high-fidelity template
    if (!stocks[cleanSym]) {
      const template = getNseStockTemplate(cleanSym);
      setStocks(prev => ({
        ...prev,
        [cleanSym]: template
      }));
    }
    setSelectedStockSymbol(cleanSym);
    setSearchQuery("");
    setShowSearchSuggestions(false);
  };

  const handleOpenAiAnalysis = (symbol) => {
    const cleanSymbol = (typeof symbol === "string" && symbol) ? symbol : (selectedStockSymbol || "RELIANCE");
    setAiSidebarSymbol(cleanSymbol);
    setSelectedStockSymbol(cleanSymbol);
    setActiveTab("Analyse");
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Live Limit Order Triggers Alert Bar */}
      {notif && (
        <div className="bg-indigo-600 text-white font-bold text-center py-3.5 px-4 text-xs tracking-wide flex items-center justify-center gap-2 relative shadow-md z-40 transition-all">
          <Bell className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{notif}</span>
          <button onClick={() => setNotif(null)} className="absolute right-4 text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Professional Header Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Custom Stock App Brand Arrow logo */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => {
                setActiveTab("Dashboard");
                setSelectedStockSymbol(null);
              }}
              className="flex items-center gap-1.5 text-black font-black text-2xl tracking-wider uppercase cursor-pointer"
            >
              <span>PAPER</span>
            </div>

            {/* Nav Menu */}
            <nav className="hidden md:flex items-center gap-2">
              {[
                { name: "Dashboard", icon: Home },
                { name: "Search Stock", icon: Search },
                { name: "Portfolio", icon: Briefcase },
                { name: "Orders", icon: Clock },
                { name: "Analyse", icon: Brain }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name && selectedStockSymbol === null;
                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      setSelectedStockSymbol(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-indigo-50 text-indigo-600" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Top Bar utilities */}
          <div className="flex items-center gap-4">

            {/* Profile widget with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 pl-4 border-l border-slate-100 hover:opacity-85 transition-opacity cursor-pointer text-left focus:outline-none"
              >
                <div className="h-9 w-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo-600/10 select-none">
                  {user.name.substring(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block leading-none">
                  <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1">
                    <span>{user.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">Account Settings</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  {/* Backdrop to close */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-52 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{user.email}</p>
                    </div>

                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Password</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsResetConfirmOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                      <span>Reset Portfolio</span>
                    </button>

                    <div className="border-t border-slate-50 my-1"></div>

                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Layout Block */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 pt-10 pb-24 md:pb-10 relative">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Dynamic Content Switching router */}
          <div className="flex-grow min-w-0">
            {selectedStockSymbol ? (
              <StockDetails
                symbol={selectedStockSymbol}
                stocks={stocks}
                cashBalance={cashBalance}
                portfolio={portfolio}
                onBack={() => setSelectedStockSymbol(null)}
                onPlaceOrder={handlePlaceOrder}
                onOpenAiAnalysis={handleOpenAiAnalysis}
              />
            ) : (
              <>
                {/* 1. DASHBOARD VIEW */}
                {activeTab === "Dashboard" && (
                  <Dashboard
                    stocks={stocks}
                    portfolio={portfolio}
                    cashBalance={cashBalance}
                    onStockSelect={setSelectedStockSymbol}
                    onOpenAiAnalysis={handleOpenAiAnalysis}
                  />
                )}

                {/* 2. SEARCH STOCK VIEW (Matching screenshot 2) */}
                {activeTab === "Search Stock" && (
                  <div className="max-w-2xl mx-auto space-y-8 py-6 animate-fade-in">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Search Stock</h1>
                    </div>

                    <div className="relative">
                      {/* Search Bar Input */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                          <Search className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchSuggestions(true);
                          }}
                          onFocus={() => setShowSearchSuggestions(true)}
                          placeholder="Search Stock"
                          className="w-full pl-12 pr-11 py-4 border border-indigo-200 focus:border-indigo-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold text-base transition-all bg-white"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery("")} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Search Auto suggestions dropdown container */}
                      {showSearchSuggestions && searchQuery.trim() !== "" && (
                        <div className="absolute left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-50">
                          
                          <div className="px-5 py-3 bg-slate-50/50">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Stocks</span>
                          </div>

                          {filteredSearchList.length === 0 ? (
                            <div className="px-5 py-4 text-slate-400 text-sm font-semibold text-center">
                              No stocks match your query.
                            </div>
                          ) : (
                            filteredSearchList.map((item, i) => (
                              <div
                                key={i}
                                onClick={() => handleStockClick(item.symbol)}
                                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer group transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-sm">
                                    <Search className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">
                                      {item.symbol} • NSE
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-0.5" />
                              </div>
                            ))
                          )}

                          <div className="h-3 bg-white"></div>



                        </div>
                      )}
                    </div>

                    {/* Quick navigation to sample listings */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
                      <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Popular Market Equities</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(stocks).slice(0, 4).map(sym => (
                          <button
                            key={sym}
                            onClick={() => handleStockClick(sym)}
                            className="p-4 border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/5 rounded-xl font-bold text-left text-slate-700 transition-all cursor-pointer group"
                          >
                            <span className="text-xs text-slate-400 font-extrabold block">NSE</span>
                            <span className="text-base text-slate-800 font-black tracking-tight mt-0.5 block group-hover:text-indigo-600 transition-colors">
                              {sym}
                            </span>
                            <span className="text-xs text-slate-500 block mt-1">
                              {formatINR(stocks[sym].price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PORTFOLIO VIEW */}
                {activeTab === "Portfolio" && (
                  <Portfolio
                    portfolio={portfolio}
                    stocks={stocks}
                    onStockSelect={setSelectedStockSymbol}
                  />
                )}

                {/* 4. ORDERS VIEW */}
                {activeTab === "Orders" && (
                  <Orders orders={orders} onCancelOrder={handleCancelOrder} />
                )}

                {/* 5. AI ANALYSIS VIEW */}
                {activeTab === "Analyse" && (
                  <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <AiAnalysis 
                      activeStockSymbol={selectedStockSymbol} 
                      onClose={() => {
                        setSelectedStockSymbol(null);
                        setActiveTab("Dashboard");
                      }} 
                    />
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">Change Password</h3>
              </div>
              <button 
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={changePassForm.currentPassword}
                  onChange={(e) => setChangePassForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={changePassForm.newPassword}
                  onChange={(e) => setChangePassForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changePassForm.confirmPassword}
                  onChange={(e) => setChangePassForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold"
                />
              </div>

              {changePassStatus.error && (
                <div className="bg-rose-50 text-rose-600 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-rose-100">
                  {changePassStatus.error}
                </div>
              )}

              {changePassStatus.success && (
                <div className="bg-emerald-50 text-emerald-600 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-emerald-100 animate-pulse">
                  {changePassStatus.success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md shadow-indigo-600/15"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Portfolio Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">Reset Portfolio</h3>
              </div>
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                Are you sure you want to reset all portfolio holdings, order history, and cash balance to defaults? This action is permanent and cannot be undone.
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md shadow-amber-600/15"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 py-2 z-40 flex justify-around items-center">
        {[
          { name: "Dashboard", icon: Home },
          { name: "Search Stock", icon: Search },
          { name: "Portfolio", icon: Briefcase },
          { name: "Orders", icon: Clock },
          { name: "Analyse", icon: Brain }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name && selectedStockSymbol === null;
          return (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSelectedStockSymbol(null);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? "text-indigo-600 font-extrabold" 
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span className="text-[10px] tracking-tight">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
