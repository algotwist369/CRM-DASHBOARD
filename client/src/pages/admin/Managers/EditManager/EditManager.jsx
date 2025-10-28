import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const EditManager = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Form state
    const [form, setForm] = useState({
        name: "",
        username: "",
        pin: "",
        email: "",
        phone: "",
        businessId: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch existing manager details (mock for now)
    useEffect(() => {
        // Replace this with real API call later
        const mockManager = {
            name: "Amit Sharma",
            username: "amit001",
            pin: "1234",
            email: "amit@example.com",
            phone: "9876543210",
            businessId: "BUS123",
        };
        setForm(mockManager);
    }, [id]);

    // Validation
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.username.trim()) newErrors.username = "Username is required";
        if (!/^\d{4}$/.test(form.pin)) newErrors.pin = "PIN must be exactly 4 digits";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Enter a valid email address";
        if (!/^[6-9]\d{9}$/.test(form.phone))
            newErrors.phone = "Enter a valid 10-digit Indian phone number";
        if (!form.businessId.trim()) newErrors.businessId = "Business ID is required";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);
        try {
            // API call placeholder
            console.log("Updating manager:", form);
            alert("Manager updated successfully!");
            navigate("/dashboard/managers");
        } catch (err) {
            alert("Failed to update manager!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition"
                >
                    <FiArrowLeft className="mr-2" />
                    Back
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Edit Manager</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
                <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        Update Manager Details
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                            )}
                        </div>

                        {/* PIN */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                PIN (4 digits)
                            </label>
                            <input
                                type="password"
                                name="pin"
                                value={form.pin}
                                maxLength={4}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.pin && (
                                <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                maxLength={10}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                            )}
                        </div>

                        {/* Business ID */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                Business ID
                            </label>
                            <input
                                type="text"
                                name="businessId"
                                value={form.businessId}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.businessId && (
                                <p className="text-red-500 text-sm mt-1">{errors.businessId}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                        >
                            {loading ? "Updating..." : "Update Manager"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditManager;
