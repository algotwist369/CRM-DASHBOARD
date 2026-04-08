import { useState, useCallback, useEffect } from "react";

const useBusinessForm = (initialState) => {
    // Load initial state from localStorage if available
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem("create_business_form");
        return saved ? JSON.parse(saved) : initialState;
    });
    const [errors, setErrors] = useState({});

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem("create_business_form", JSON.stringify(formData));
    }, [formData]);

    const clearForm = useCallback(() => {
        localStorage.removeItem("create_business_form");
        setFormData(initialState);
    }, [initialState]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes(".")) {
            const parts = name.split(".");
            setFormData((prev) => {
                let newData = { ...prev };
                let current = newData;
                for (let i = 0; i < parts.length - 1; i++) {
                    current[parts[i]] = { ...current[parts[i]] };
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = type === "checkbox" ? checked : value;
                return newData;
            });
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleArrayAdd = useCallback((field, val) => {
        if (!val) return;
        const parts = field.split(".");
        setFormData((prev) => {
            let newData = { ...prev };
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            const targetArr = current[parts[parts.length - 1]] || [];
            current[parts[parts.length - 1]] = [...targetArr, val];
            return newData;
        });
    }, []);

    const handleArrayRemove = useCallback((field, index) => {
        const parts = field.split(".");
        setFormData((prev) => {
            let newData = { ...prev };
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = current[parts[parts.length - 1]].filter((_, i) => i !== index);
            return newData;
        });
    }, []);

    const setNestedValue = useCallback((name, value) => {
        const parts = name.split(".");
        setFormData((prev) => {
            let newData = { ...prev };
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newData;
        });
    }, []);

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        handleChange,
        handleArrayAdd,
        handleArrayRemove,
        setNestedValue,
        clearForm
    };
};

export default useBusinessForm;
