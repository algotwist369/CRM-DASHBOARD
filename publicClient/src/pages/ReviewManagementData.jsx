import React, { useEffect, useState, useCallback } from "react";

/** Memoized table row — avoids unnecessary re-renders */
const ReviewRow = React.memo(function ReviewRow({ item, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(item.phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [onCopy, item.phoneNumber]);

  // display values
  const display = {
    businessName: item.businessName,
    fullName: item.fullName,
    email: item.email,
    phoneNumber: item.phoneNumber,
    reviewPlatform: item.reviewPlatform,
    targetReviewCount: item.targetReviewCount,
    businessLink: item.businessLink,
    message: item.message,
    terms: item.terms ? "Yes" : "No",
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
  };

  // updatedAt removed from ordering
  const cellOrder = [
    "businessName",
    "fullName",
    "email",
    "phoneNumber",
    "reviewPlatform",
    "targetReviewCount",
    "businessLink",
    "message",
    "terms",
    "createdAt",
  ];

  return (
    <tr className="border-t hover:bg-gray-50 align-top">
      {cellOrder.map((key) => (
        <td key={key} className="p-3 border text-sm max-w-xs break-words">
          {key === "businessLink" && display[key] ? (
            <a
              href={display[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open
            </a>
          ) : (
            display[key] ?? "-"
          )}
        </td>
      ))}

      <td className="p-3 border text-center whitespace-nowrap">
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </td>
    </tr>
  );
},
(prev, next) => prev.item === next.item && prev.onCopy === next.onCopy
);

const ReviewManagementData = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // dummy response
    const sample = [
      {
        _id: "6939575f3c72c06b73b9be37",
        businessName: "DOS",
        fullName: "Disha Online Solution",
        email: "ankitdos14@gmail.com",
        phoneNumber: "917388480128",
        reviewPlatform: "Google",
        targetReviewCount: "1000",
        businessLink: "https://zenithwellness.com/mumbai",
        message: "sdfhsfgjsfjg",
        terms: true,
        createdAt: "2025-12-10T11:19:59.877+00:00",
      },
    ];

    const t = setTimeout(() => setRows(sample), 200);
    return () => clearTimeout(t);
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  // updatedAt removed from table headers
  const headers = [
    "Business",
    "Full Name",
    "Email",
    "Phone",
    "Platform",
    "Target Count",
    "Business Link",
    "Message",
    "Terms",
    "Created At",
    "Copy",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Review Management
        </h1>

      <div className="overflow-x-auto bg-white rounded border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="p-3 border text-left text-xs font-medium tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <ReviewRow key={r._id} item={r} onCopy={copyToClipboard} />
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-6 text-center text-gray-500">Loading reviews…</div>
        )}
      </div>
    </div>
  </div>
  );
};

export default ReviewManagementData;
