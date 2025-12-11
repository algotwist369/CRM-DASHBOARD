import React, { useEffect, useState, useCallback } from "react";

/** Memoized card component */
const DemoCard = React.memo(function DemoCard({ item, onCopy }) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = useCallback((label, value) => {
    onCopy(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1200);
  }, [onCopy]);

  // Fields to be displayed
  const fields = {
    "Full Name": item.fullName,
    "Business Name": item.businessName,
    Email: item.email,
    Phone: item.phoneNumber,
    "Team Size": item.teamSize,
    "Primary Objective": item.primaryObjective,
    Message: item.message,
    "Completed?": item.isCompleted ? "Yes" : "No",
    "Created At": new Date(item.createdAt).toLocaleString(),
  };

  return (
    <div className="bg-white border rounded-lg shadow p-5 hover:shadow-lg transition-all">
      <h2 className="text-xl font-semibold mb-3">{item.fullName}</h2>

      <div className="space-y-3">
        {Object.entries(fields).map(([label, value]) => (
          <div key={label} className="text-sm flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="font-semibold text-gray-700">{label}: </span>
              <span className="text-gray-800 break-words">{value || "-"}</span>
            </div>

            {/* Copy Button */}
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

const BookDemoData = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Dummy sample data
    const sample = [
      {
        _id: "693954d52640b2ce1dab9404",
        fullName: "Disha Online Solution",
        businessName: "DOS",
        email: "ankitdos14@gmail.com",
        phoneNumber: "917388480128",
        teamSize: "10-12",
        primaryObjective: "all-in-one",
        message: "sdgsdtgjdgfjdfgjdgjdfj",
        isCompleted: false,
        createdAt: "2025-12-10T11:09:09.369Z",
      },
      {
        _id: "693955629cbaefa14194e1b0",
        fullName: "Disha Online Solution",
        businessName: "DOS",
        email: "ankitdos14@gmail.com",
        phoneNumber: "917388480128",
        teamSize: "10-12",
        primaryObjective: "streamline-ops",
        message: "dfjghgsjfsfgjsfgjs",
        isCompleted: false,
        createdAt: "2025-12-10T11:11:30.726Z",
      },
    ];

    const t = setTimeout(() => setRows(sample), 200);
    return () => clearTimeout(t);
  }, []);

  const copyToClipboard = useCallback((value) => {
    if (value) navigator.clipboard.writeText(value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Book Demo Submissions
        </h1>

        {rows.length === 0 ? (
          <div className="text-center text-gray-500">Loading data…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((item) => (
              <DemoCard key={item._id} item={item} onCopy={copyToClipboard} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDemoData;
