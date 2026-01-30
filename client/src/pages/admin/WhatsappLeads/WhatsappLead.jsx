import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import {
  FaWhatsapp,
  FaCopy,
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaChartBar,
  FaUserTie,
  FaCommentDots,
  FaFileCsv,
  FaFilePdf,
  FaPhoneAlt,
  FaFilter
} from "react-icons/fa";
import { MdOutlineDoneAll, MdSend, MdClose, MdPendingActions, MdDone } from "react-icons/md";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSocket } from "../../../contexts/SocketContext";

// API Base URL - matches the rest of the app's configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to get user data from token
const getUserData = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      role: payload.role || null,
      name: payload.name || null,
      id: payload.id || null
    };
  } catch {
    return null;
  }
};

const WhatsappLead = () => {
  const { socket } = useSocket();

  /* ---------------- ROLE DETECTION ---------------- */
  /* ---------------- ROLE DETECTION ---------------- */
  const userData = useMemo(() => getUserData(), []);
  const isAdmin = userData?.role === 'admin';
  const isManager = userData?.role === 'manager';
  const currentUserName = userData?.name;

  /* ---------------- STATES ---------------- */
  const [leadsData, setLeadsData] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]); // Dynamic locations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [copiedId, setCopiedId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // State for Send Popover
  const [activePopover, setActivePopover] = useState(null); // leadId
  const [popoverLoading, setPopoverLoading] = useState(false);
  const [currentManagers, setCurrentManagers] = useState([]);
  const [sendingState, setSendingState] = useState({ loading: false, success: false, error: null });

  // === ANALYTICS STATE ===
  const [analyticsData, setAnalyticsData] = useState({
    totalReceived: 0,
    pending: 0,
    forwarded: 0,
    done: 0
  });
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('today'); // 'today', 'yesterday', 'custom'
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // === REMARK MODAL STATE ===
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [currentLeadRemark, setCurrentLeadRemark] = useState(null);
  const [newRemark, setNewRemark] = useState("");

  const [remarkLoading, setRemarkLoading] = useState(false);

  // === SOCKET LISTENERS ===
  useEffect(() => {
    if (!socket) return;

    const handleRemarkAdded = (data) => {
      // data = { leadId, remarks }

      // 1. Update List Data
      setLeadsData((prevLeads) =>
        prevLeads.map((lead) => {
          if (lead.id === data.leadId) {
            return { ...lead, remarks: data.remarks };
          }
          return lead;
        })
      );

      // 2. Update Modal if open for this lead
      setCurrentLeadRemark((prev) => {
        if (prev && prev.id === data.leadId) {
          return { ...prev, remarks: data.remarks };
        }
        return prev;
      });
    };

    socket.on('lead_remark_added', handleRemarkAdded);

    return () => {
      socket.off('lead_remark_added', handleRemarkAdded);
    };
  }, [socket]);

  const searchValue = search.toLowerCase();

  /* ---------------- API FUNCTIONS ---------------- */
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");

      // Choose endpoint based on user role
      const endpoint = isManager
        ? `${API_BASE_URL}/google-sheets/leads/manager`  // Manager: filtered by business branch
        : `${API_BASE_URL}/google-sheets/leads/admin`;   // Admin: all leads

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          limit: 1000000 // Fetch all for client-side filtering
        }
      });

      if (response.data.success) {
        // Transform API data to match existing UI format
        const transformedData = response.data.data.map((lead, index) => {
          // Determine overall status for UI display
          let uiStatus = "Pending";
          if (lead.status === 'done') {
            uiStatus = "Done";
          } else if (lead.status === 'forwarded') {
            uiStatus = "Sent";
          } else if (lead.contactStatus?.derivedStatus === 'called') {
            uiStatus = "Called";
          } else if (lead.contactStatus?.derivedStatus === 'whatsapped') {
            uiStatus = "Whatsapped";
          }

          return {
            id: lead._id, // Ensure we use _id for unique keys and actions
            location: lead.location,
            customerName: lead.customerName || `Customer ${index + 1}`,
            customerPhone: formatPhoneNumber(lead.customerPhone),
            createdAt: lead.createdAt || lead.syncedAt,
            isNew: (new Date() - new Date(lead.createdAt || lead.syncedAt)) < 5 * 60 * 1000,

            // Manager / Contact Info
            totalManagers: lead.totalManagers || 0, // Admin endpoint might not retrun this directly, let's trust populated arrays if available
            managers: [],

            // Store raw lead for popover dynamic fetching if needed
            rawLocation: lead.location,

            status: uiStatus,
            dbStatus: lead.status || 'pending',
            statusUpdatedBy: lead.statusUpdatedBy,
            remarks: lead.remarks || [],

            callDetails: lead.callDetails,
            whatsappDetails: lead.whatsappDetails,
            isCalled: lead.isCalled,
            isWhatsapp: lead.isWhatsapp,
            managerStatus: (lead.managerStatus && lead.managerStatus.length > 0)
              ? lead.managerStatus
              : (() => {
                // Backfill for legacy data
                const legacy = [];
                // Check Contact Details
                if (lead.callDetails?.managerName) {
                  legacy.push({
                    managerName: lead.callDetails.managerName,
                    action: 'called',
                    timestamp: lead.lastModified
                  });
                }
                if (lead.whatsappDetails?.managerName) {
                  legacy.push({
                    managerName: lead.whatsappDetails.managerName,
                    action: 'whatsapped',
                    timestamp: lead.lastModified
                  });
                }
                // Check Status Updated By (De-duplicate if same as above?)
                if (lead.statusUpdatedBy && legacy.length === 0) {
                  legacy.push({
                    managerName: lead.statusUpdatedBy,
                    action: lead.status || 'done',
                    timestamp: lead.statusUpdatedAt || lead.lastModified
                  });
                }
                return legacy;
              })(),
          };
        });

        setLeadsData(transformedData);

        // Update available locations from API if provided
        if (response.data.filters && response.data.filters.locations) {
          setAvailableLocations(response.data.filters.locations);
        }

        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      // Fallback: If admin endpoint fails, perhaps try the old one? Or just show error.
      setError(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    // Skip analytics for non-admins (strict check)
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem("authToken");
      const params = { timeframe: analyticsTimeframe };
      if (analyticsTimeframe === 'custom') {
        params.startDate = customDateRange.start;
        params.endDate = customDateRange.end;
      }

      const response = await axios.get(
        `${API_BASE_URL}/google-sheets/leads/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        }
      );

      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  }, [analyticsTimeframe, customDateRange, isAdmin]);

  const handleSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_BASE_URL}/google-sheets/sync`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        console.log("Sync completed:", response.data.stats);
        await Promise.all([fetchLeads(), fetchAnalytics()]);
      }
    } catch (err) {
      console.error("Error syncing leads:", err);
      setError(err.response?.data?.message || "Failed to sync leads");
    } finally {
      setIsSyncing(false);
    }
  }, [fetchLeads, fetchAnalytics]);

  // Fetch managers dynamically when popover opens
  const fetchManagersForPopover = async (location) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_BASE_URL}/google-sheets/leads/managers`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { location }
        }
      );
      if (response.data.success) {
        return response.data.data; // Array of managers
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch managers for location", err);
      return [];
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_BASE_URL}/google-sheets/leads/admin-status`,
        { leadId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      fetchLeads();
      fetchAnalytics();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  }

  const updateLeadContactStatus = async (leadId, contactType) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_BASE_URL}/google-sheets/leads/update-status`,
        { leadId, contactType }, // 'call' or 'whatsapp'
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data to reflect changes (and potential auto-status update)
      fetchLeads();
      // fetchAnalytics(); // Managers don't see analytics, so skipping
    } catch (err) {
      console.error("Error updating contact status:", err);
      alert("Failed to update contact status");
    }
  };

  const handleOpenPopover = async (lead) => {
    if (activePopover === lead.id) {
      setActivePopover(null);
      return;
    }

    setActivePopover(lead.id);
    setPopoverLoading(true);
    setCurrentManagers([]);
    setSendingState({ loading: false, success: false, error: null });

    // Fetch active managers for this location
    const managers = await fetchManagersForPopover(lead.location);
    setCurrentManagers(managers);

    setPopoverLoading(false);
  };

  const handleSendLead = async (lead, managerIds) => {
    setSendingState({ loading: true, success: false, error: null });
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_BASE_URL}/google-sheets/forward-lead`,
        {
          lead: {
            customerName: lead.customerName,
            location: lead.location,
            customerPhone: lead.customerPhone.replace(/[^0-9]/g, "") // Ensure raw number
          },
          location: lead.location,
          managerIds: managerIds // 'all' or array of IDs
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSendingState({ loading: false, success: true, error: null });
        setTimeout(() => setActivePopover(null), 1500);
        fetchLeads();
        fetchAnalytics(); // Update stats
      }
    } catch (err) {
      console.error("Error forwarding lead:", err);
      setSendingState({ loading: false, success: false, error: err.response?.data?.message || "Failed to send" });
    }
  };

  const handleOpenRemark = (lead) => {
    setCurrentLeadRemark(lead);
    setNewRemark("");
    setRemarkModalOpen(true);
  };

  const submitRemark = async () => {
    if (!newRemark.trim()) return;
    try {
      setRemarkLoading(true);
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/google-sheets/leads/remark`,
        { leadId: currentLeadRemark.id, text: newRemark },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRemarkModalOpen(false);
      fetchLeads(); // refresh to show new remark count/content
    } catch (err) {
      console.error("Error adding remark:", err);
      alert("Failed to add remark");
    } finally {
      setRemarkLoading(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchLeads();
    fetchAnalytics();

    const intervalId = setInterval(() => {
      fetchLeads();
      fetchAnalytics();
    }, 50000);

    return () => clearInterval(intervalId);
  }, [fetchLeads, fetchAnalytics]);

  // Effect to refetch analytics when timeframe changes
  useEffect(() => {
    fetchAnalytics();
  }, [analyticsTimeframe, customDateRange]);


  /* ---------------- HELPER FUNCTIONS ---------------- */
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    let clean = phone.replace(/\D/g, "");
    if (clean.length === 12 && clean.startsWith("91")) {
      return `+${clean.slice(0, 2)} ${clean.slice(2)}`;
    }
    return phone;
  };

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredData = useMemo(() => {
    return leadsData.filter((lead) => {
      if (
        searchValue &&
        !lead.customerName.toLowerCase().includes(searchValue) &&
        !lead.customerPhone.includes(searchValue)
      )
        return false;

      if (locationFilter !== "All" && lead.location !== locationFilter)
        return false;

      // Update filter to match new status logic
      if (statusFilter !== "All") {
        if (isManager) {
          // Manager Filter Logic: Based on managerStatus array
          const myStatus = lead.managerStatus?.some(ms => ms.managerId === userData?.id);
          if (statusFilter === 'Done' && !myStatus) return false;
          // Pending for manager means they haven't acted yet
          if (statusFilter === 'Pending' && myStatus) return false;
          if (statusFilter === 'Sent' && lead.status !== 'Sent') return false; // Sent is global?
        } else {
          // Admin Logic: Global Status
          if (statusFilter === 'Done' && lead.status !== 'Done') return false;
          if (statusFilter === 'Sent' && lead.status !== 'Sent') return false;
          if (statusFilter === 'Pending' && (lead.status === 'Done' || lead.status === 'Sent')) return false;
        }
      }

      return true;
    });
  }, [
    leadsData,
    searchValue,
    locationFilter,
    statusFilter,
  ]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / rowsPerPage),
    [filteredData.length, rowsPerPage]
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * rowsPerPage,
    [currentPage, rowsPerPage]
  );

  const currentData = useMemo(
    () => filteredData.slice(startIndex, startIndex + rowsPerPage),
    [filteredData, startIndex, rowsPerPage]
  );

  /* ---------------- ACTIONS ---------------- */
  const resetPage = useCallback(() => setCurrentPage(1), []);

  const copyToClipboard = useCallback((id, location, name, phone) => {
    const text = `
    *${location}*
    *${name}* , ${phone}
    `;

    navigator.clipboard.writeText(text);
    setCopiedId(id);

    // Auto-mark as done when copied
    updateLeadStatus(id, 'done');

    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const sendWhatsApp = useCallback((phone) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
  }, []);

  const handleExportCSV = useCallback(() => {
    // Determine which data to export: existing filtered data
    const dataToExport = filteredData.length > 0 ? filteredData : [];

    if (dataToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Location", "Customer Name", "Phone", "Status", "Remarks Count", "Created At"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(row => {
        return [
          `"${row.location}"`,
          `"${row.customerName}"`,
          `"${row.customerPhone}"`,
          `"${row.status}"`,
          `"${(row.remarks || []).length}"`,
          `"${new Date(row.createdAt).toLocaleDateString()}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData]);

  const handleExportPDF = useCallback(() => {
    const dataToExport = filteredData.length > 0 ? filteredData : [];

    if (dataToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Leads Export", 14, 22);

    // Subtext
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Records: ${dataToExport.length}`, 14, 35);

    // Table
    const tableColumn = ["#", "Location", "Customer", "Phone", "Status", "Date"];
    const tableRows = [];

    dataToExport.forEach((lead, index) => {
      const leadData = [
        index + 1,
        lead.location,
        lead.customerName,
        lead.customerPhone,
        lead.status,
        new Date(lead.createdAt).toLocaleDateString()
      ];
      tableRows.push(leadData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 112, 112] }, // Match brand color
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });

    doc.save(`Leads_Export_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [filteredData]);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* 1. ANALYTICS DASHBOARD - Admin Only */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaChartBar className="text-[#007070]" />
                Analytics Dashboard
              </h2>
              <p className="text-sm text-gray-500">Track lead performance and manager activity</p>
            </div>

            <div className="flex items-center justify-center gap-6">
              {/* Date Filters */}
              <div className="flex items-center bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => { setAnalyticsTimeframe('today'); setShowCustomDateInputs(false); }}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${analyticsTimeframe === 'today' ? 'bg-white shadow text-[#007070]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => { setAnalyticsTimeframe('yesterday'); setShowCustomDateInputs(false); }}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${analyticsTimeframe === 'yesterday' ? 'bg-white shadow text-[#007070]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => { setAnalyticsTimeframe('custom'); setShowCustomDateInputs(true); }}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${analyticsTimeframe === 'custom' ? 'bg-white shadow text-[#007070]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Custom
                </button>
              </div>

              {/* EXPORT BUTTONS */}
              <div className="flex justify-end gap-2 mb-4 mt-1">
                <button
                  onClick={handleExportCSV}
                  disabled={filteredData.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Export as CSV"
                >
                  <FaFileCsv size={16} /> Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={filteredData.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Export as PDF"
                >
                  <FaFilePdf size={16} /> Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {showCustomDateInputs && (
            <div className="flex gap-2 items-center mb-4 justify-end">
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Received */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 text-sm font-medium">Total Received</span>
                <FaSyncAlt className="text-blue-300" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData.totalReceived}</div>
            </div>

            {/* Pending */}
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-600 text-sm font-medium">Pending</span>
                <MdPendingActions className="text-yellow-300" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData.pending}</div>
            </div>

            {/* Forwarded */}
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-600 text-sm font-medium">Sent / Forwarded</span>
                <MdSend className="text-purple-300" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData.forwarded}</div>
            </div>

            {/* Done */}
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 text-sm font-medium">Marked Done</span>
                <MdDone className="text-green-300" size={22} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData.done}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LEADS LIST HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2 text-gray-700">
            <FaWhatsapp className="text-green-500" />
            Leads Management
          </h1>
          {lastSyncTime && (
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Sync button - Admin only */}
        {isAdmin && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition ${isSyncing
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#007070] text-white hover:bg-[#014b4b]"
              }`}
          >
            <FaSyncAlt className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Sheet"}
          </button>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )
      }

      {/* LOADING STATE */}
      {
        loading && leadsData.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007070] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leads...</p>
          </div>
        ) : (
          <>
            {/* FILTER BAR - Collapsible */}
            <div className="bg-white p-4 rounded shadow mb-4">
              <div className="flex justify-between items-center md:hidden mb-2">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                  <FaFilter className="text-[#007070]" /> Filter Options
                </h2>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition flex items-center gap-1"
                >
                  {filterOpen ? "Hide" : "Show"}
                </button>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-5 gap-3 transition-all duration-300 ${filterOpen ? 'block' : 'hidden md:grid'}`}>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    className="pl-10 border rounded px-3 py-2 w-full text-sm outline-none"
                    placeholder="Search name or phone"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      resetPage();
                    }}
                  />
                </div>

                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    resetPage();
                  }}
                >
                  {availableLocations.length > 0 ? (
                    availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === "All" ? "All Locations" : loc}
                      </option>
                    ))
                  ) : (
                    // Fallback if API hasn't loaded yet
                    <>
                      <option value="All">All Locations</option>
                    </>
                  )}
                </select>

                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    resetPage();
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Sent">Sent (Forwarded)</option>
                  <option value="Done">Marked Done</option>
                  <option value="Pending">Pending</option>
                </select>

                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    resetPage();
                  }}
                >
                  <option value={10}>10 Rows</option>
                  <option value={20}>20 Rows</option>
                  <option value={50}>50 Rows</option>
                </select>
              </div>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-3 pb-4">
              {currentData.map((lead) => (
                <div key={lead.id} className={`bg-white rounded-lg shadow-sm border p-3 relative ${lead.dbStatus === 'done' ? 'bg-gray-50 border-gray-200' : 'border-gray-100'}`}>

                  {/* Timestamp */}
                  <div className="absolute top-3 right-3 flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {lead.isNew && (
                      <span className="text-[10px] text-green-600 font-bold animate-pulse">NEW</span>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="pr-16 mb-3">
                    <h3 className="font-bold text-gray-800 text-sm">{lead.customerName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <span className="font-medium text-gray-700">{lead.location}</span>
                      <span>•</span>
                      <span className="font-mono">{lead.customerPhone}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
                    {/* LEFT: Main Actions */}
                    <div className="flex items-center gap-3">
                      {!isAdmin && (
                        <>
                          {/* Call */}
                          <button
                            onClick={() => {
                              updateLeadContactStatus(lead.id, 'call');
                              window.location.href = `tel:${lead.customerPhone}`;
                            }}
                            className={`p-2 rounded-full transition border ${lead.isCalled
                              ? 'bg-blue-100 text-blue-600 border-blue-200'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                              }`}
                          >
                            <FaPhoneAlt size={14} />
                          </button>
                          {/* WhatsApp */}
                          <button
                            onClick={() => {
                              updateLeadContactStatus(lead.id, 'whatsapp');
                              const message = `Hello ${lead.customerName}, regarding your inquiry for ${lead.location}...`;
                              window.open(`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
                            }}
                            className={`p-2 rounded-full transition border ${lead.isWhatsapp
                              ? 'bg-green-100 text-green-600 border-green-200'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                              }`}
                          >
                            <FaWhatsapp size={16} />
                          </button>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => copyToClipboard(lead.id, lead.location, lead.customerName, lead.customerPhone)}
                            className={`p-2 rounded-full ${lead.dbStatus === 'done' ? 'text-gray-300' : 'text-[#007070] bg-teal-50'}`}
                          >
                            <FaCopy size={14} />
                          </button>
                          {/* Mobile Forward not implemented fully - alert for now or simplified */}
                          <button
                            onClick={() => handleOpenPopover(lead)} // Note: Popover rendering handles visibility
                            className="p-2 text-purple-600 bg-purple-50 rounded-full relative"
                          >
                            <MdOutlineDoneAll size={16} />
                            {/* Render Simplified Popover inside relative container if active */}
                            {activePopover === lead.id && (
                              <div className="absolute left-0 top-full mt-2 w-64 bg-white border shadow-xl z-50 p-2 text-xs rounded text-left">
                                <p className="font-bold mb-2">Forwarding...</p>
                                <button onClick={(e) => { e.stopPropagation(); alert("Please switch to Desktop view for advanced forwarding options."); }} className="text-blue-600 underline text-[10px]">Desktop for Full Menu</button>
                                {/* Note: Full popover duplication skipped for brevity in card view, user should use desktop for bulk ops if needed, or simplified 'Send All' */}
                                <div className="mt-2 text-gray-500 italic">Use Desktop for advanced forwarding</div>
                              </div>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {/* RIGHT: Remark */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRemark(lead)}
                        className="text-gray-400 hover:text-gray-600 relative p-1"
                      >
                        <FaCommentDots size={16} />
                        {lead.remarks && lead.remarks.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3 h-3 flex items-center justify-center rounded-full">
                            {lead.remarks.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:flex bg-white rounded shadow overflow-hidden flex-col h-full relative">
              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full border text-sm relative">
                  <thead className="bg-gray-100 uppercase sticky top-0 z-10 shadow-sm">
                    <tr>
                      {[
                        "#",
                        "Location",
                        "Customer",
                        "Phone",
                        isAdmin ? "Copy" : null,
                        isAdmin ? "Forward" : "Actions",
                        isAdmin ? "Status Action" : null,
                        "Remark"
                      ].filter(Boolean).map((h) => (
                        <th key={h} className="p-3 border">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-6 text-center text-gray-400">
                          No data found
                        </td>
                      </tr>
                    ) : (
                      currentData.map((lead, index) => (
                        <tr key={lead.id} className={`hover:bg-gray-50 text-center relative ${lead.dbStatus === 'done' ? 'bg-gray-100' : ''}`}>
                          <td className="p-3 border relative">
                            {startIndex + index + 1}
                            {lead.isNew && (
                              <span className="absolute top-1 left-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" title="New Lead (< 5 mins)"></span>
                            )}
                          </td>
                          <td className="p-3 border font-semibold text-gray-600">
                            {lead.location}
                          </td>
                          <td className="p-3 border">{lead.customerName}</td>
                          <td className="p-3 border font-mono text-xs">{lead.customerPhone}</td>
                          {/* <td className="p-3 border">{lead.totalManagers}</td> */}

                          {/* COPY */}
                          {isAdmin && (
                            <td className="p-3 border">
                              <button
                                onClick={() =>
                                  copyToClipboard(lead.id, lead.location, lead.customerName, lead.customerPhone)
                                }
                                className={`p-2 rounded-full transition ${lead.dbStatus === 'done'
                                  ? "text-gray-300 "
                                  : (copiedId === lead.id ? "text-green-600 scale-110" : "text-[#007070] hover:bg-teal-50")
                                  }`}
                                title={lead.dbStatus === 'done' ? "Already Done" : "Copy details (Mark as Done)"}
                              >
                                <FaCopy />
                              </button>
                            </td>
                          )}

                          {/* FORWARD (Admin) OR CONTACT ACTIONS (Manager) */}
                          <td className="p-3 border cursor-pointer relative h-full">
                            {isAdmin ? (
                              /* ADMIN: FORWARD UI */
                              <div className="flex justify-center items-center">
                                <div className="relative">
                                  {lead.dbStatus === 'forwarded' || lead.status === 'Sent' ? (
                                    <button
                                      onClick={() => handleOpenPopover(lead)}
                                      className="text-purple-600 hover:text-purple-800 transition flex flex-col items-center"
                                      title="Already Sent. Click to send again."
                                    >
                                      <MdOutlineDoneAll size={20} />
                                      <span className="text-[10px] font-medium">Forwarded</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenPopover(lead)}
                                      className={`transition ${lead.dbStatus === 'done'
                                        ? 'text-gray-300' // Negate color if done
                                        : 'text-green-600 hover:scale-110' // Green if not done
                                        }`}
                                      title="Forward to Managers"
                                    >
                                      <FaWhatsapp size={24} />
                                    </button>
                                  )}

                                  {/* POPOVER (Only for Admin) */}
                                  {activePopover === lead.id && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-4 text-left">
                                      <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-gray-700 text-sm">Forward Lead</h3>
                                        <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-red-500">
                                          <MdClose />
                                        </button>
                                      </div>

                                      {/* Location Info */}
                                      <p className="text-xs text-gray-500 mb-2">
                                        Location: <span className="font-medium text-gray-700">{lead.location}</span>
                                      </p>
                                      <p className="text-xs text-gray-500 mb-4">
                                        Active Managers: <span className="font-medium text-gray-700">{currentManagers.length || 0}</span>
                                      </p>

                                      {/* Main Actions */}
                                      <div className="space-y-2">
                                        {/* Send All Button */}
                                        <button
                                          onClick={() => handleSendLead(lead, 'all')}
                                          disabled={sendingState.loading || currentManagers.length === 0}
                                          className="w-full bg-[#007070] text-white py-2 rounded text-sm font-medium hover:bg-[#014b4b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                          {sendingState.loading ? "Sending..." : "Send to All Managers"}
                                          {!sendingState.loading && <MdOutlineDoneAll />}
                                        </button>

                                        {/* Divider */}
                                        <div className="border-t my-2"></div>

                                        {/* Individual Managers */}
                                        {popoverLoading ? (
                                          <div className="text-center py-2 text-gray-400 text-xs">Loading managers...</div>
                                        ) : (
                                          <div className="max-h-40 overflow-y-auto space-y-2">
                                            {currentManagers.length > 0 ? currentManagers.map((mgr, idx) => (
                                              <div key={idx} className="flex justify-between items-center text-sm p-1 hover:bg-gray-50 rounded">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                  <FaUserTie className="text-gray-400 flex-shrink-0" />
                                                  <span className="truncate text-gray-700" title={mgr.name}>{mgr.name}</span>
                                                </div>

                                                <button
                                                  onClick={() => handleSendLead(lead, [mgr.id])}
                                                  className="text-[#007070] hover:bg-[#e6f2f2] p-1 rounded"
                                                  title="Send to this manager only"
                                                >
                                                  <MdSend />
                                                </button>
                                              </div>
                                            )) : (
                                              <p className="text-xs text-gray-400 text-center py-2">No active managers found.</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {sendingState.success && (
                                        <div className="mt-2 text-xs text-green-600 font-semibold text-center animate-pulse">
                                          Sent Successfully!
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* MANAGER: ACTIONS (Call/Whatsapp) */
                              (() => {
                                // LOCK LOGIC: Locked if done AND updated by someone else
                                const isLocked = lead.dbStatus === 'done' && lead.statusUpdatedBy && lead.statusUpdatedBy !== currentUserName;

                                if (isLocked) {
                                  return <span className="text-xs text-gray-400 italic">Locked</span>;
                                }

                                return (
                                  <div className="flex justify-center items-center gap-3">
                                    {/* Call Toggle */}
                                    <button
                                      onClick={() => {
                                        updateLeadContactStatus(lead.id, 'call');
                                        window.location.href = `tel:${lead.customerPhone}`;
                                      }}
                                      className={`p-2 rounded-full transition border ${lead.isCalled
                                        ? 'bg-blue-100 text-blue-600 border-blue-200'
                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-blue-50 hover:text-blue-400'
                                        }`}
                                      title={lead.isCalled ? "Called (Click to update)" : "Mark as Called & Call"}
                                    >
                                      <FaPhoneAlt size={16} />
                                    </button>

                                    {/* WhatsApp Toggle */}
                                    <button
                                      onClick={() => {
                                        updateLeadContactStatus(lead.id, 'whatsapp');
                                        const message = `Hello ${lead.customerName}, regarding your inquiry for ${lead.location}...`;
                                        window.open(`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
                                      }}
                                      className={`p-2 rounded-full transition border ${lead.isWhatsapp
                                        ? 'bg-green-100 text-green-600 border-green-200'
                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-green-50 hover:text-green-400'
                                        }`}
                                      title={lead.isWhatsapp ? "Whatsapped (Click to update)" : "Mark as Whatsapped & Open WhatsApp"}
                                    >
                                      <FaWhatsapp size={20} />
                                    </button>
                                  </div>
                                );
                              })()
                            )}
                          </td>

                          {/* MARK DONE STATUS */}
                          {isAdmin && (
                            <td className="p-3 border">
                              {(() => {
                                // NEW MANAGER LOGIC
                                if (isManager) {
                                  const myStatus = lead.managerStatus?.some(ms => ms.managerId === userData?.id);
                                  return myStatus ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button onClick={() => updateLeadStatus(lead.id, 'pending')} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold hover:bg-green-200 transition flex items-center gap-1" title="Click to undo (Only for you)"><FaCheckCircle /> Done</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => updateLeadStatus(lead.id, 'done')} className="px-3 py-1 border border-yellow-400 bg-yellow-50 text-yellow-700 rounded-full text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition flex items-center gap-1 mx-auto" title="Click to Mark Done"><MdPendingActions /> Pending</button>
                                  );
                                }

                                // DISABLED OLD LOGIC
                                if (false) {
                                  return (
                                    <div className="flex flex-col items-center justify-center">
                                      <span className="text-xs font-bold text-gray-500">Done</span>
                                      <span className="text-[10px] text-gray-400">by: {lead.statusUpdatedBy}</span>
                                    </div>
                                  );
                                }

                                // ADMIN VIEW
                                return (
                                  <div className="flex flex-col gap-2 w-full">
                                    {/* Manager List */}
                                    {lead.managerStatus?.length > 0 && (
                                      <div className="w-full mb-1 border-b pb-1">
                                        {lead.managerStatus.map((ms, i) => (
                                          <div key={i} className="flex justify-between text-[10px]">
                                            <span className="font-bold">{ms.managerName}</span>
                                            <span className="text-gray-500">{new Date(ms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Global Control */}
                                    {(lead.dbStatus === 'done' && lead.statusUpdatedBy !== 'Admin' && lead.managerStatus?.length > 0) ? null :
                                      lead.dbStatus === 'done' ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <button
                                            onClick={() => updateLeadStatus(lead.id, 'pending')}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold hover:bg-green-200 transition flex items-center gap-1"
                                            title="Click to undo"
                                          >
                                            <FaCheckCircle /> Done
                                          </button>
                                          <span className="text-[10px] text-gray-500 mt-1 font-medium">
                                            by: {lead.statusUpdatedBy || 'Admin'}
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => updateLeadStatus(lead.id, 'done')}
                                          className="px-3 py-1 border border-yellow-400 bg-yellow-50 text-yellow-700 rounded-full text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition flex items-center gap-1 mx-auto"
                                          title="Click to Mark Done"
                                        >
                                          <MdPendingActions /> Pending
                                        </button>
                                      )}
                                  </div>
                                );
                              })()}
                            </td>
                          )}

                          {/* REMARK BUTTON */}
                          <td className="p-3 border">
                            <button
                              onClick={() => handleOpenRemark(lead)}
                              className="text-gray-500 hover:text-[#007070] transition relative"
                              title="View/Add Remarks"
                            >
                              <FaCommentDots size={18} />
                              {lead.remarks && lead.remarks.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                  {lead.remarks.length}
                                </span>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <span>
                Showing {currentData.length} of {filteredData.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )
      }

      {/* REMARK MODAL */}
      {
        remarkModalOpen && currentLeadRemark && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setRemarkModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <MdClose size={24} />
              </button>

              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCommentDots className="text-[#007070]" />
                Remarks for {currentLeadRemark.customerName}
              </h3>

              {/* History */}
              <div className="bg-gray-50 rounded p-3 mb-4 h-48 overflow-y-auto border">
                {currentLeadRemark.remarks && currentLeadRemark.remarks.length > 0 ? (
                  currentLeadRemark.remarks.slice().reverse().map((rem, idx) => (
                    <div key={idx} className="mb-3 border-b last:border-0 pb-2">
                      <p className="text-sm text-gray-800">{rem.text}</p>
                      <div className="text-xs text-gray-500 flex justify-between mt-1">
                        <span>{rem.by}</span>
                        <span>{new Date(rem.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center text-sm py-4">No remarks yet.</p>
                )}
              </div>

              {/* Add New */}
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full border rounded p-2 text-sm focus:outline-none focus:border-[#007070]"
                  placeholder="Type a remark..."
                  rows="3"
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                ></textarea>
                <button
                  onClick={submitRemark}
                  disabled={remarkLoading || !newRemark.trim()}
                  className="bg-[#007070] text-white py-2 rounded font-semibold text-sm hover:bg-[#014b4b] disabled:opacity-50 transition"
                >
                  {remarkLoading ? "Saving..." : "Add Remark"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default WhatsappLead;
