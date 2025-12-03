import React from 'react'
import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className="mb-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"
        >
            <FaChevronLeft className="text-lg" /> Back
        </button>
    )
}

export default BackButton