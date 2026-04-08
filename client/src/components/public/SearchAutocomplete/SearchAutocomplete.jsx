import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiMapPin, FiSearch, FiX, FiLoader } from 'react-icons/fi';
import googlePlacesService from '../../../services/public/googlePlacesService';
import './SearchAutocomplete.css';

/**
 * Premium Autocomplete Component with Google Places API
 * Features: Debounced search, keyboard navigation, glassmorphism UI
 */
const SearchAutocomplete = ({
    value = '',
    onChange,
    onSelect,
    onSubmit,
    placeholder = 'Search locations...',
    icon: Icon = FiMapPin,
    debounceMs = 500,
    className = '',
    userLocation = null,
    mode = 'business',
    biasLocation = null
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [apiEnabled, setApiEnabled] = useState(true);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceTimer = useRef(null);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            googlePlacesService.cancelPending();
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    // Debounced autocomplete fetch
    const fetchSuggestions = useCallback(async (input) => {
        if (!input || input.trim().length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            let result;
            if (mode === 'location') {
                const options = {};
                if (biasLocation && Array.isArray(biasLocation) && biasLocation.length === 2) {
                    options.location = `${biasLocation[0]},${biasLocation[1]}`;
                    options.radius = 50000;
                } else if (userLocation?.lat && userLocation?.lng) {
                    options.location = `${userLocation.lat},${userLocation.lng}`;
                    options.radius = 50000;
                }
                result = await googlePlacesService.getAutocomplete(input, options);
            } else {
                const lat = userLocation?.lat;
                const lng = userLocation?.lng;
                result = await googlePlacesService.getBusinessAutocomplete(input, 20, lat, lng);
            }

            if (result.success) {
                setSuggestions(result.suggestions || []);
                setApiEnabled(true);
                setIsOpen(result.suggestions && result.suggestions.length > 0);
            } else {
                setSuggestions([]);
                setApiEnabled(false);
            }
        } catch (error) {
            console.error('Autocomplete error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle input change with debouncing
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange && onChange(newValue);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new debounce timer
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, debounceMs);
    };

    // Handle suggestion selection
    const handleSelect = (suggestion) => {
        const selectedText = suggestion.displayText || suggestion.name || suggestion.description || suggestion.main_text;
        setInputValue(selectedText);
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);

        if (onSelect) {
            onSelect(suggestion);
        } else if (onChange) {
            onChange(selectedText);
        }
    };

    // Clear input
    const handleClear = () => {
        setInputValue('');
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        onChange && onChange('');
        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                setIsOpen(false);
                // Trigger parent onChange to signal search should happen
                if (onChange) {
                    onChange(inputValue);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelect(suggestions[selectedIndex]);
                } else {
                    setIsOpen(false);
                    if (onSubmit) {
                        onSubmit(inputValue);
                    }
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedItem = dropdownRef.current.children[selectedIndex];
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className={`relative w-full ${className}`}>
            <div className={`
                flex items-center px-4 py-2 bg-white border rounded-xl transition-all duration-200
                ${isOpen ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-lg' : 'border-gray-200 hover:border-primary-300 hover:shadow-md'}
                focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:shadow-lg
            `}>
                <div className="flex-shrink-0 text-gray-400 group-focus-within:text-primary-500 mr-3 transition-colors">
                    <Icon className={`w-5 h-5 ${isOpen ? 'text-primary-500' : ''}`} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm font-medium h-8"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    autoComplete="off"
                    spellCheck="false"
                />

                <div className="flex-shrink-0 ml-2">
                    {isLoading ? (
                        <FiLoader className="w-4 h-4 text-primary-500 animate-spin" />
                    ) : inputValue ? (
                        <FiX
                            className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                            onClick={handleClear}
                        />
                    ) : null}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] max-h-[350px] overflow-y-auto animate-fadeIn"
                >
                    <div className="py-1">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={suggestion.id || suggestion.place_id || index}
                                className={`
                                    flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                                    ${index === selectedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'}
                                `}
                                onClick={() => handleSelect(suggestion)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className={`flex-shrink-0 mt-0.5 ${index === selectedIndex ? 'text-primary-600' : 'text-gray-400'}`}>
                                    <FiMapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium truncate ${index === selectedIndex ? 'text-primary-900' : 'text-gray-900'}`}>
                                        {suggestion.displayText || suggestion.name || suggestion.main_text || suggestion.description}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {suggestion.secondary_text || suggestion.location || suggestion.address || "Location"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Google Attribution */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <img
                            src="http://localhost:5173/logo/main_logo_small.png"
                            alt="Powered by Spa Advisor"
                            className="h-4 opacity-75"
                        />
                    </div>
                </div>
            )}

            {/* Fallback message */}
            {!apiEnabled && inputValue.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-lg z-[60] text-sm">
                    Autocomplete unavailable. Please type manually.
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
