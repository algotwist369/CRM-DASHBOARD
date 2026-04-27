import { ReactNode } from "react";

export interface User {
    createdAt?: string | null;
    _id: string;
    name: string;
    mobileNumber: string;
    walletBalance?: number;
    points?: number;
    activePlan?: MembershipPlan;
}

export interface MembershipPlan {
    _id: string;
    name: string;
    price: number;
    validityDays: number;
    creditAmount: number;
    description: string;
    status: string;
}

export interface Transaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    date: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    requestOtp: (name: string, mobileNumber: string) => Promise<void>;
    verifyOtp: (name: string, mobileNumber: string, otp: string) => Promise<void>;
    fetchMe: () => Promise<void>;
    logout: () => void;
}

export interface WalletState {
    balance: number;
    transactions: Transaction[];
    activePlanName: string;
    fetchWallet: () => Promise<void>;
    addMoney: (amount: number) => void;
    purchasePlan: (plan: MembershipPlan) => void;
}

export interface AdminUser {
    _id?: string;
    name?: string;
    mobileNumber?: string;
    role?: string;
}

export interface AdminMembership {
    paymentType: ReactNode;
    razorpayPaymentId: ReactNode;
    _id?: string;
    customerName?: string;
    mobileNumber?: string;
    amountPaid?: number;
    walletBalance?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    planId?: {
        _id?: string;
        name?: string;
        price?: number;
        creditAmount?: number;
        validityDays?: number;
    };
}

export interface AdminRedemption {
    _id?: string;
    customerName?: string;
    mobileNumber?: string;
    deductedAmount?: number;
    redeemedAt?: string;
    planName?: string;
    serviceId?: {
        _id?: string;
        name?: string;
    };
    status?: string;
}

export interface AdminTransaction {
    id: string;
    type: string;
    date: string;
    mobileNumber: string;
    name: string;
    details: string;
    amount: number;
}

export interface AdminAuthState {
    user: AdminUser | null;
    token: string | null;
    role: string | null;
    isAuthenticated: boolean;
    requestOtp: (mobileNumber: string) => Promise<void>;
    verifyOtp: (mobileNumber: string, otp: string) => Promise<void>;
    logout: () => void;
}

export interface AdminMembershipsState {
    memberships: AdminMembership[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
    isLoading: boolean;
    fetchMemberships: (params: {
        page: number;
        limit: number;
        search: string;
        statusFilter: string;
    }) => Promise<void>;
}

export interface AdminRedemptionsState {
    redemptions: AdminRedemption[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
    isLoading: boolean;
    fetchRedemptions: (params: {
        page: number;
        limit: number;
        search: string;
    }) => Promise<void>;
}

export interface AdminTransactionsState {
    transactions: AdminTransaction[];
    isLoading: boolean;
    fetchTransactions: (limit: number) => Promise<void>;
}


export const _types = true;
