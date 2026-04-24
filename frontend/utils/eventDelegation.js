/**
 * INT219 Requirement: Event Delegation Examples
 * Demonstrates the use of event delegation for high-performance DOM event handling.
 */

/**
 * Attaches an event listener to a parent element to handle events on specific children.
 * Useful for lists, grids, or dynamic content.
 * 
 * @param {HTMLElement} parent - The parent element to listen on.
 * @param {string} selector - The CSS selector for target children.
 * @param {string} event - The event type (e.g., 'click').
 * @param {Function} handler - The event handler function.
 */
export const delegateEvent = (parent, selector, event, handler) => {
    if (!parent) return;

    parent.addEventListener(event, (e) => {
        const targetElement = e.target.closest(selector);
        
        if (targetElement && parent.contains(targetElement)) {
            handler.call(targetElement, e, targetElement);
        }
    });
};

/**
 * Example Usage in the platform:
 * Handling clicks on a long list of scholarship cards using a single listener.
 */
export const initScholarshipListDelegation = (containerId, onCardClick) => {
    const container = document.getElementById(containerId);
    delegateEvent(container, '.scholarship-card', 'click', (e, card) => {
        const scholarshipId = card.getAttribute('data-id');
        onCardClick(scholarshipId);
    });
};
