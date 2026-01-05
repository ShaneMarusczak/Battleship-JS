/**
 * @fileoverview General helper functions for Battleship.
 * Contains utility functions used across multiple modules.
 * @module utils/helpers
 */

"use strict";

import { BOARD_ROWS, BOARD_COLS } from "../config/constants.js";

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in the range [min, max]
 * @example
 * const roll = randomInt(1, 6); // 1, 2, 3, 4, 5, or 6
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random element from an array.
 * @template T
 * @param {T[]} array - The array to select from
 * @returns {T} A random element from the array
 * @example
 * const color = randomChoice(["red", "green", "blue"]); // "red", "green", or "blue"
 */
export function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

/**
 * Checks if the given coordinates are within the board boundaries.
 * @param {number} x - Row coordinate (0-indexed)
 * @param {number} y - Column coordinate (0-indexed)
 * @returns {boolean} True if coordinates are valid
 * @example
 * isValidCoordinate(5, 5); // true
 * isValidCoordinate(-1, 5); // false
 * isValidCoordinate(10, 5); // false
 */
export function isValidCoordinate(x, y) {
    return x >= 0 && x < BOARD_ROWS && y >= 0 && y < BOARD_COLS;
}

/**
 * Creates a cell ID string for the CPU board (player's view).
 * @param {number} x - Row coordinate
 * @param {number} y - Column coordinate
 * @returns {string} Cell ID in format "sXY"
 * @example
 * getCpuCellId(3, 5); // "s35"
 */
export function getCpuCellId(x, y) {
    return "s" + x + y;
}

/**
 * Creates a cell ID string for the player board (CPU's view).
 * @param {number} x - Row coordinate
 * @param {number} y - Column coordinate
 * @returns {string} Cell ID in format "cXY"
 * @example
 * getPlayerCellId(3, 5); // "c35"
 */
export function getPlayerCellId(x, y) {
    return "c" + x + y;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize
 * @returns {string} String with first letter capitalized
 * @example
 * capitalizeFirst("carrier"); // "Carrier"
 */
export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Creates a promise that resolves after the specified delay.
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a 2D array with the specified dimensions.
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {*} [initialValue=0] - Initial value for each cell
 * @returns {Array<Array<*>>} 2D array filled with the initial value
 * @example
 * const grid = create2DArray(3, 3, 0);
 * // [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
 */
export function create2DArray(rows, cols, initialValue = 0) {
    const arr = [];
    for (let i = 0; i < rows; i++) {
        arr.push([]);
        for (let j = 0; j < cols; j++) {
            arr[i].push(initialValue);
        }
    }
    return arr;
}

/**
 * Finds the maximum value in an array of numbers.
 * @param {number[]} arr - Array of numbers
 * @returns {number} Maximum value (0 if array is empty)
 * @example
 * findMax([1, 5, 3, 9, 2]); // 9
 */
export function findMax(arr) {
    if (arr.length === 0) return 0;
    return Math.max(...arr);
}

/**
 * Parses coordinates from a cell element ID.
 * @param {string} id - Cell ID (e.g., "s35" or "c35")
 * @returns {{x: number, y: number}} Parsed coordinates
 * @example
 * parseCoordinatesFromId("s35"); // { x: 3, y: 5 }
 */
export function parseCoordinatesFromId(id) {
    return {
        x: Number(id[1]),
        y: Number(id[2])
    };
}

/**
 * Blocks UI interactions for the specified duration.
 * Creates an overlay that prevents clicks.
 * @param {number} duration - Block duration in milliseconds
 */
export function uiBlocker(duration) {
    const blocker = document.createElement("div");
    blocker.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:transparent;";
    document.body.appendChild(blocker);
    setTimeout(() => blocker.remove(), duration);
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} The same array, shuffled
 * @example
 * shuffle([1, 2, 3, 4, 5]); // [3, 1, 5, 2, 4] (random order)
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
