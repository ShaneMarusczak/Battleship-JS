/**
 * @fileoverview DOM manipulation utilities for Battleship.
 * Provides helper functions for common DOM operations.
 * @module utils/dom
 */

"use strict";

/**
 * Gets an element by its ID.
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} The element, or null if not found
 */
export function getById(id) {
    return document.getElementById(id);
}

/**
 * Adds a class to an element by ID.
 * @param {string} id - Element ID
 * @param {string} className - Class name to add
 * @returns {boolean} True if successful, false if element not found
 */
export function addClassById(id, className) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add(className);
        return true;
    }
    return false;
}

/**
 * Removes a class from an element by ID.
 * @param {string} id - Element ID
 * @param {string} className - Class name to remove
 * @returns {boolean} True if successful, false if element not found
 */
export function removeClassById(id, className) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove(className);
        return true;
    }
    return false;
}

/**
 * Toggles a class on an element by ID.
 * @param {string} id - Element ID
 * @param {string} className - Class name to toggle
 * @returns {boolean} True if successful, false if element not found
 */
export function toggleClassById(id, className) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle(className);
        return true;
    }
    return false;
}

/**
 * Checks if an element has a specific class.
 * @param {string} id - Element ID
 * @param {string} className - Class name to check
 * @returns {boolean} True if element has the class
 */
export function hasClassById(id, className) {
    const element = document.getElementById(id);
    return element ? element.classList.contains(className) : false;
}

/**
 * Sets the text content of an element by ID.
 * @param {string} id - Element ID
 * @param {string} text - Text content to set
 * @returns {boolean} True if successful, false if element not found
 */
export function setTextById(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
        return true;
    }
    return false;
}

/**
 * Sets the inner HTML of an element by ID.
 * @param {string} id - Element ID
 * @param {string} html - HTML content to set
 * @returns {boolean} True if successful, false if element not found
 */
export function setHtmlById(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
        return true;
    }
    return false;
}

/**
 * Sets a style property on an element by ID.
 * @param {string} id - Element ID
 * @param {string} property - CSS property name
 * @param {string} value - CSS property value
 * @returns {boolean} True if successful, false if element not found
 */
export function setStyleById(id, property, value) {
    const element = document.getElementById(id);
    if (element) {
        element.style[property] = value;
        return true;
    }
    return false;
}

/**
 * Adds an event listener to an element by ID.
 * @param {string} id - Element ID
 * @param {string} event - Event type (e.g., "click", "mouseover")
 * @param {Function} handler - Event handler function
 * @returns {boolean} True if successful, false if element not found
 */
export function addEventById(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
        return true;
    }
    return false;
}

/**
 * Removes an event listener from an element by ID.
 * @param {string} id - Element ID
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function to remove
 * @returns {boolean} True if successful, false if element not found
 */
export function removeEventById(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.removeEventListener(event, handler);
        return true;
    }
    return false;
}

/**
 * Shows an element by setting display to the specified value.
 * @param {string} id - Element ID
 * @param {string} [displayValue="block"] - Display value to use
 * @returns {boolean} True if successful, false if element not found
 */
export function showById(id, displayValue = "block") {
    return setStyleById(id, "display", displayValue);
}

/**
 * Hides an element by setting display to "none".
 * @param {string} id - Element ID
 * @returns {boolean} True if successful, false if element not found
 */
export function hideById(id) {
    return setStyleById(id, "display", "none");
}

/**
 * Creates a new element with optional attributes and content.
 * @param {string} tagName - HTML tag name
 * @param {Object} [options={}] - Element options
 * @param {string} [options.id] - Element ID
 * @param {string|string[]} [options.className] - Class name(s) to add
 * @param {string} [options.textContent] - Text content
 * @param {Object} [options.style] - Style properties to set
 * @param {Object} [options.attributes] - Additional attributes to set
 * @returns {HTMLElement} The created element
 * @example
 * const div = createElement("div", {
 *   id: "myDiv",
 *   className: ["class1", "class2"],
 *   textContent: "Hello",
 *   style: { backgroundColor: "red" }
 * });
 */
export function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.id) {
        element.id = options.id;
    }

    if (options.className) {
        if (Array.isArray(options.className)) {
            element.classList.add(...options.className);
        } else {
            element.classList.add(options.className);
        }
    }

    if (options.textContent) {
        element.textContent = options.textContent;
    }

    if (options.style) {
        Object.assign(element.style, options.style);
    }

    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }

    return element;
}

/**
 * Removes all children from an element.
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @returns {boolean} True if successful
 */
export function clearChildren(elementOrId) {
    const element = typeof elementOrId === "string"
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return true;
    }
    return false;
}
