import { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenueIncrease, setRevenueIncrease] = useState("+0%");
  const [ordersIncrease, setOrdersIncrease] = useState("+0%");
  const [conversionRate, setConversionRate] = useState("0%");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all orders for revenue, count, and chart
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');
        
      if (ordersError) throw ordersError;

      // --- Calculate Total Revenue ---
      const revenue = ordersData
        .filter(order => order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'paid')
        .reduce((acc, order) => acc + (Number(order.total_price || order.total) || 0), 0);
      setTotalRevenue(revenue);

      // --- Calculate Total Orders ---
      setTotalOrders(ordersData.length);

      // --- Calculate Conversion Rate ---
      // We will assume a base of 1000 users/visits for now to calculate a mock conversion rate
      // as there's no actual site visits table.
      const estimatedVisits = 1000;
      const calculatedConversionRate = ordersData.length > 0 ? ((ordersData.length / estimatedVisits) * 100).toFixed(1) + "%" : "0%";
      setConversionRate(calculatedConversionRate);

      // --- Last 7 Days vs Previous 7 Days Comparison ---
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(now.getDate() - 14);
      
      const last7DaysOrders = ordersData.filter(order => new Date(order.created_at) >= sevenDaysAgo);
      const prev7DaysOrders = ordersData.filter(order => {
        const date = new Date(order.created_at);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      });

      // Calculate revenue increase
      const last7DaysRevenue = last7DaysOrders
        .filter(order => order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'paid')
        .reduce((acc, order) => acc + (Number(order.total_price || order.total) || 0), 0);
        
      const prev7DaysRevenue = prev7DaysOrders
        .filter(order => order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'paid')
        .reduce((acc, order) => acc + (Number(order.total_price || order.total) || 0), 0);
        
      let revIncPercentage = 0;
      if (prev7DaysRevenue > 0) {
        revIncPercentage = ((last7DaysRevenue - prev7DaysRevenue) / prev7DaysRevenue) * 100;
      } else if (last7DaysRevenue > 0) {
        revIncPercentage = 100; // From 0 to something
      }
      setRevenueIncrease(`${revIncPercentage > 0 ? '+' : ''}${revIncPercentage.toFixed(1)}%`);

      // Calculate orders increase
      const last7DaysCount = last7DaysOrders.length;
      const prev7DaysCount = prev7DaysOrders.length;
      
      let ordIncPercentage = 0;
      if (prev7DaysCount > 0) {
        ordIncPercentage = ((last7DaysCount - prev7DaysCount) / prev7DaysCount) * 100;
      } else if (last7DaysCount > 0) {
        ordIncPercentage = 100; // From 0 to something
      }
      setOrdersIncrease(`${ordIncPercentage > 0 ? '+' : ''}${ordIncPercentage.toFixed(1)}%`);

      // Prepare Chart Data
      const sortedChartData = last7DaysOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setChartData(sortedChartData);
      
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { title: "Total Revenue", value: `${totalRevenue.toLocaleString()} DA`, increase: revenueIncrease, icon: DollarSign },
    { title: "Orders", value: totalOrders.toLocaleString(), increase: ordersIncrease, icon: ShoppingBag },
    { title: "Conversion Rate", value: conversionRate, increase: "", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-12 font-['Inter'] w-full max-w-6xl mx-auto relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-black border-r-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="border border-black p-6 flex flex-col justify-between items-start hover:shadow-[4px_4px_0_0_#000] transition-shadow bg-white">
            <div className="flex w-full justify-between items-center mb-6">
              <span className="text-sm font-medium uppercase tracking-wider text-neutral-500">{stat.title}</span>
              <stat.icon className="w-5 h-5 stroke-[1.5px] text-black" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-black">
                {stat.value}
              </span>
              <span className="text-sm font-bold text-neutral-500 mb-1">
                {stat.increase}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="border border-black bg-white p-6 md:p-8 flex flex-col hover:shadow-[4px_4px_0_0_#000] transition-shadow">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold tracking-tight uppercase">Sales Overview (7 Days)</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-black text-xs font-bold bg-black text-white">Week</button>
            <button className="px-3 py-1 border border-black text-xs font-bold hover:bg-neutral-100">Month</button>
          </div>
        </div>
        
        {/* Simple SVG Area Chart */}
        <div className="w-full h-64 relative mt-4">
          <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <line x1="0" y1="0" x2="1000" y2="0" stroke="#E5E5E5" strokeWidth="1" />
            <line x1="0" y1="75" x2="1000" y2="75" stroke="#E5E5E5" strokeWidth="1" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#E5E5E5" strokeWidth="1" />
            <line x1="0" y1="225" x2="1000" y2="225" stroke="#E5E5E5" strokeWidth="1" />
            <line x1="0" y1="300" x2="1000" y2="300" stroke="#000000" strokeWidth="2" />

            {/* Path for curve (Stroke) */}
            <path 
              d="M0,280 C100,280 150,220 200,200 C300,160 350,240 450,180 C550,120 600,100 700,120 C800,140 850,50 1000,20" 
              fill="none" 
              stroke="#000000" 
              strokeWidth="4" 
              vectorEffect="non-scaling-stroke" 
            />
            
            {/* Area Fill */}
            <path 
              d="M0,280 C100,280 150,220 200,200 C300,160 350,240 450,180 C550,120 600,100 700,120 C800,140 850,50 1000,20 L1000,300 L0,300 Z" 
              fill="url(#areaGradient)" 
            />

            {/* Data Points */}
            <circle cx="200" cy="200" r="4" fill="#000" />
            <circle cx="450" cy="180" r="4" fill="#000" />
            <circle cx="700" cy="120" r="4" fill="#000" />
            <circle cx="1000" cy="20" r="6" fill="#fff" stroke="#000" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
