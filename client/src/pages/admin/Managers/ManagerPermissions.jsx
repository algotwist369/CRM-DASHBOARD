import React from 'react';
import { FaUserShield, FaInfoCircle } from 'react-icons/fa';
import BackButton from '../../../components/common/Button/BackButton';

const ManagerPermissions = () => {
    // This page will allow configuring granular permissions for managers
    // Connected to the Phase 2 permissionMiddleware

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaUserShield className="text-primary-600" />
                    Manager Permissions
                </h1>
                <p className="text-gray-600 mt-1">Configure granular access control for managers</p>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg text-center">
                <FaInfoCircle className="text-purple-600 text-4xl mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-purple-900 mb-2">Permission Manager Coming Soon</h2>
                <p className="text-purple-700">
                    Configure which managers can view sales, approve expenses, manage staff, and more.
                </p>
            </div>

            {/* Placeholder Permission Matrix */}
            <div className="mt-6 bg-white border border-gray-200 p-6 opacity-50">
                <h3 className="font-semibold text-gray-900 mb-4">Permission Matrix (Preview)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm font-medium">View Sales</p>
                        <p className="text-xs text-gray-500">Access sales reports</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm font-medium">Approve Expenses</p>
                        <p className="text-xs text-gray-500">Approve team expenses</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm font-medium">Manage Staff</p>
                        <p className="text-xs text-gray-500">Add/edit staff members</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm font-medium">View Cost Prices</p>
                        <p className="text-xs text-gray-500">See product costs</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerPermissions;
