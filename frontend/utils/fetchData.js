/**
 * INT219 Requirement: Generic fetchData function
 * A reusable, generic wrapper for making API calls with error handling.
 */

import axios from 'axios';

/**
 * Generic fetcher using Axios
 * @param {string} url - API endpoint
 * @param {Object} options - Request options (method, headers, data)
 */
export const fetchData = async (url, options = {}) => {
    const { 
        method = 'GET', 
        headers = {}, 
        data = null, 
        params = {} 
    } = options;

    try {
        const response = await axios({
            url,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            data,
            params
        });

        return {
            data: response.data,
            status: response.status,
            success: true
        };
    } catch (error) {
        console.error(`[API Error]: ${url}`, error.response?.data || error.message);
        return {
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500,
            success: false
        };
    }
};
