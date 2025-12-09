import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const CashReconciliationForm = ({
    openingBalance = 0,
    expectedCashClosing = 0,
    onSubmit,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        actualCashClosing: '',
        varianceReason: '',
        internalNotes: ''
    });

    const [variance, setVariance] = useState(0);
    const [hasVariance, setHasVariance] = useState(false);

    useEffect(() => {
        if (formData.actualCashClosing) {
            const actual = parseFloat(formData.actualCashClosing);
            const calculated = parseFloat(expectedCashClosing);
            const diff = actual - calculated;
            setVariance(diff);
            setHasVariance(Math.abs(diff) > 100); // Variance threshold: ₹100
        } else {
            setVariance(0);
            setHasVariance(false);
        }
    }, [formData.actualCashClosing, expectedCashClosing]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.actualCashClosing) {
            alert('Please enter actual cash closing balance');
            return;
        }

        if (hasVariance && !formData.varianceReason.trim()) {
            alert('Variance reason is required when difference exceeds ₹100');
            return;
        }

        if (onSubmit) {
            onSubmit({
                actualCashClosing: parseFloat(formData.actualCashClosing),
                varianceReason: formData.varianceReason,
                internalNotes: formData.internalNotes,
                variance
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cash Summary Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Cash Summary</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Opening Cash Balance</span>
                        <span className="font-semibold text-gray-900">₹{openingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expected Cash Closing</span>
                        <span className="font-bold text-lg text-primary-600">₹{expectedCashClosing.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Based on today's cash transactions (revenue - expenses)
                    </p>
                </div>
            </div>

            {/* Actual Cash Closing */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Cash Closing (₹) *
                </label>
                <input
                    type="number"
                    value={formData.actualCashClosing}
                    onChange={(e) => setFormData({ ...formData, actualCashClosing: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Count all cash in the register and enter the amount
                </p>
            </div>

            {/* Variance Display */}
            {formData.actualCashClosing && (
                <div className={`p-4 rounded-lg border ${hasVariance
                        ? 'bg-yellow-50 border-yellow-200'
                        : Math.abs(variance) < 1
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {hasVariance ? (
                            <>
                                <FaExclamationTriangle className="text-yellow-600" />
                                <span className="font-semibold text-yellow-900">Cash Variance Detected!</span>
                            </>
                        ) : Math.abs(variance) < 1 ? (
                            <>
                                <FaCheckCircle className="text-green-600" />
                                <span className="font-semibold text-green-900">Perfect Match!</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="text-blue-600" />
                                <span className="font-semibold text-blue-900">Minor Variance</span>
                            </>
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className={hasVariance ? 'text-yellow-700' : 'text-gray-700'}>
                                Difference:
                            </span>
                            <span className={`font-bold ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                {variance > 0 ? '+' : ''}₹{variance.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className={hasVariance ? 'text-yellow-700' : 'text-gray-700'}>
                                Percentage:
                            </span>
                            <span className="font-semibold">
                                {expectedCashClosing > 0
                                    ? `${((variance / expectedCashClosing) * 100).toFixed(2)}%`
                                    : '—'}
                            </span>
                        </div>
                    </div>
                    {hasVariance && (
                        <p className="text-xs text-yellow-600 mt-2">
                            ⚠️ Variance exceeds ₹100 threshold. Please provide a reason below.
                        </p>
                    )}
                </div>
            )}

            {/* Variance Reason (Required if variance > 100) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variance Reason {hasVariance && <span className="text-red-600">*</span>}
                </label>
                <textarea
                    value={formData.varianceReason}
                    onChange={(e) => setFormData({ ...formData, varianceReason: e.target.value })}
                    rows="3"
                    placeholder={
                        hasVariance
                            ? 'Explain the cash difference (required)...'
                            : 'Explain any cash difference (optional)...'
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${hasVariance ? 'border-yellow-300' : 'border-gray-300'
                        }`}
                    required={hasVariance}
                />
            </div>

            {/* Internal Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                </label>
                <textarea
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    rows="3"
                    placeholder="Any additional observations about today's business..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Processing...' : 'Close Day & Reconcile Cash'}
                </button>
            </div>
        </form>
    );
};

CashReconciliationForm.propTypes = {
    openingBalance: PropTypes.number.isRequired,
    expectedCashClosing: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default CashReconciliationForm;
