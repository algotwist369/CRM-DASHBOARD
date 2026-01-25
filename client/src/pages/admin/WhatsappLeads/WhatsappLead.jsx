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
  FaSyncAlt
} from "react-icons/fa";
import { MdOutlineDoneAll, MdSend, MdClose } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import axios from "axios";

// API Base URL - matches the rest of the app's configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const WhatsappLead = () => {
  /* ---------------- STATES ---------------- */
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerStatusFilter, setManagerStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [copiedId, setCopiedId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // State for Send Popover
  const [activePopover, setActivePopover] = useState(null); // leadId
  const [popoverLoading, setPopoverLoading] = useState(false);
  const [currentManagers, setCurrentManagers] = useState([]);
  const [sendingState, setSendingState] = useState({ loading: false, success: false, error: null });

  const searchValue = search.toLowerCase();

  /* ---------------- API FUNCTIONS ---------------- */
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_BASE_URL}/google-sheets/leads`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: 1,
            limit: 1000000 // Fetch all for client-side filtering
          }
        }
      );


      if (response.data.success) {
        // Transform API data to match existing UI format
        const transformedData = response.data.data.map((lead, index) => ({
          id: lead._id,
          location: lead.location,
          customerName: lead.customerName || `Customer ${index + 1}`,
          customerPhone: formatPhoneNumber(lead.customerPhone),
          createdAt: lead.createdAt, // Store creation time
          isNew: (new Date() - new Date(lead.createdAt)) < 5 * 60 * 1000, // New if < 5 mins old
          totalManagers: lead.totalManagers || 0,
          status: lead.totalManagers > 0 ? "Sent" : "Pending", // Status based on manager assignment
          managers: (lead.managers || []).map(manager => ({
            id: manager.id || manager._id, // Ensure ID is mapped
            name: manager.name,
            phone: manager.phone || '',
            email: manager.email || '',
            status: "Delivered" // Default status - can be updated with real WhatsApp status later
          }))
        }));

        setLeadsData(transformedData);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

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
        // Refresh data after sync
        await fetchLeads();
      }
    } catch (err) {
      console.error("Error syncing leads:", err);
      setError(err.response?.data?.message || "Failed to sync leads");
    } finally {
      setIsSyncing(false);
    }
  }, [fetchLeads]);

  const handleOpenPopover = async (lead) => {
    // Toggle if already open
    if (activePopover === lead.id) {
      setActivePopover(null);
      return;
    }

    setActivePopover(lead.id);
    setPopoverLoading(true);
    setCurrentManagers([]);
    setSendingState({ loading: false, success: false, error: null });

    // Fetch managers for this specific location to get fresh status if needed
    // Actually, we already have managers in lead.managers but let's assume we want full details or fresh fetch
    // For now, let's filter from the lead object itself as it was hydrated by backend
    // But wait, the backend hydrates it. But if we want to add new managers who might have been added recently?
    // Ideally we should have an endpoint to fetch managers for location, but let's rely on what we have OR
    // we can reuse the backend logic if we want.
    // Since backend logic `getManagersForLocation` is internal, let's rely on the lead.managers array which is populated by getAllLeads
    // However, getAllLeads might be cached or slightly stale. 
    // Important: The user wants to see "how many managers are there". 
    // If we want to be super real-time we could add an endpoint. 
    // But lead.managers comes from `getAllLeads` which calls `getManagersForLocation`. So it is fresh enough (per page load).

    // Let's us the lead.managers data.
    setCurrentManagers(lead.managers);
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
        // Close popover after short delay
        setTimeout(() => setActivePopover(null), 1500);
        // Refresh leads to update statuses if we track them
        fetchLeads();
      }
    } catch (err) {
      console.error("Error forwarding lead:", err);
      setSendingState({ loading: false, success: false, error: err.response?.data?.message || "Failed to send" });
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchLeads();

    // Auto-refresh every 50 seconds
    const intervalId = setInterval(() => {
      fetchLeads();
    }, 50000);

    return () => clearInterval(intervalId);
  }, [fetchLeads]);

  /* ---------------- HELPER FUNCTIONS ---------------- */
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    // Format as +91 XXXXXXXXXX
    if (phone.length === 12 && phone.startsWith("91")) {
      return `+${phone.slice(0, 2)} ${phone.slice(2)}`;
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

      if (statusFilter !== "All" && lead.status !== statusFilter)
        return false;

      if (
        managerStatusFilter !== "All" &&
        !lead.managers.some((m) => m.status === managerStatusFilter)
      )
        return false;

      return true;
    });
  }, [
    leadsData,
    searchValue,
    locationFilter,
    statusFilter,
    managerStatusFilter,
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
    New Customer Lead 🚨  
    Name: *${name}*
    Phone: ${phone}
    Location: *${location}*
    
    Note: As instructed by the *Head Office*, follow up immediately.
    `;

    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const sendWhatsApp = useCallback((phone) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER + SYNC */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaWhatsapp className="text-green-500" />
            WhatsApp Leads (Google Sheets)
          </h1>
          {lastSyncTime && (
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition ${isSyncing
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#007070] text-white hover:bg-[#014b4b]"
            }`}
        >
          <FaSyncAlt className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Leads"}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && leadsData.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007070] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      ) : (
        <>
          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
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
              {[
                { label: "All Locations", value: "All" },
                { label: "Vashi", value: "Vashi" },
                { label: "Sanpada", value: "Sanpada" },
                { label: "Kharghar", value: "Kharghar" },
              ].map((loc) => (
                <option key={loc} value={loc.label}>
                  {loc === "All" ? "All Locations" : loc.value}
                </option>
              ))}
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
              <option value="Sent">Sent</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={managerStatusFilter}
              onChange={(e) => {
                setManagerStatusFilter(e.target.value);
                resetPage();
              }}
            >
              <option value="All">All Manager Status</option>
              <option value="Seen">Seen</option>
              <option value="Delivered">Delivered</option>
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                resetPage();
              }}
            >
              <option value={5}>5 Rows</option>
              <option value={10}>10 Rows</option>
              <option value={20}>20 Rows</option>
              <option value={50}>50 Rows</option>
              <option value={100}>100 Rows</option>
              <option value={150}>150 Rows</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded shadow">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100 uppercase">
                <tr>
                  {[
                    "#",
                    "Location",
                    "Customer",
                    "Phone",
                    "Managers",
                    "Copy",
                    // "Mark"
                    "Send",
                    "Status",
                  ].map((h) => (
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
                    <tr key={lead.id} className="hover:bg-gray-50 text-center relative">
                      <td className="p-3 border relative">
                        {startIndex + index + 1}
                        {/* New Badge (Green Dot) */}
                        {lead.isNew && (
                          <span className="absolute top-1 left-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" title="New Lead (< 5 mins)"></span>
                        )}
                      </td>
                      <td className="p-3 border font-semibold text-gray-500">
                        {lead.location}
                      </td>
                      <td className="p-3 border">{lead.customerName}</td>
                      <td className="p-3 border">{lead.customerPhone}</td>
                      <td className="p-3 border">{lead.totalManagers}</td>

                      {/* COPY */}
                      <td className="p-3 border">
                        <button
                          onClick={() =>
                            copyToClipboard(lead.id, lead.location, lead.customerName, lead.customerPhone)
                          }
                          className={`flex items-center justify-center gap-1 mx-auto ${copiedId === lead.id
                            ? "text-green-600 font-semibold"
                            : "text-[#007070]"
                            }`}
                        >
                          <FaCopy />
                          {copiedId === lead.id ? "Copied" : ""}
                        </button>
                      </td>

                      {/* STATUS + HOVER */}
                      {/* <td className="p-3 border relative group">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${lead.status === "Sent"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {lead.status}
                        </span>

                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 bg-white border rounded shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition z-50">
                          <div className="p-3 text-left">
                            <p className="font-semibold text-sm mb-2">
                              Manager WhatsApp Status
                            </p>

                            {lead.managers.map((mgr, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center text-sm mb-1"
                              >
                                <span>{mgr.name}</span>
                                <span
                                  className={`flex items-center gap-1 ${mgr.status === "Seen"
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                    }`}
                                >
                                  <FaWhatsapp />
                                  {mgr.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td> */}

                      {/* SEND */}
                      <td className="p-3 border cursor-pointer flex justify-center items-center relative">
                        {/* {lead.status === "Sent" ? (
                             <MdOutlineDoneAll className="h-6 w-6 text-green-500 font-extrabold" />
                        ) : (
                            // Show Send Button/Icon
                             <button
                                onClick={() => handleOpenPopover(lead)}
                                className="text-gray-500 hover:text-green-600 transition"
                                title="Forward to Managers"
                             >
                                <FaWhatsapp size={22} />
                             </button>
                        )} */}

                        {/* Always show the send button to allow re-sending or sending to new managers, 
                            bu maybe color it differently if already sent? 
                            User said: "if admin hover on the whatsapp icon in send colom admin can see how many managers"
                        */}
                        <div className="relative">
                          <button
                            onClick={() => handleOpenPopover(lead)}
                            className={`transition ${lead.status === 'Sent' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                          >
                            <FaWhatsapp size={24} />
                          </button>

                          {/* POPOVER */}
                          {activePopover === lead.id && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-4 text-left">
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
                                Active Managers: <span className="font-medium text-gray-700">{lead.managers?.length || 0}</span>
                              </p>

                              {/* Main Actions */}
                              <div className="space-y-2">
                                {/* Send All Button */}
                                <button
                                  onClick={() => handleSendLead(lead, 'all')}
                                  disabled={sendingState.loading || lead.managers.length === 0}
                                  className="w-full bg-[#007070] text-white py-2 rounded text-sm font-medium hover:bg-[#014b4b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {sendingState.loading ? "Sending..." : "Send to All Managers"}
                                  {!sendingState.loading && <MdOutlineDoneAll />}
                                </button>

                                {/* Divider */}
                                <div className="border-t my-2"></div>

                                {/* Individual Managers */}
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                  {lead.managers.length > 0 ? lead.managers.map((mgr, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-1 hover:bg-gray-50 rounded">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        <FaUserTie className="text-gray-400 flex-shrink-0" />
                                        <span className="truncate text-gray-700" title={mgr.name}>{mgr.name}</span>
                                      </div>
                                      {/* We need the ID for individual send. 
                                                        Wait, the mapped managers in fetchLeads only had name/phone/email/status.
                                                        We need to ensure we map the ID too in fetchLeads logic! 
                                                        I need to update fetchLeads to include _id/id.
                                                    */}
                                      {/* Assuming we will fix fetchLeads mapping below this change or have it available */}
                                      {/* Wait, I cannot modify fetchLeads in the same step easily if I missed it.
                                                        Let me check fetchLeads in the ViewFile output...
                                                        Line 69: managers: (lead.managers || []).map(manager => ({
                                                            name: manager.name,
                                                            phone: manager.phone || '', ...
                                                        }))
                                                        
                                                        I missed mapping the ID in the original file view!
                                                        I must update fetchLeads first or in this same multi-replace.
                                                    */}

                                      <button
                                        // Fallback if ID is missing (which it is currently), we can't send individual correctly without ID.
                                        // I will fix the fetchLeads mapping in this same multi_replace call.
                                        onClick={() => handleSendLead(lead, [mgr.id])}
                                        className="text-[#007070] hover:bg-[#e6f2f2] p-1 rounded"
                                        title="Send to this manager only"
                                      >
                                        <MdSend />
                                      </button>
                                    </div>
                                  )) : (
                                    <p className="text-xs text-gray-400 text-center py-2">No managers found.</p>
                                  )}
                                </div>
                              </div>

                              {sendingState.success && (
                                <div className="mt-2 text-xs text-green-600 font-semibold text-center animate-pulse">
                                  Successfully Sent!
                                </div>
                              )}
                              {sendingState.error && (
                                <div className="mt-2 text-xs text-red-600 font-semibold text-center">
                                  {sendingState.error}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </td>

                      {/* status */}
                      <td className="p-3 border">
                        <button
                          onClick={() => sendWhatsApp(lead.customerPhone)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <MdOutlineDoneAll size={20}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
      )}
    </div>
  );
};

export default WhatsappLead;
