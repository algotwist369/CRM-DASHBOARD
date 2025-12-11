import React, { useEffect, useState, useCallback } from "react";

// Reusable table row (memoized for zero re-renders)
const Row = React.memo(({ user, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        onCopy(user.phoneNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    }, [onCopy, user.phoneNumber]);

    // Fields map for auto-rendering table cells
    const fields = [
        user.businessName,
        user.phoneNumber,
        user.isVerified ? "✔ Yes" : "✘ No",
    ];

    return (
        <tr className="border-t hover:bg-gray-50">
            {fields.map((val, i) => (
                <td key={i} className="p-3 border text-sm">
                    {val}
                </td>
            ))}

            <td className="p-3 border text-center">
                <button
                    onClick={handleCopy}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </td>
        </tr>
    );
});

const VerifiedUserData = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const dummyData = [
            {
                _id: "69394f244a35e636f843be6d",
                phoneNumber: "7388480128",
                businessName: "Testig pvt",
                isVerified: true,
            },
            {
                _id: "693955624a35e636f843be70",
                phoneNumber: "917388480128",
                businessName: "Disha Online Solution",
                isVerified: true,
            },
        ];
        setTimeout(() => setUsers(dummyData), 300);
    }, []);

    const copyToClipboard = useCallback((text) => {
        navigator.clipboard.writeText(text);
    }, []);

    const tableHeaders = ["Business Name", "Phone Number", "Verified", "Copy"];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">
                    Verified Users
                </h1>

                <div className="overflow-x-auto bg-white rounded border border-gray-200">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                {tableHeaders.map((title) => (
                                    <th
                                        key={title}
                                        className="p-3 border text-left text-xs font-medium tracking-wide"
                                    >
                                        {title}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <Row key={user._id} user={user} onCopy={copyToClipboard} />
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="p-6 text-center text-gray-500">Loading users…</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifiedUserData;
