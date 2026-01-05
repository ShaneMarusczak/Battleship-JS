/**
 * @fileoverview Cookie management utilities for Battleship.
 * Provides functions for getting, setting, and managing browser cookies.
 * Used for persisting win/loss records and dark mode preference.
 * @module utils/cookies
 */

"use strict";

import { COOKIE_EXPIRATION_DAYS, CookieNames } from "../config/constants.js";

/**
 * Sets a cookie with the specified name, value, and expiration.
 * @param {string} name - The name of the cookie
 * @param {string|number} value - The value to store
 * @param {number} [days=COOKIE_EXPIRATION_DAYS] - Number of days until expiration
 * @example
 * setCookie("playerWins", 5, 0.25);
 */
export function setCookie(name, value, days = COOKIE_EXPIRATION_DAYS) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

/**
 * Retrieves a cookie value by name.
 * @param {string} name - The name of the cookie to retrieve
 * @returns {string|null} The cookie value, or null if not found
 * @example
 * const wins = getCookie("playerWins"); // "5" or null
 */
export function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Deletes a cookie by setting its expiration to the past.
 * @param {string} name - The name of the cookie to delete
 */
export function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

/**
 * Gets the player's win count from cookies.
 * @returns {number} Player's win count (0 if not set)
 */
export function getPlayerWins() {
    const wins = getCookie(CookieNames.PLAYER_WINS);
    return wins ? Number(wins) : 0;
}

/**
 * Sets the player's win count in cookies.
 * @param {number} count - New win count
 */
export function setPlayerWins(count) {
    setCookie(CookieNames.PLAYER_WINS, count, COOKIE_EXPIRATION_DAYS);
}

/**
 * Increments the player's win count by 1.
 * @returns {number} The new win count
 */
export function incrementPlayerWins() {
    const newCount = getPlayerWins() + 1;
    setPlayerWins(newCount);
    return newCount;
}

/**
 * Gets the computer's win count from cookies.
 * @returns {number} Computer's win count (0 if not set)
 */
export function getComputerWins() {
    const wins = getCookie(CookieNames.COMPUTER_WINS);
    return wins ? Number(wins) : 0;
}

/**
 * Sets the computer's win count in cookies.
 * @param {number} count - New win count
 */
export function setComputerWins(count) {
    setCookie(CookieNames.COMPUTER_WINS, count, COOKIE_EXPIRATION_DAYS);
}

/**
 * Increments the computer's win count by 1.
 * @returns {number} The new win count
 */
export function incrementComputerWins() {
    const newCount = getComputerWins() + 1;
    setComputerWins(newCount);
    return newCount;
}

/**
 * Resets both player and computer win counts to 0.
 */
export function resetWinLoss() {
    setPlayerWins(0);
    setComputerWins(0);
}

/**
 * Gets the dark mode preference from cookies.
 * @returns {boolean} True if dark mode is enabled
 */
export function getDarkModePreference() {
    return getCookie(CookieNames.DARK_MODE) === "Y";
}

/**
 * Sets the dark mode preference in cookies.
 * @param {boolean} enabled - Whether dark mode should be enabled
 */
export function setDarkModePreference(enabled) {
    setCookie(CookieNames.DARK_MODE, enabled ? "Y" : "N", 1);
}
