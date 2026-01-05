/**
 * @fileoverview Dark mode toggle functionality for Battleship.
 * Manages the visual theme switching between light and dark modes.
 * Persists user preference using cookies.
 * @module ui/darkMode
 */

"use strict";

import { CssClasses } from "../config/constants.js";
import { getDarkModePreference, setDarkModePreference } from "../utils/cookies.js";
import { getById, addClassById, removeClassById } from "../utils/dom.js";

/**
 * List of element IDs that need the dark gray background in dark mode.
 * @constant {string[]}
 * @private
 */
const DARK_GRAY_ELEMENTS = [
    "thinking",
    "leftList",
    "rightList",
    "ships",
    "gameboard",
    "gameboard_cpu"
];

/**
 * List of element IDs that need the light background (inverted) in dark mode.
 * @constant {string[]}
 * @private
 */
const LIGHT_BACKGROUND_ELEMENTS = [
    "githubicon",
    "homeIcon",
    "downArrow",
    "rotateArrow"
];

/**
 * Enables dark mode styling throughout the application.
 * Adds appropriate CSS classes to all relevant elements.
 */
export function enableDarkMode() {
    // Add light text to all paragraphs
    Array.from(document.getElementsByTagName("p")).forEach((p) =>
        p.classList.add(CssClasses.LIGHT_TEXT)
    );

    // Dark background on body and html
    document.body.classList.add(CssClasses.DARK_BACKGROUND);
    document.documentElement.classList.add(CssClasses.DARK_BACKGROUND_HTML);

    // Dark gray background on game elements
    DARK_GRAY_ELEMENTS.forEach(id => addClassById(id, CssClasses.DARK_GRAY_BACKGROUND));

    // Invert icons for visibility
    LIGHT_BACKGROUND_ELEMENTS.forEach(id => addClassById(id, CssClasses.LIGHT_BACKGROUND));

    // Handle animation container
    const animationEl = document.getElementsByClassName("animation")[0];
    if (animationEl) {
        animationEl.classList.add(CssClasses.DARK_GRAY_BACKGROUND);
    }

    // Save preference
    setDarkModePreference(true);
}

/**
 * Disables dark mode styling, returning to light mode.
 * Removes all dark mode CSS classes from elements.
 */
export function disableDarkMode() {
    // Remove light text from all paragraphs
    Array.from(document.getElementsByTagName("p")).forEach((p) =>
        p.classList.remove(CssClasses.LIGHT_TEXT)
    );

    // Remove dark background from body and html
    document.body.classList.remove(CssClasses.DARK_BACKGROUND);
    document.documentElement.classList.remove(CssClasses.DARK_BACKGROUND_HTML);

    // Remove dark gray background from game elements
    DARK_GRAY_ELEMENTS.forEach(id => removeClassById(id, CssClasses.DARK_GRAY_BACKGROUND));

    // Remove inverted icons
    LIGHT_BACKGROUND_ELEMENTS.forEach(id => removeClassById(id, CssClasses.LIGHT_BACKGROUND));

    // Handle animation container
    const animationEl = document.getElementsByClassName("animation")[0];
    if (animationEl) {
        animationEl.classList.remove(CssClasses.DARK_GRAY_BACKGROUND);
    }

    // Save preference
    setDarkModePreference(false);
}

/**
 * Toggles between dark and light mode.
 * Uses the current preference from cookies to determine which mode to switch to.
 */
export function toggleDarkMode() {
    if (getDarkModePreference()) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

/**
 * Applies the saved dark mode preference from cookies.
 * Should be called on page load to restore user's preferred theme.
 */
export function applySavedDarkModePreference() {
    if (getDarkModePreference()) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

/**
 * Initializes dark mode toggle functionality.
 * Sets up the click handler for the dark mode toggle button.
 */
export function initializeDarkModeToggle() {
    const toggle = getById("darkMode");
    if (toggle) {
        toggle.addEventListener("click", toggleDarkMode);
    }

    // Apply saved preference on init
    applySavedDarkModePreference();
}
