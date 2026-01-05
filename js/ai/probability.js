/**
 * @fileoverview Probability calculator for AI targeting in Battleship.
 *
 * This module implements a density-based probability calculation algorithm
 * that determines the likelihood of a ship being present at each cell.
 * The algorithm works by:
 *
 * 1. For each remaining (unsunk) ship, iterate through all possible placements
 * 2. For each valid placement, increment the probability counter for each cell
 * 3. Cells that can be part of more placements have higher probability values
 *
 * Additional enhancements:
 * - Target mode boost: Adjacent cells to known hits get multiplied probability
 * - Parity filtering: Only consider cells matching the parity of smallest ship
 *
 * @module ai/probability
 */

"use strict";

import { BOARD_ROWS, BOARD_COLS, CellState } from "../config/constants.js";
import { isValidCoordinate, create2DArray, findMax, randomChoice } from "../utils/helpers.js";

/**
 * Multiplier applied to cells adjacent to known hits.
 * Higher values make the AI more aggressive in pursuing found ships.
 * @constant {number}
 */
const ADJACENT_HIT_BOOST = 3;

/**
 * Checks if a ship of the given length can be placed at the position.
 * A placement is valid if all cells are either empty or contain a ship
 * (i.e., haven't been fired at yet).
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} length - Ship length
 * @param {string} direction - "horizontal" or "vertical"
 * @returns {boolean} True if placement is valid
 * @private
 */
function canPlaceShip(board, row, col, length, direction) {
    for (let i = 0; i < length; i++) {
        const r = direction === "vertical" ? row + i : row;
        const c = direction === "horizontal" ? col + i : col;

        // Check bounds
        if (!isValidCoordinate(r, c)) {
            return false;
        }

        // Check if already fired at (state > SHIP means HIT, MISS, or SUNK)
        if (board[r][c][0] > CellState.SHIP) {
            return false;
        }
    }
    return true;
}

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
 * Calculates the probability of a ship being present at each cell.
 *
 * For each remaining ship length, the algorithm:
 * 1. Tries every possible horizontal placement
 * 2. Tries every possible vertical placement
 * 3. For each valid placement, increments all cells in that placement
 *
 * The result is a heat map where higher values indicate more possible
 * ship placements that include that cell.
 *
 * @param {Array<Array<[number, string, string]>>} board - Current board state
 * @param {number[]} remainingShipLengths - Lengths of ships not yet sunk
 * @returns {number[][]} 2D array of probability values
 *
 * @example
 * const probs = calculateProbabilities(board, [5, 4, 3]);
 * // probs[row][col] = number of possible ship placements including that cell
 */
export function calculateProbabilities(board, remainingShipLengths) {
    const probabilities = create2DArray(BOARD_ROWS, BOARD_COLS, 0);

    for (const shipLength of remainingShipLengths) {
        // Check all horizontal placements
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col <= BOARD_COLS - shipLength; col++) {
                if (canPlaceShip(board, row, col, shipLength, "horizontal")) {
                    for (let k = 0; k < shipLength; k++) {
                        probabilities[row][col + k]++;
                    }
                }
            }
        }

        // Check all vertical placements
        for (let row = 0; row <= BOARD_ROWS - shipLength; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                if (canPlaceShip(board, row, col, shipLength, "vertical")) {
                    for (let k = 0; k < shipLength; k++) {
                        probabilities[row + k][col]++;
                    }
                }
            }
        }
    }

    // Zero out cells that have already been fired at
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (alreadyFiredAt(board, row, col)) {
                probabilities[row][col] = 0;
            }
        }
    }

    return probabilities;
}

/**
 * Applies a probability boost to cells adjacent to known hits.
 *
 * This enhancement helps the AI find connected ship cells more quickly.
 * When a hit is found but the ship isn't sunk yet, adjacent cells become
 * high-priority targets.
 *
 * @param {number[][]} probabilities - Base probability map
 * @param {Array<Array<[number, string, string]>>} board - Current board state
 * @returns {number[][]} Enhanced probability map
 */
export function applyTargetModeBoost(probabilities, board) {
    const boosted = probabilities.map(row => [...row]);

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            // If this cell is a hit (not sunk), boost adjacent cells
            if (board[row][col][0] === CellState.HIT) {
                const adjacents = [
                    [row - 1, col], // up
                    [row + 1, col], // down
                    [row, col - 1], // left
                    [row, col + 1]  // right
                ];

                for (const [r, c] of adjacents) {
                    if (isValidCoordinate(r, c) && boosted[r][c] > 0) {
                        boosted[r][c] *= ADJACENT_HIT_BOOST;
                    }
                }
            }
        }
    }

    return boosted;
}

/**
 * Applies parity filtering to the probability map.
 *
 * This optimization is based on the insight that ships of length N
 * can only be found efficiently by checking every Nth cell.
 * For the standard smallest ship (destroyer, length 2), checking
 * a checkerboard pattern is optimal.
 *
 * When only larger ships remain, we can use a sparser pattern.
 *
 * @param {number[][]} probabilities - Probability map
 * @param {number} minShipLength - Length of smallest remaining ship
 * @returns {number[][]} Parity-filtered probabilities
 */
export function applyParityFilter(probabilities, minShipLength) {
    // If smallest ship is length 2, use standard checkerboard
    // For larger ships, we could use sparser patterns but standard works well
    if (minShipLength <= 2) {
        return probabilities;
    }

    const filtered = probabilities.map(row => [...row]);

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            // For checkerboard: (row + col) % 2 === 0 or === 1
            // This ensures we don't waste shots on adjacent cells
            if ((row + col) % 2 !== 0) {
                filtered[row][col] = 0;
            }
        }
    }

    return filtered;
}

/**
 * Finds all cells with the highest probability value.
 *
 * @param {number[][]} probabilities - Probability map
 * @returns {{row: number, col: number}[]} Array of highest-probability coordinates
 */
export function findBestTargets(probabilities) {
    let maxProb = 0;
    let targets = [];

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const prob = probabilities[row][col];

            if (prob > maxProb) {
                maxProb = prob;
                targets = [{ row, col }];
            } else if (prob === maxProb && prob > 0) {
                targets.push({ row, col });
            }
        }
    }

    return targets;
}

/**
 * Selects the best cell to target based on probability calculations.
 *
 * This is the main entry point for probability-based targeting.
 * It calculates probabilities, applies boosts and filters, and
 * selects randomly from the highest-probability cells.
 *
 * @param {Array<Array<[number, string, string]>>} board - Current board state
 * @param {number[]} remainingShipLengths - Lengths of ships not yet sunk
 * @param {boolean} [hasActiveHits=false] - Whether there are unsunk hits on board
 * @returns {{row: number, col: number}} Selected target coordinates
 */
export function selectBestTarget(board, remainingShipLengths, hasActiveHits = false) {
    let probabilities = calculateProbabilities(board, remainingShipLengths);

    // If we have hits that aren't part of sunk ships, boost adjacent cells
    if (hasActiveHits) {
        probabilities = applyTargetModeBoost(probabilities, board);
    }

    // Find best targets
    const targets = findBestTargets(probabilities);

    if (targets.length === 0) {
        // Fallback: find any unfired cell
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                if (!alreadyFiredAt(board, row, col)) {
                    return { row, col };
                }
            }
        }
        // Should never reach here in a valid game
        return { row: 0, col: 0 };
    }

    // Randomly select from equally-good targets
    return randomChoice(targets);
}

/**
 * Updates the UI to display the probability heat map.
 * Useful for debugging and for the "Visuals" feature.
 *
 * @param {number[][]} probabilities - Probability map
 * @param {Function} getCellElement - Function to get cell DOM element by coordinates
 */
export function displayProbabilityHeatmap(probabilities, getCellElement) {
    const maxProb = findMax(probabilities.flat());

    if (maxProb === 0) return;

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const cell = getCellElement(row, col);
            if (!cell) continue;

            const prob = probabilities[row][col];
            if (prob > 0) {
                // Scale color intensity based on probability
                const intensity = Math.min(1, (prob / maxProb) + 0.25);
                cell.style.backgroundColor = `rgba(128, 170, 255, ${intensity})`;
            }
        }
    }
}
