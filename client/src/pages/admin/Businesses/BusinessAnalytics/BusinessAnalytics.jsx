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
} from "react-icons/fa";
import businessService from "../../../../services/admin/businessService";

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
        trend: analytics.totalRevenue > 0 ? "+" : "",
      },
      {
        title: "Total Customers",
        value: (analytics.totalCustomers || 0).toLocaleString("en-IN"),
        icon: FaUsers,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        title: "Net Profit",
        value: `₹${(analytics.netProfit || 0).toLocaleString("en-IN")}`,
        icon: FaChartLine,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        trend: analytics.netProfit > 0 ? "+" : "",
      },
      {
        title: "Avg Daily Revenue",
        value: `₹${(analytics.averageDailyRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
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
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← Back
        </button>
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {statCards.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border shadow-sm rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`${stat.bgColor} p-3 rounded-lg`}
                  >
                    <stat.icon className={`${stat.iconColor} text-xl`} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1">
                  {stat.title}
                </h3>
                <p className="text-lg sm:text-2xl font-semibold text-gray-800">
                  {stat.value}
                </p>
                {stat.trend && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FaArrowUp /> {stat.trend}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Growth Rate */}
          {analytics.growthRate !== undefined && (
            <div className="bg-white border shadow-sm rounded-xl p-4 sm:p-5 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
                Growth Rate
              </h2>
              <div className="flex items-center gap-4">
                {analytics.growthRate >= 0 ? (
                  <>
                    <FaArrowUp className="text-green-600 text-3xl" />
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        +{analytics.growthRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Positive growth in revenue
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <FaArrowDown className="text-red-600 text-3xl" />
                    <div>
                      <p className="text-3xl font-bold text-red-600">
                        {analytics.growthRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Decline in revenue
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Top Services */}
          {analytics.topServices && analytics.topServices.length > 0 && (
            <div className="bg-white border shadow-sm rounded-xl p-4 sm:p-5 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaChartPie /> Top Services
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 border-b border-gray-200 text-gray-700">
                        Service Name
                      </th>
                      <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-700">
                        Customers
                      </th>
                      <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-700">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topServices.map((service, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 border-b border-gray-100">
                          {service.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-100 text-right">
                          {service.customers || 0}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-100 text-right">
                          ₹{(service.revenue || 0).toLocaleString("en-IN")}
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
              <div className="bg-white border shadow-sm rounded-xl p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaUsers /> Staff Performance
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-gray-200 text-gray-700">
                          Staff Name
                        </th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-700">
                          Customers
                        </th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-700">
                          Revenue
                        </th>
                        <th className="text-right px-4 py-3 border-b border-gray-200 text-gray-700">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.staffPerformance.map((staff, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 border-b border-gray-100">
                            {staff.name || "Unknown Staff"}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-right">
                            {staff.customersServed || 0}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-right">
                            ₹{(staff.revenue || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-100 text-right">
                            ₹{(staff.commission || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </>
      )}

      {!loading && !error && (!analytics || analytics.totalRevenue === 0) && (
        <div className="bg-white border shadow-sm rounded-xl p-8 text-center">
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

