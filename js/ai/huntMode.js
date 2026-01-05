/**
 * @fileoverview Hunt mode logic for AI ship pursuit in Battleship.
 *
 * When the AI hits a ship, it enters "hunt mode" to find and sink
 * the rest of that ship. This module handles the directional pursuit
 * logic, including:
 *
 * - Selecting the best initial direction after a hit
 * - Continuing in a direction when hitting consecutive cells
 * - Reversing direction when hitting a wall or miss
 * - Handling multiple unsunk ships
 *
 * The algorithm scores each cardinal direction based on:
 * - Number of open cells in that direction
 * - Length of remaining ships (don't pursue beyond what's possible)
 *
 * @module ai/huntMode
 */

"use strict";

import { BOARD_ROWS, BOARD_COLS, CellState, Direction } from "../config/constants.js";
import { isValidCoordinate, randomChoice, findMax } from "../utils/helpers.js";

/**
 * @typedef {Object} DirectionScore
 * @property {string} dir - Direction code ("u", "d", "l", "r")
 * @property {number} score - Score for this direction (higher is better)
 */

/**
 * @typedef {Object} HuntTarget
 * @property {number} row - Target row
 * @property {number} col - Target column
 * @property {string} direction - Direction of attack
 */

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
 * Checks if a cell is a valid unfired target.
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if can fire at this cell
 * @private
 */
function canFireAt(board, row, col) {
    return isValidCoordinate(row, col) && board[row][col][0] <= CellState.SHIP;
}

/**
 * Counts consecutive open cells in a direction from a starting point.
 * Stops at board edges, misses, or sunk ship cells.
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} rowDelta - Row direction (-1, 0, or 1)
 * @param {number} colDelta - Column direction (-1, 0, or 1)
 * @param {number} maxDistance - Maximum cells to check
 * @returns {number} Number of open cells in this direction
 * @private
 */
function countOpenCells(board, startRow, startCol, rowDelta, colDelta, maxDistance) {
    let count = 0;

    for (let i = 1; i <= maxDistance; i++) {
        const row = startRow + (i * rowDelta);
        const col = startCol + (i * colDelta);

        if (!isValidCoordinate(row, col)) {
            break;
        }

        const cellState = board[row][col][0];

        // Stop at miss or sunk cells
        if (cellState === CellState.MISS || cellState === CellState.SUNK) {
            break;
        }

        // Count this cell if it hasn't been fired at
        if (cellState <= CellState.SHIP) {
            count++;
        }
    }

    return count;
}

/**
 * Counts consecutive hits in a direction (for detecting ship orientation).
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} rowDelta - Row direction
 * @param {number} colDelta - Column direction
 * @returns {number} Number of consecutive hits
 * @private
 */
function countConsecutiveHits(board, startRow, startCol, rowDelta, colDelta) {
    let count = 0;

    for (let i = 1; i < BOARD_ROWS; i++) {
        const row = startRow + (i * rowDelta);
        const col = startCol + (i * colDelta);

        if (!isValidCoordinate(row, col)) {
            break;
        }

        if (board[row][col][0] === CellState.HIT) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

/**
 * Detects the likely orientation of a ship based on hit patterns.
 *
 * If hits are aligned horizontally, returns "horizontal".
 * If hits are aligned vertically, returns "vertical".
 * If orientation can't be determined (single hit), returns "unknown".
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} hitRow - Row of a known hit
 * @param {number} hitCol - Column of a known hit
 * @returns {"horizontal"|"vertical"|"unknown"} Detected orientation
 */
export function detectShipOrientation(board, hitRow, hitCol) {
    // Count hits in each direction from this cell
    const hitsUp = countConsecutiveHits(board, hitRow, hitCol, -1, 0);
    const hitsDown = countConsecutiveHits(board, hitRow, hitCol, 1, 0);
    const hitsLeft = countConsecutiveHits(board, hitRow, hitCol, 0, -1);
    const hitsRight = countConsecutiveHits(board, hitRow, hitCol, 0, 1);

    const verticalHits = hitsUp + hitsDown;
    const horizontalHits = hitsLeft + hitsRight;

    if (verticalHits > 0 && horizontalHits === 0) {
        return "vertical";
    } else if (horizontalHits > 0 && verticalHits === 0) {
        return "horizontal";
    }

    return "unknown";
}

/**
 * Selects the best direction to attack from a hit position.
 *
 * Scores each direction based on:
 * 1. Number of open (unfired) cells in that direction
 * 2. Limited by the maximum remaining ship length
 *
 * If multiple directions tie, randomly selects among them.
 *
 * @param {Array<Array<[number, string, string]>>} board - Current board state
 * @param {number} hitRow - Row of the hit to attack from
 * @param {number} hitCol - Column of the hit to attack from
 * @param {number[]} remainingShipLengths - Lengths of unsunk ships
 * @returns {string} Best direction ("u", "d", "l", or "r")
 */
export function selectBestDirection(board, hitRow, hitCol, remainingShipLengths) {
    const maxLength = findMax(remainingShipLengths);

    // First check if we can detect orientation from existing hits
    const orientation = detectShipOrientation(board, hitRow, hitCol);

    /** @type {DirectionScore[]} */
    let scores;

    if (orientation === "vertical") {
        // Only consider up/down
        scores = [
            { dir: Direction.UP, score: countOpenCells(board, hitRow, hitCol, -1, 0, maxLength) },
            { dir: Direction.DOWN, score: countOpenCells(board, hitRow, hitCol, 1, 0, maxLength) }
        ];
    } else if (orientation === "horizontal") {
        // Only consider left/right
        scores = [
            { dir: Direction.LEFT, score: countOpenCells(board, hitRow, hitCol, 0, -1, maxLength) },
            { dir: Direction.RIGHT, score: countOpenCells(board, hitRow, hitCol, 0, 1, maxLength) }
        ];
    } else {
        // Consider all directions
        scores = [
            { dir: Direction.UP, score: countOpenCells(board, hitRow, hitCol, -1, 0, maxLength) },
            { dir: Direction.DOWN, score: countOpenCells(board, hitRow, hitCol, 1, 0, maxLength) },
            { dir: Direction.LEFT, score: countOpenCells(board, hitRow, hitCol, 0, -1, maxLength) },
            { dir: Direction.RIGHT, score: countOpenCells(board, hitRow, hitCol, 0, 1, maxLength) }
        ];
    }

    // Find the maximum score
    const maxScore = findMax(scores.map(s => s.score));

    // Get all directions with the max score
    const bestDirs = scores.filter(s => s.score === maxScore);

    // Randomly select among tied directions
    return randomChoice(bestDirs).dir;
}

/**
 * Gets the opposite direction for reversing after a miss or wall.
 *
 * @param {string} direction - Current direction
 * @returns {string} Opposite direction
 */
export function getOppositeDirection(direction) {
    const opposites = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT
    };
    return opposites[direction] || Direction.UP;
}

/**
 * Gets the next cell coordinates in a given direction.
 *
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {string} direction - Direction to move
 * @returns {{row: number, col: number}} Next cell coordinates
 */
export function getNextCell(row, col, direction) {
    const deltas = {
        [Direction.UP]: { row: -1, col: 0 },
        [Direction.DOWN]: { row: 1, col: 0 },
        [Direction.LEFT]: { row: 0, col: -1 },
        [Direction.RIGHT]: { row: 0, col: 1 }
    };

    const delta = deltas[direction] || { row: 0, col: 0 };

    return {
        row: row + delta.row,
        col: col + delta.col
    };
}

/**
 * Determines the next target when hunting a found ship.
 *
 * This is the main hunt mode logic:
 * 1. If we have a direction, continue in that direction
 * 2. If we hit a wall or miss, try the opposite direction
 * 3. If opposite is also blocked, pick a new direction
 *
 * @param {Array<Array<[number, string, string]>>} board - Current board state
 * @param {number} lastHitRow - Row of last hit
 * @param {number} lastHitCol - Column of last hit
 * @param {string} currentDirection - Current attack direction (or "" for none)
 * @param {number[]} remainingShipLengths - Lengths of unsunk ships
 * @returns {HuntTarget|null} Next target, or null if hunt mode should end
 */
export function getNextHuntTarget(board, lastHitRow, lastHitCol, currentDirection, remainingShipLengths) {
    // If we have a direction, try to continue in it
    if (currentDirection) {
        const next = getNextCell(lastHitRow, lastHitCol, currentDirection);

        // If we can fire at the next cell, do it
        if (canFireAt(board, next.row, next.col)) {
            return {
                row: next.row,
                col: next.col,
                direction: currentDirection
            };
        }

        // Can't continue - try opposite direction from the original hit
        // First, find the original hit by going backwards
        const opposite = getOppositeDirection(currentDirection);
        const originalHit = findOriginalHit(board, lastHitRow, lastHitCol, currentDirection);

        if (originalHit) {
            const reverseNext = getNextCell(originalHit.row, originalHit.col, opposite);

            if (canFireAt(board, reverseNext.row, reverseNext.col)) {
                return {
                    row: reverseNext.row,
                    col: reverseNext.col,
                    direction: opposite
                };
            }
        }

        // Can't continue in either direction
        // There might be another unsunk ship - return null to re-evaluate
        return null;
    }

    // No direction yet - select the best one
    const newDirection = selectBestDirection(board, lastHitRow, lastHitCol, remainingShipLengths);
    const next = getNextCell(lastHitRow, lastHitCol, newDirection);

    if (canFireAt(board, next.row, next.col)) {
        return {
            row: next.row,
            col: next.col,
            direction: newDirection
        };
    }

    // Couldn't find a valid target
    return null;
}

/**
 * Finds the original hit in a sequence by tracing back.
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @param {number} currentRow - Current row
 * @param {number} currentCol - Current column
 * @param {string} direction - Direction we've been going
 * @returns {{row: number, col: number}|null} Original hit position
 * @private
 */
function findOriginalHit(board, currentRow, currentCol, direction) {
    const opposite = getOppositeDirection(direction);
    let row = currentRow;
    let col = currentCol;

    // Go backwards until we find the first hit
    while (true) {
        const prev = getNextCell(row, col, opposite);

        if (!isValidCoordinate(prev.row, prev.col)) {
            break;
        }

        if (board[prev.row][prev.col][0] !== CellState.HIT) {
            break;
        }

        row = prev.row;
        col = prev.col;
    }

    return { row, col };
}

/**
 * Finds any unsunk hit on the board to continue hunting.
 * Used when one ship is sunk but there are still active hits from another.
 *
 * @param {Array<Array<[number, string, string]>>} board - Game board
 * @returns {{row: number, col: number}|null} Position of an unsunk hit, or null
 */
export function findUnsunkHit(board) {
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (board[row][col][0] === CellState.HIT) {
                return { row, col };
            }
        }
    }
    return null;
}
