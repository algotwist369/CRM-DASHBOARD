import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const MultiInput = ({
    label,
    value = [],
    onChange,
    onRemove,
    placeholder = "Add and press Enter",
    error,
    helperText,
    className = "",
    badgeColor = "bg-primary-50 text-primary-700 border-primary-100",
}) => {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange(inputValue.trim());
            setInputValue("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={placeholder}
                    className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-200 border-2 bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-800 placeholder:text-gray-400 ${error ? "border-red-500 focus:ring-red-500/20" : ""
                        }`}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                    <FaPlus />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {value.map((item, index) => (
                    <span
                        key={index}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${badgeColor}`}
                    >
                        {item}
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="hover:text-red-500 transition-colors"
                        >
                            <FaTimes className="text-xs" />
                        </button>
                    </span>
                ))}
            </div>

            {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default MultiInput;
