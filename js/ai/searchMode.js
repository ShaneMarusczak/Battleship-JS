/**
 * @fileoverview Search mode logic for AI initial targeting in Battleship.
 *
 * When the AI hasn't found a ship yet (or after sinking one), it uses
 * search mode to efficiently scan the board. This module implements:
 *
 * - Checkerboard pattern: Optimal for finding ships of length 2+
 * - Edge avoidance: Early game bias toward center (more ship placements possible)
 * - Probability-based selection: Uses the probability calculator for smart targeting
 *
 * The checkerboard pattern guarantees that any ship of length 2 or more
 * will be hit eventually, while minimizing wasted shots.
 *
 * @module ai/searchMode
 */

"use strict";

import { BOARD_ROWS, BOARD_COLS, CellState } from "../config/constants.js";
import { isValidCoordinate, randomInt, randomChoice } from "../utils/helpers.js";
import { selectBestTarget, calculateProbabilities, findBestTargets } from "./probability.js";

/**
 * Number of initial shots to use simple checkerboard before switching to probability.
 * @constant {number}
 */
const INITIAL_CHECKERBOARD_SHOTS = 4;

/**
 * Number of consecutive misses before forcing probability calculation.
 * @constant {number}
 */
const MISSES_BEFORE_PROBABILITY = 3;

/**
 * Maximum attempts to find a valid random cell before falling back to probability.
 * @constant {number}
 */
const MAX_RANDOM_ATTEMPTS = 10;

/**
 * Checks if a cell has already been fired at.
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if already fired at
 * @private
 */
function alreadyFiredAt(board, row, col) {
    return isValidCoordinate(row, col) && board[row][col][0] > CellState.SHIP;
}

/**
 * Checks if a cell is on the checkerboard pattern.
 * The checkerboard ensures efficient coverage - any ship of length 2+
 * will have at least one cell on the pattern.
 *
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if cell is on checkerboard
 * @private
 */
function isOnCheckerboard(row, col) {
    return (row + col) % 2 === 0;
}

/**
 * Checks if a cell is in the "preferred" area (avoiding edges initially).
 * Ships are less likely to be placed at edges due to fewer valid positions.
 *
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if cell is in preferred area
 * @private
 */
function isInPreferredArea(row, col) {
    // Avoid the very edges (0 and 9)
    // Also slightly avoid rows/cols that limit ship placement
    return row >= 1 && row <= 8 && col >= 1 && col <= 8;
}

/**
 * Gets all unfired cells on the checkerboard pattern.
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {boolean} [preferCenter=false] - Whether to prefer center cells
 * @returns {{row: number, col: number}[]} Array of valid target cells
 * @private
 */
function getCheckerboardCells(board, preferCenter = false) {
    const cells = [];

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (isOnCheckerboard(row, col) && !alreadyFiredAt(board, row, col)) {
                if (!preferCenter || isInPreferredArea(row, col)) {
                    cells.push({ row, col });
                }
            }
        }
    }

    return cells;
}

/**
 * Selects a random cell from the checkerboard pattern.
 * Used for initial shots to establish board coverage.
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {boolean} [preferCenter=false] - Whether to prefer center cells
 * @returns {{row: number, col: number}|null} Target coordinates, or null if none available
 */
export function selectCheckerboardTarget(board, preferCenter = false) {
    let cells = getCheckerboardCells(board, preferCenter);

    // If no preferred cells available, try all checkerboard cells
    if (cells.length === 0 && preferCenter) {
        cells = getCheckerboardCells(board, false);
    }

    // If still no cells, checkerboard is exhausted
    if (cells.length === 0) {
        return null;
    }

    return randomChoice(cells);
}

/**
 * Selects a target during search mode (no active hits).
 *
 * Strategy:
 * 1. For first few shots, use checkerboard with center preference
 * 2. After some shots, switch to probability-based selection
 * 3. If probability calculation takes too long or fails, use checkerboard fallback
 *
 * @param {Array<Array<[number, string, string]>>} board - Current board state
 * @param {number} shotsFired - Total shots fired by AI
 * @param {number} missesInARow - Consecutive misses (resets on hit)
 * @param {number[]} remainingShipLengths - Lengths of unsunk ships
 * @returns {{row: number, col: number}} Selected target coordinates
 */
export function selectSearchTarget(board, shotsFired, missesInARow, remainingShipLengths) {
    // For early game, use simple checkerboard with center preference
    if (shotsFired < INITIAL_CHECKERBOARD_SHOTS) {
        const target = selectCheckerboardTarget(board, true);
        if (target) {
            return target;
        }
    }

    // If we've missed several times in a row, definitely use probability
    // Also use probability after the initial phase
    if (missesInARow > MISSES_BEFORE_PROBABILITY || shotsFired >= INITIAL_CHECKERBOARD_SHOTS) {
        return selectBestTarget(board, remainingShipLengths, false);
    }

    // Try random checkerboard selection a few times
    for (let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt++) {
        const row = randomInt(0, BOARD_ROWS - 1);
        const col = randomInt(0, BOARD_COLS - 1);

        if (isOnCheckerboard(row, col) && !alreadyFiredAt(board, row, col)) {
            return { row, col };
        }
    }

    // Fall back to probability-based selection
    return selectBestTarget(board, remainingShipLengths, false);
}

/**
 * Gets the current search strategy name for debugging/display.
 *
 * @param {number} shotsFired - Total shots fired
 * @param {number} missesInARow - Consecutive misses
 * @returns {string} Strategy name
 */
export function getSearchStrategy(shotsFired, missesInARow) {
    if (shotsFired < INITIAL_CHECKERBOARD_SHOTS) {
        return "Initial Checkerboard";
    } else if (missesInARow > MISSES_BEFORE_PROBABILITY) {
        return "Probability (Miss Recovery)";
    } else {
        return "Probability";
    }
}
