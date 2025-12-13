import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaExclamationTriangle, FaCheckCircle, FaBuilding, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import dailyBusinessService from '../../../../services/manager/dailyBusinessService';
import adminService from '../../../../services/admin/adminService';
import BackButton from '../../../../components/common/Button/BackButton';

// Initial states
const INITIAL_INIT_DATA = {
    businessId: '',
    date: new Date().toISOString().split('T')[0],
    openingCashBalance: ''
};

const INITIAL_CLOSE_DATA = {
    actualCashClosing: '',
    varianceReason: '',
    internalNotes: ''
};

const AdminCloseDailyBusiness = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [dailyBusinessId, setDailyBusinessId] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [loadingBusinesses, setLoadingBusinesses] = useState(true);
    const [initData, setInitData] = useState(INITIAL_INIT_DATA);
    const [closeData, setCloseData] = useState(INITIAL_CLOSE_DATA);
    const [calculatedData, setCalculatedData] = useState(null);
    const [loading, setLoading] = useState(false);

    const isMountedRef = useRef(true);

    // Fetch businesses on mount
    useEffect(() => {
        isMountedRef.current = true;
        const fetchBusinesses = async () => {
            try {
                const response = await adminService.getBusinesses({ limit: 100 });
                if (isMountedRef.current && response.success) {
                    setBusinesses(response.data?.businesses || response.data || []);
                }
            } catch (error) {
                if (isMountedRef.current) {
                    toast.error('Failed to fetch businesses');
                }
            } finally {
                if (isMountedRef.current) {
                    setLoadingBusinesses(false);
                }
            }
        };
        fetchBusinesses();
        return () => { isMountedRef.current = false; };
    }, []);

    const handleInitialize = useCallback(async () => {
        if (!initData.businessId) {
            toast.error('Please select a business');
            return;
        }
        if (!initData.openingCashBalance) {
            toast.error('Please enter opening cash balance');
            return;
        }

        try {
            setLoading(true);
            const response = await dailyBusinessService.addDailyBusiness({
                businessId: initData.businessId,
                date: initData.date,
                openingCashBalance: parseFloat(initData.openingCashBalance),
                status: 'open'
            });

            if (response.success) {
                toast.success('Day initialized successfully');
                setDailyBusinessId(response.data._id || response.data.data?._id);
                setCalculatedData(response.data.data || response.data);
                setStep(2);
            } else {
                toast.error(response.error || 'Failed to initialize');
            }
        } catch (error) {
            toast.error('Failed to initialize day');
        } finally {
            setLoading(false);
        }
    }, [initData]);

    const handleClose = useCallback(async () => {
        if (!closeData.actualCashClosing) {
            toast.error('Please enter actual cash closing balance');
            return;
        }

        try {
            setLoading(true);
            const response = await dailyBusinessService.updateDailyBusiness(dailyBusinessId, {
                actualCashClosing: parseFloat(closeData.actualCashClosing),
                varianceReason: closeData.varianceReason,
                internalNotes: closeData.internalNotes,
                status: 'closed'
            });

            if (response.success) {
                toast.success('Day closed successfully');
                setCalculatedData(response.data.data || response.data);
                setStep(3);
            } else {
                toast.error(response.error || 'Failed to close day');
            }
        } catch (error) {
            toast.error('Failed to close day');
        } finally {
            setLoading(false);
        }
    }, [dailyBusinessId, closeData]);

    const handleReset = useCallback(() => {
        setStep(1);
        setDailyBusinessId(null);
        setInitData({ ...INITIAL_INIT_DATA, date: new Date().toISOString().split('T')[0] });
        setCloseData(INITIAL_CLOSE_DATA);
        setCalculatedData(null);
    }, []);

    const handleViewRecords = useCallback(() => {
        navigate('/admin/daily-business');
    }, [navigate]);

    const handleInitDataChange = useCallback((field, value) => {
        setInitData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCloseDataChange = useCallback((field, value) => {
        setCloseData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Memoized computed values
    const cashVariance = useMemo(() => {
        if (!closeData.actualCashClosing || !calculatedData?.cashHandling?.expectedCashClosing) {
            return 0;
        }
        return Math.abs(parseFloat(closeData.actualCashClosing) - calculatedData.cashHandling.expectedCashClosing);
    }, [closeData.actualCashClosing, calculatedData?.cashHandling?.expectedCashClosing]);

    const hasSignificantVariance = useMemo(() => cashVariance > 100, [cashVariance]);

    const selectedBusiness = useMemo(() =>
        businesses.find(b => b._id === initData.businessId),
        [businesses, initData.businessId]
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaCalendarCheck className="text-primary-600" />
                    Admin Daily Business Closing
                </h1>
                <p className="text-gray-600 mt-1">Initialize and close daily business for any business</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            1
                        </div>
                        <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            2
                        </div>
                        <div className={`w-24 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            ✓
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-2 text-sm text-gray-600">
                    <span className="w-24 text-center">Select & Init</span>
                    <span className="w-24 text-center">Close Day</span>
                    <span className="w-24 text-center">Complete</span>
                </div>
            </div>

            {/* Step 1: Initialize */}
            {step === 1 && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Step 1: Select Business & Initialize Day</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <FaBuilding className="inline mr-2" />
                                    Select Business *
                                </label>
                                {loadingBusinesses ? (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FaSpinner className="animate-spin" />
                                        Loading businesses...
                                    </div>
                                ) : (
                                    <select
                                        value={initData.businessId}
                                        onChange={(e) => handleInitDataChange('businessId', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a business...</option>
                                        {businesses.map((business) => (
                                            <option key={business._id} value={business._id}>
                                                {business.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date *</label>
                                <input
                                    type="date"
                                    value={initData.date}
                                    onChange={(e) => handleInitDataChange('date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Opening Cash Balance (₹) *</label>
                                <input
                                    type="number"
                                    value={initData.openingCashBalance}
                                    onChange={(e) => handleInitDataChange('openingCashBalance', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Cash in register at start of day</p>
                            </div>
                            <button
                                onClick={handleInitialize}
                                disabled={loading || loadingBusinesses}
                                className="w-full px-4 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded font-medium disabled:opacity-50"
                            >
                                {loading ? 'Initializing...' : 'Initialize Day'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Close Day */}
            {step === 2 && calculatedData && (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-800">
                            <FaBuilding className="inline mr-2" />
                            Closing day for: <strong>{selectedBusiness?.name || 'Selected Business'}</strong>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Summary Card */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                            <h3 className="font-semibold mb-4">Today's Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Opening Cash:</span>
                                    <span className="font-semibold">₹{calculatedData.openingCashBalance?.toLocaleString() || calculatedData.cashHandling?.openingBalance?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cash Revenue:</span>
                                    <span className="font-semibold text-green-600">₹{calculatedData.revenueByPaymentMethod?.cash?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cash Expenses:</span>
                                    <span className="font-semibold text-red-600">₹{calculatedData.expensesByCategory?.total?.toLocaleString() || 0}</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Expected Cash:</span>
                                        <span className="font-bold text-lg">₹{calculatedData.cashHandling?.expectedCashClosing?.toLocaleString() || calculatedData.openingCashBalance?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Close Form */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                            <h3 className="font-semibold mb-4">Close Day</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Actual Cash Closing (₹) *</label>
                                    <input
                                        type="number"
                                        value={closeData.actualCashClosing}
                                        onChange={(e) => handleCloseDataChange('actualCashClosing', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="0"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Count cash in register</p>
                                </div>

                                {closeData.actualCashClosing && hasSignificantVariance && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <div className="flex items-center gap-2 text-yellow-800">
                                            <FaExclamationTriangle />
                                            <span className="font-medium">Cash Variance Detected!</span>
                                        </div>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Difference: ₹{cashVariance.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Variance Reason {hasSignificantVariance && '*'}
                                    </label>
                                    <textarea
                                        value={closeData.varianceReason}
                                        onChange={(e) => handleCloseDataChange('varianceReason', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        rows="2"
                                        placeholder="Explain any cash difference..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Internal Notes</label>
                                    <textarea
                                        value={closeData.internalNotes}
                                        onChange={(e) => handleCloseDataChange('internalNotes', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        rows="2"
                                        placeholder="Any additional notes..."
                                    />
                                </div>

                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Closing...' : 'Close Day'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && calculatedData && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-gray-200 p-8 rounded-lg text-center">
                        <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Day Closed Successfully!</h2>
                        <p className="text-gray-600 mb-6">Daily business for {selectedBusiness?.name || 'the business'} has been finalized</p>

                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-xl font-bold text-gray-900">₹{calculatedData.totalIncome?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Expenses</p>
                                    <p className="text-xl font-bold text-gray-900">₹{calculatedData.totalExpenses?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Net Profit</p>
                                    <p className="text-xl font-bold text-green-600">₹{calculatedData.netProfit?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Cash Variance</p>
                                    <p className={`text-xl font-bold ${Math.abs(calculatedData.cashHandling?.variance || 0) > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        ₹{Math.abs(calculatedData.cashHandling?.variance || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleViewRecords}
                                className="flex-1 px-4 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded font-medium"
                            >
                                View All Records
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded font-medium"
                            >
                                Close Another Day
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCloseDailyBusiness;
