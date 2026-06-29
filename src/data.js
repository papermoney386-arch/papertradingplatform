// Stock market initial configuration data
export const INITIAL_STOCKS = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    sector: "Energy",
    cap: "Large Cap",
    price: 2962.80,
    prevClose: 2874.60,
    marketCap: "₹ 19,94,018 Cr",
    peRatio: "25.24",
    divYield: "0.34%",
    high52: 3052.00,
    low52: 2210.00,
    description: "Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles."
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    sector: "Information Technology",
    cap: "Large Cap",
    price: 3456.70,
    prevClose: 3410.20,
    marketCap: "₹ 12,65,410 Cr",
    peRatio: "28.15",
    divYield: "1.15%",
    high52: 4250.00,
    low52: 3120.00,
    description: "Tata Consultancy Services Limited is an Indian multinational information technology services and consulting company headquartered in Mumbai. It is a part of the Tata Group and operates in 150 locations across 46 countries."
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    sector: "Banking",
    cap: "Large Cap",
    price: 1731.55,
    prevClose: 1718.40,
    marketCap: "₹ 13,10,620 Cr",
    peRatio: "19.80",
    divYield: "1.05%",
    high52: 1790.00,
    low52: 1360.00,
    description: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets and the world's tenth-largest bank by market capitalization."
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Ltd.",
    sector: "Information Technology",
    cap: "Large Cap",
    price: 1412.30,
    prevClose: 1425.10,
    marketCap: "₹ 5,85,420 Cr",
    peRatio: "24.60",
    divYield: "2.30%",
    high52: 1760.00,
    low52: 1280.00,
    description: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services. The company was founded in Pune and is headquartered in Bangalore."
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    sector: "Banking",
    cap: "Large Cap",
    price: 1080.00,
    prevClose: 1092.50,
    marketCap: "₹ 7,55,240 Cr",
    peRatio: "17.40",
    divYield: "0.95%",
    high52: 1150.00,
    low52: 840.00,
    description: "ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai. It offers a wide range of banking products and financial services for corporate and retail customers."
  },
  LT: {
    symbol: "LT",
    name: "Larsen & Toubro Ltd.",
    sector: "Engineering",
    cap: "Large Cap",
    price: 3450.00,
    prevClose: 3422.00,
    marketCap: "₹ 4,85,600 Cr",
    peRatio: "35.10",
    divYield: "0.85%",
    high52: 3890.00,
    low52: 2150.00,
    description: "Larsen & Toubro Limited, commonly known as L&T, is an Indian multinational conglomerate company, with business interests in engineering, construction, manufacturing, technology, information technology and financial services."
  },
  ITC: {
    symbol: "ITC",
    name: "ITC Ltd.",
    sector: "FMCG",
    cap: "Large Cap",
    price: 480.00,
    prevClose: 478.20,
    marketCap: "₹ 5,95,210 Cr",
    peRatio: "26.80",
    divYield: "3.75%",
    high52: 510.00,
    low52: 390.00,
    description: "ITC Limited is an Indian conglomerate company headquartered in Kolkata. ITC has a diversified presence across industries such as FMCG, hotels, software, packaging, paperboards, specialty papers and agribusiness."
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India Ltd.",
    sector: "Banking",
    cap: "Large Cap",
    price: 810.00,
    prevClose: 818.90,
    marketCap: "₹ 7,20,100 Cr",
    peRatio: "9.50",
    divYield: "1.65%",
    high52: 890.00,
    low52: 510.00,
    description: "State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai. SBI is the largest bank in India with a 23% asset market share."
  }
};

// Generates simulated historical data for different stock chart intervals
export function generateChartData(symbol, interval, basePrice) {
  let dataPoints = 50;
  let volatility = 0.008; // 0.8% standard variance per step
  
  switch(interval) {
    case "1D":
      dataPoints = 40;
      volatility = 0.002;
      break;
    case "1W":
      dataPoints = 35;
      volatility = 0.005;
      break;
    case "1M":
      dataPoints = 30;
      volatility = 0.01;
      break;
    case "3M":
      dataPoints = 45;
      volatility = 0.015;
      break;
    case "6M":
      dataPoints = 60;
      volatility = 0.02;
      break;
    case "1Y":
      dataPoints = 80;
      volatility = 0.025;
      break;
    case "5Y":
      dataPoints = 120;
      volatility = 0.04;
      break;
    case "Max":
      dataPoints = 150;
      volatility = 0.06;
      break;
    default:
      dataPoints = 50;
  }

  const result = [];
  let currentPrice = basePrice * 0.95; // Start a bit lower
  
  const timeLabels = generateTimeLabels(interval, dataPoints);

  for (let i = 0; i < dataPoints; i++) {
    const changePercent = (Math.random() - 0.48) * volatility; // slight upward drift
    currentPrice = currentPrice * (1 + changePercent);
    result.push({
      label: timeLabels[i],
      price: Number(currentPrice.toFixed(2))
    });
  }

  // Ensure last point matches precisely the basePrice
  result[result.length - 1].price = Number(basePrice.toFixed(2));
  return result;
}

function generateTimeLabels(interval, points) {
  const labels = [];
  const now = new Date();

  if (interval === "1D") {
    // Standard trading hours: 09:15 to 15:30
    let startHour = 9;
    let startMin = 15;
    for (let i = 0; i < points; i++) {
      const minutesAdded = i * 8; // 8 mins intervals
      let currMin = startMin + minutesAdded;
      let currHour = startHour + Math.floor(currMin / 60);
      currMin = currMin % 60;
      if (currHour > 15 || (currHour === 15 && currMin > 30)) {
        currHour = 15;
        currMin = 30;
      }
      labels.push(`${String(currHour).padStart(2, "0")}:${String(currMin).padStart(2, "0")}`);
    }
  } else {
    // Generate dates backwards
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(now);
      if (interval === "1W") d.setDate(now.getDate() - i);
      else if (interval === "1M") d.setDate(now.getDate() - i);
      else if (interval === "3M") d.setDate(now.getDate() - i * 2);
      else if (interval === "6M") d.setDate(now.getDate() - i * 3);
      else if (interval === "1Y") d.setDate(now.getDate() - i * 5);
      else d.setDate(now.getDate() - i * 15);
      
      const day = String(d.getDate()).padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      labels.push(`${day} ${months[d.getMonth()]}`);
    }
  }
  return labels;
}

// Initial mock orders history list matching the third screenshot
export const INITIAL_ORDERS = [
  {
    orderId: "ORD123456",
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    type: "Limit",
    side: "Buy",
    qty: 10,
    price: 2850.00,
    status: "Executed",
    date: "20 May 2024 10:45 AM"
  },
  {
    orderId: "ORD123455",
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    type: "Limit",
    side: "Sell",
    qty: 8,
    price: 3620.00,
    status: "Executed",
    date: "20 May 2024 09:30 AM"
  },
  {
    orderId: "ORD123454",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    type: "Limit",
    side: "Buy",
    qty: 15,
    price: 1650.00,
    status: "Open",
    date: "20 May 2024 09:15 AM"
  },
  {
    orderId: "ORD123453",
    symbol: "INFY",
    name: "Infosys Ltd.",
    type: "Market",
    side: "Buy",
    qty: 12,
    price: 1412.30,
    status: "Executed",
    date: "19 May 2024 03:20 PM"
  },
  {
    orderId: "ORD123452",
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    type: "Limit",
    side: "Sell",
    qty: 10,
    price: 1080.00,
    status: "Cancelled",
    date: "19 May 2024 11:05 AM"
  },
  {
    orderId: "ORD123451",
    symbol: "LT",
    name: "Larsen & Toubro Ltd.",
    type: "Limit",
    side: "Buy",
    qty: 5,
    price: 3450.00,
    status: "Executed",
    date: "18 May 2024 02:40 PM"
  },
  {
    orderId: "ORD123450",
    symbol: "ITC",
    name: "ITC Ltd.",
    type: "Limit",
    side: "Buy",
    qty: 20,
    price: 480.00,
    status: "Open",
    date: "18 May 2024 10:10 AM"
  },
  {
    orderId: "ORD123449",
    symbol: "SBIN",
    name: "State Bank of India Ltd.",
    type: "Market",
    side: "Sell",
    qty: 25,
    price: 810.00,
    status: "Executed",
    date: "17 May 2024 03:05 PM"
  }
];
