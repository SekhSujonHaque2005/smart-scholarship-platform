/**
 * INT219 Requirement: Closures Utility
 * Demonstrates the use of closures for state encapsulation and private variables.
 */

/**
 * Creates a counter using closure to keep the count private.
 * @returns {Object} - Object with increment and getCount methods.
 */
export const createCounter = () => {
    let count = 0; // Private variable
    return {
        increment: () => {
            count++;
            return count;
        },
        getCount: () => count
    };
};

/**
 * Creates a debounced function using closure to track the timer state.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - Wait time in milliseconds.
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
