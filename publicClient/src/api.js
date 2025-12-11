import axios from 'axios';
const apiClient = `http://localhost:5000/api`;

// Fetch all advertise data
export const getAllAdvertiset = async () => {
    try {
        const response = await axios.get(`${apiClient}/advertise`);
        return response.data;
    } catch (error) {
        console.error("Error fetching advertise data:", error);
        throw error;
    }
};

// Delete advertise data by ID
export const deleteAdvertise = async (id) => {
    try {
        const response = await axios.delete(`${apiClient}/advertise/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting advertise data:", error);
        throw error;
    }
};


export const getBookDemoData = async () => {
    try {
        const response = await axios.get(`${apiClient}/book-demo`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book demo data:", error);
        throw error;
    }
};

// get all verified users
export const getAllVerifiedUsers = async () => {
    try {
        const response = await axios.get(`${apiClient}/verified-users`);
        return response.data;
    } catch (error) {
        console.error("Error fetching verified users:", error);
        throw error;
    }
};

// get all review management data
export const getAllReviewManagement = async () => {
    try {
        const response = await axios.get(`${apiClient}/review-management`);
        return response.data;
    } catch (error) {
        console.error("Error fetching review management data:", error);
        throw error;
    }
};

// get all free listing data
export const getAllFreeListing = async () => {
    try {
        const response = await axios.get(`${apiClient}/free-listing`);
        return response.data;
    } catch (error) {
        console.error("Error fetching free listing data:", error);
        throw error;
    }
};