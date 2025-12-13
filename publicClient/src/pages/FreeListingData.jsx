import React, { useEffect, useState, useCallback } from "react";
import { getAllFreeListing } from '../api';

/** Memoized card component */
const FreeListCard = React.memo(function FreeListCard({ item, onCopy }) {
    const [copiedField, setCopiedField] = useState(null);

    const handleCopy = useCallback((label, value) => {
        if (!value && value !== 0) return;
        onCopy(value);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 1200);
    }, [onCopy]);

    const safeJoin = (arr) => (Array.isArray(arr) && arr.length ? arr.join(", ") : "-");

    const fields = {
        Company: item.companyName ?? "-",
        "Full Name": item.fullName ?? "-",
        Email: item.email ?? "-",
        Phone: item.phoneNumber ?? "-",
        "Business Type": item.businessType ?? "-",
        "Business Name": item.businessName ?? "-",
        Branch: item.branch ?? "-",
        Description: item.description ?? "-",
        Website: item.website ?? "-",
        Address: item.address ?? "-",
        City: item.city ?? "-",
        State: item.state ?? "-",
        Country: item.country ?? "-",
        Zip: item.zipCode ?? "-",
        Category: item.category ?? "-",
        Tags: safeJoin(item.tags),
        Services: safeJoin(item.services),
        Documents: safeJoin(item.documents),
        "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
    };

    return (
        <div className="bg-white border rounded-lg shadow p-5 hover:shadow-lg transition-all">
            <h2 className="text-xl font-semibold mb-4">{item.companyName ?? "—"}</h2>

            <div className="space-y-3">
                {Object.entries(fields).map(([label, value]) => (
                    <div key={label} className="text-sm flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <span className="font-semibold text-gray-700">{label}: </span>

                            {label === "Website" && value && value !== "-" ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-words"
                                >
                                    {value}
                                </a>
                            ) : label === "Documents" && Array.isArray(item.documents) && item.documents.length ? (
                                <div className="flex flex-col gap-1">
                                    {item.documents.map((docUrl, i) => (
                                        <a
                                            key={i}
                                            href={docUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline break-words text-sm"
                                        >
                                            {docUrl}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-800 break-words">{value ?? "-"}</span>
                            )}
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={() => handleCopy(label, value)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                            aria-label={`Copy ${label}`}
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

const FreeListingData = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // single API call on mount (no duplicate calls)
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getAllFreeListing();
                console.log("Free listings API response:", res);

                // Pick the array from res.data if present, otherwise try res directly
                const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

                // Deduplicate by _id (keeps first occurrence)
                const map = new Map();
                for (const item of raw) {
                    if (!item || !item._id) continue;
                    if (!map.has(item._id)) map.set(item._id, item);
                }
                const unique = Array.from(map.values());

                setRows(unique);
            } catch (error) {
                console.error("Error fetching free listings:", error);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // empty deps => only run once

    const copyToClipboard = useCallback((value) => {
        if (!value && value !== 0) return;

        const text = Array.isArray(value) ? value.join(", ") : String(value);

        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(text).catch(() => { });
            return;
        }

        // fallback
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.position = "absolute";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        } catch (e) {
            // ignore
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                    Free Listing Data
                </h1>

                {loading ? (
                    <div className="text-center text-gray-500">Loading data…</div>
                ) : rows.length === 0 ? (
                    <div className="text-center text-gray-500">No listings found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rows.map((item) => (
                            <FreeListCard key={item._id} item={item} onCopy={copyToClipboard} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreeListingData;
