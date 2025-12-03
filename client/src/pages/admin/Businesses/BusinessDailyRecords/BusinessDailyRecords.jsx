import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaRupeeSign,
  FaUsers,
  FaChartLine,
  FaChevronLeft,
  FaSpinner,
  FaClipboardList,
  FaCloudSun,
  FaStar,
  FaMoneyBillWave,
} from "react-icons/fa";
import businessService from "../../../../services/admin/businessService";
import BackButton from "../../../../components/common/Button/BackButton";

const BusinessDailyRecords = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 20,
    total: 0,
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

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

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await businessService.getBusinessDailyRecords(businessId, params);
      if (res.success) {
        const recordsData = res.data?.data || res.data;
        setRecords(recordsData);
        if (res.data?.pagination) {
          setPagination((prev) => ({ ...prev, ...res.data.pagination }));
        }
      } else {
        setError(res.error || "Failed to fetch daily records");
      }
    } catch (e) {
      setError("Failed to fetch daily records");
    } finally {
      setLoading(false);
    }
  }, [businessId, pagination.currentPage, dateRange]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, pagination.currentPage]);

  const handleDateChange = useCallback((type, value) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  }, []);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return `₹${(amount || 0).toLocaleString("en-IN")}`;
  }, []);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <BackButton />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Daily Business Records
            </h1>
            {business && (
              <p className="text-sm text-gray-600 mt-1">
                {business.name} - {business.branch}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white   p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateRange({ startDate: "", endDate: "" });
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full border border-gray-300  px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
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

      {!loading && !error && (
        <>
          {/* Records Grid */}
          <div className="space-y-4 mb-6">
            {records.map((record) => (
              <div
                key={record._id || record.id}
                className="bg-white border p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-3 ">
                      <FaCalendarAlt className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {formatDate(record.date)}
                      </h3>
                      {record.manager && (
                        <p className="text-sm text-gray-600">
                          Manager: {record.manager.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${record.isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {record.isCompleted ? "Completed" : "In Progress"}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 p-3  border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">Total Income</p>
                    <p className="text-lg font-bold text-blue-900 flex items-center gap-1">
                      <FaRupeeSign className="text-sm" />
                      {(record.totalIncome || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3  border border-red-200">
                    <p className="text-xs text-red-700 mb-1">Expenses</p>
                    <p className="text-lg font-bold text-red-900 flex items-center gap-1">
                      <FaMoneyBillWave className="text-sm" />
                      {(record.totalExpenses || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3  border border-green-200">
                    <p className="text-xs text-green-700 mb-1">Net Profit</p>
                    <p className="text-lg font-bold text-green-900 flex items-center gap-1">
                      <FaChartLine className="text-sm" />
                      {(record.netProfit || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3  border border-purple-200">
                    <p className="text-xs text-purple-700 mb-1">Customers</p>
                    <p className="text-lg font-bold text-purple-900 flex items-center gap-1">
                      <FaUsers className="text-sm" />
                      {record.totalCustomers || 0}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                {record.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {record.metrics.walkInCustomers > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Walk-in:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {record.metrics.walkInCustomers}
                        </span>
                      </div>
                    )}
                    {record.metrics.appointmentCustomers > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Appointments:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {record.metrics.appointmentCustomers}
                        </span>
                      </div>
                    )}
                    {record.metrics.repeatCustomers > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Repeat:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {record.metrics.repeatCustomers}
                        </span>
                      </div>
                    )}
                    {record.metrics.newCustomers > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">New:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {record.metrics.newCustomers}
                        </span>
                      </div>
                    )}
                    {record.metrics.averageServiceTime > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Avg Time:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {record.metrics.averageServiceTime} mins
                        </span>
                      </div>
                    )}
                    {record.metrics.customerSatisfaction > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Satisfaction:</span>
                        <div className="flex items-center gap-1 ml-2">
                          <FaStar className="text-yellow-500" />
                          <span className="font-semibold text-gray-900">
                            {record.metrics.customerSatisfaction.toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Services */}
                {record.services && record.services.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Services</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.services.slice(0, 4).map((service, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 bg-gray-50  text-sm"
                        >
                          <span className="text-gray-700 capitalize">
                            {service.serviceName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              {service.customerCount} cust
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(service.totalRevenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {record.services.length > 4 && (
                        <div className="text-sm text-primary-600 font-medium p-2">
                          +{record.services.length - 4} more services
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {(record.weather || record.specialEvents?.length > 0 || record.notes) && (
                  <div className="pt-4 border-t border-gray-200">
                    {record.weather && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FaCloudSun className="text-gray-400" />
                        <span>{record.weather}</span>
                      </div>
                    )}
                    {record.specialEvents && record.specialEvents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {record.specialEvents.map((event, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700  text-xs"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    )}
                    {record.notes && (
                      <div className="text-sm text-gray-700 bg-gray-50 p-3  border border-gray-200">
                        <FaClipboardList className="inline mr-2 text-gray-400" />
                        {record.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {records.length === 0 && (
            <div className="bg-white border   p-12 text-center">
              <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Records Found
              </h3>
              <p className="text-gray-600">
                {dateRange.startDate || dateRange.endDate
                  ? "Try adjusting your date range."
                  : "No daily business records have been created yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white ">
              <div className="text-sm text-gray-600">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 ">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessDailyRecords;

