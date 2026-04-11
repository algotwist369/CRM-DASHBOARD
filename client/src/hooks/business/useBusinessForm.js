import { useState, useCallback, useEffect } from "react";

const useBusinessForm = (initialState, storageKey = null) => {
    // Load initial state from localStorage if storageKey is provided
    const [formData, setFormData] = useState(() => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : initialState;
        }
        return initialState;
    });
    const [errors, setErrors] = useState({});

    // Sync with localStorage
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(formData));
        }
    }, [formData, storageKey]);

    const clearForm = useCallback(() => {
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
        setFormData(initialState);
    }, [initialState, storageKey]);

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
            setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

    const handleFileChange = useCallback((field, file) => {
        setFormData((prev) => {
            const newFiles = { ...prev.files };
            if (field.includes("gallery")) {
                const galleryFiles = Array.isArray(newFiles.gallery) ? [...newFiles.gallery] : [];
                if (file) {
                    galleryFiles.push(file);
                }
                newFiles.gallery = galleryFiles;
            } else {
                newFiles[field] = file;
            }
            return { ...prev, files: newFiles };
        });
    }, []);

    const handleFileRemove = useCallback((field, index) => {
        setFormData((prev) => {
            const newFiles = { ...prev.files };
            if (field === "gallery" && index !== undefined) {
                newFiles.gallery = newFiles.gallery.filter((_, i) => i !== index);
            } else {
                delete newFiles[field];
            }
            return { ...prev, files: newFiles };
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
        handleFileChange,
        handleFileRemove,
        clearForm
    };
};

export default useBusinessForm;
