import React, { useEffect, useState, useCallback } from "react";
import { getAllAdvertiset, deleteAdvertise } from '../api';

/** Memoized card component */
const AdvertiseCard = React.memo(function AdvertiseCard({ item, onCopy }) {
    const [copiedField, setCopiedField] = useState(null);

    const handleCopy = useCallback(
        (label, value) => {
            if (!value && value !== 0) return;
            onCopy(value);
            setCopiedField(label);
            setTimeout(() => setCopiedField(null), 1200);
        },
        [onCopy]
    );

    const fields = {
        Name: item.name,
        Company: item.company,
        Email: item.email,
        Phone: item.phone,
        Website: item.website,
        Budget: item.budget,
        Timeline: item.timeline,
        Message: item.message,
        "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
        "Updated At": item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-",
    };

    return (
        <div className="bg-white border rounded-lg shadow p-5 hover:shadow-lg transition-all">
            <h2 className="text-lg font-semibold mb-3">{item.name} — <span className="text-sm font-medium text-gray-600">{item.company}</span></h2>

            <div className="space-y-3">
                {Object.entries(fields).map(([label, value]) => (
                    <div key={label} className="text-sm flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <span className="font-semibold text-gray-700">{label}: </span>

                            {label === "Website" && value ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-words"
                                >
                                    {value}
                                </a>
                            ) : (
                                <span className="text-gray-800 break-words">{value ?? "-"}</span>
                            )}
                        </div>

                        <button
                            onClick={() => handleCopy(label, value)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                        >
                            {copiedField === label ? "Copied!" : "Copy"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
},
(prev, next) => prev.item === next.item && prev.onCopy === next.onCopy
);

const AdertiseData = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch actual backend API data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllAdvertiset();

                console.log("API Response:", res);

                // If backend returns { data: [...] }
                if (res?.data) setRows(res.data);

                // If backend returns [...] directly
                else if (Array.isArray(res)) setRows(res);

                else setRows([]);

            } catch (error) {
                console.error("Error fetching advertise data:", error);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const copyToClipboard = useCallback((value) => {
        if (!value && value !== 0) return;

        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(String(value)).catch(() => {});
            return;
        }

        // fallback for older browsers
        try {
            const ta = document.createElement("textarea");
            ta.value = String(value);
            ta.setAttribute("readonly", "");
            ta.style.position = "absolute";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        } catch (e) {}
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">Advertise Submissions</h1>

                {loading ? (
                    <div className="text-center text-gray-500">Loading submissions…</div>
                ) : rows.length === 0 ? (
                    <div className="text-center text-gray-500">No submissions found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rows.map((item) => (
                            <AdvertiseCard key={item._id} item={item} onCopy={copyToClipboard} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdertiseData;
