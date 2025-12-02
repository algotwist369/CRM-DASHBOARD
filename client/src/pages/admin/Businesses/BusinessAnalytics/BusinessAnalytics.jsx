import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUsers,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaLightbulb,
  FaTrophy,
  FaWallet,
  FaPercentage,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import businessService from "../../../../services/admin/businessService";
import BackButton from "../../../../components/common/Button/BackButton";

const BusinessAnalytics = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [business, setBusiness] = useState(null);

  const fetchBusiness = useCallback(async () => {
    try {
      const res = await businessService.getBusiness(businessId);
      if (res.success) {
        const data = res.data?.data || res.data;
        setBusiness(data);
      }
    } catch (e) {
      console.error("Failed to fetch business:", e);
    }
  }, [businessId]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await businessService.getBusinessAnalytics(businessId, { period });
      if (res.success) {
        setAnalytics(res.data?.data || res.data);
      } else {
        setError(res.error || "Failed to fetch analytics");
      }
    } catch (e) {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [businessId, period]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const statCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        title: "Total Revenue",
        value: `₹${(analytics.totalRevenue || 0).toLocaleString("en-IN")}`,
        icon: FaRupeeSign,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        trend: analytics.revenueGrowth,
        trendLabel: "Growth",
      },
      {
        title: "Total Customers",
        value: (analytics.totalCustomers || 0).toLocaleString("en-IN"),
        icon: FaUsers,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        trend: analytics.customerGrowth,
        trendLabel: "Growth",
      },
      {
        title: "Net Profit",
        value: `₹${(analytics.netProfit || 0).toLocaleString("en-IN")}`,
        icon: FaWallet,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        subValue: `${(analytics.profitMargin || 0).toFixed(1)}% Margin`,
      },
      {
        title: "Avg Daily Revenue",
        value: `₹${(analytics.averageDailyRevenue || 0).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        })}`,
        icon: FaChartBar,
        bgColor: "bg-orange-100",
        iconColor: "text-orange-600",
      },
    ];
  }, [analytics]);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <BackButton />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Business Analytics
            </h1>
            {business && (
              <p className="text-sm text-gray-600 mt-1">
                {business.name} - {business.branch}
              </p>
            )}
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200  p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white border  p-4 sm:p-5 ">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bgColor} p-3 `}>
                    <stat.icon className={`${stat.iconColor} text-xl`} />
                  </div>
                  {stat.trend !== undefined && stat.trend !== null && (
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${stat.trend >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {stat.trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {Math.abs(stat.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1">
                  {stat.title}
                </h3>
                <p className="text-lg sm:text-2xl font-semibold text-gray-800">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                )}
              </div>
            ))}
          </div>

          {/* Charts Section */}
          {analytics.trends && analytics.trends.length > 0 && (
            <div className="bg-white border  p-4 sm:p-6 mb-6 ">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <FaChartLine /> Revenue & Profit Trends
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.trends}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) => `₹${value / 1000}k`}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        undefined,
                      ]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })
                      }
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Net Profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Services */}
            {analytics.topServices && analytics.topServices.length > 0 && (
              <div className="bg-white border  p-4 sm:p-5 ">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaChartPie /> Top Services
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-gray-200 text-gray-600 font-medium">
                          Service
                        </th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-600 font-medium">
                          Rev
                        </th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-600 font-medium">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topServices.slice(0, 5).map((service, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 border-b border-gray-100">
                            <div className="font-medium text-gray-800">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.customers} customers
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-gray-700">
                            ₹{(service.revenue || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-right text-gray-600">
                            {service.percentage?.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Staff Performance */}
            {analytics.staffPerformance &&
              analytics.staffPerformance.length > 0 && (
                <div className="bg-white border  p-4 sm:p-5 ">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FaUsers /> Staff Performance
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 border-b border-gray-200 text-gray-600 font-medium">
                            Staff
                          </th>
                          <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-600 font-medium">
                            Served
                          </th>
                          <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-600 font-medium">
                            Rev
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.staffPerformance
                          .slice(0, 5)
                          .map((staff, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-800">
                                {staff.staffName || "Unknown"}
                              </td>
                              <td className="px-4 py-3 border-b border-gray-100 text-right text-gray-600">
                                {staff.customersServed}
                              </td>
                              <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-gray-700">
                                ₹{(staff.revenue || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Customer Metrics */}
            {analytics.customerMetrics && (
              <div className="bg-white border  p-4 ">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-500" /> Customer Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Revenue/Cust</span>
                    <span className="font-medium text-gray-800">
                      ₹
                      {analytics.customerMetrics.averageRevenuePerCustomer?.toFixed(
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Repeat Rate</span>
                    <span className="font-medium text-gray-800">
                      {analytics.customerMetrics.repeatCustomerRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Customers</span>
                    <span className="font-medium text-gray-800">
                      {analytics.customerMetrics.newCustomerRate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Efficiency Metrics */}
            {analytics.efficiencyMetrics && (
              <div className="bg-white border  p-4 ">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaPercentage className="text-orange-500" /> Efficiency
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rev/Staff</span>
                    <span className="font-medium text-gray-800">
                      ₹{analytics.efficiencyMetrics.revenuePerStaff?.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cust/Staff</span>
                    <span className="font-medium text-gray-800">
                      {analytics.efficiencyMetrics.customersPerStaff?.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expense Ratio</span>
                    <span className="font-medium text-gray-800">
                      {analytics.efficiencyMetrics.expenseRatio?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Peak Performance */}
            {analytics.peakPerformance && (
              <div className="bg-white border  p-4 ">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" /> Peak Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Day</span>
                    <span className="font-medium text-gray-800">
                      {analytics.peakPerformance.bestDay?.date
                        ? new Date(
                          analytics.peakPerformance.bestDay.date
                        ).toLocaleDateString("en-IN", { weekday: "short" })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Top Service</span>
                    <span className="font-medium text-gray-800 truncate max-w-[120px]" title={analytics.peakPerformance.bestService?.name}>
                      {analytics.peakPerformance.bestService?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Top Staff</span>
                    <span className="font-medium text-gray-800 truncate max-w-[120px]" title={analytics.peakPerformance.bestStaff?.staffName}>
                      {analytics.peakPerformance.bestStaff?.staffName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Insights */}
          {analytics.insights && analytics.insights.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100  p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaLightbulb className="text-indigo-600 text-xl mt-1" />
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-1">
                    AI Insights
                  </h3>
                  <ul className="space-y-1">
                    {analytics.insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-indigo-800">
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !error && (!analytics || analytics.totalRevenue === 0) && (
        <div className="bg-white border   p-8 text-center">
          <FaChartBar className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">
            There is no analytics data available for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessAnalytics;

