/**
 * @fileoverview AI Controller for Battleship computer opponent.
 *
 * This module orchestrates the AI's decision-making process, combining
 * search mode and hunt mode strategies. It acts as the main interface
 * between the game logic and the AI algorithms.
 *
 * The AI operates in two modes:
 *
 * 1. **Search Mode**: No active hits on the board
 *    - Uses checkerboard pattern initially
 *    - Switches to probability-based targeting
 *
 * 2. **Hunt Mode**: Active hits that aren't part of sunk ships
 *    - Pursues the hit ship in the best direction
 *    - Reverses on miss or wall
 *    - Handles multiple simultaneous hits
 *
 * The AI maintains state between moves to track:
 * - Position of last hit
 * - Current pursuit direction
 * - Count of unsunk hits
 *
 * @module ai/aiController
 */

"use strict";

import { CellState, BOARD_ROWS, BOARD_COLS, SHIP_LENGTHS } from "../config/constants.js";
import {
    getAIState,
    updateAIState,
    getPlayerBoard,
    getPlayerShipState,
    getRemainingPlayerShipLengths
} from "../state/gameState.js";
import { getPlayerCellId, isValidCoordinate } from "../utils/helpers.js";
import { selectSearchTarget } from "./searchMode.js";
import {
    getNextHuntTarget,
    findUnsunkHit,
    selectBestDirection,
    getNextCell,
    getOppositeDirection
} from "./huntMode.js";
import {
    calculateProbabilities,
    applyTargetModeBoost,
    displayProbabilityHeatmap
} from "./probability.js";

/**
 * @typedef {Object} AIMove
 * @property {number} row - Target row
 * @property {number} col - Target column
 * @property {boolean} isHit - Whether the shot was a hit
 * @property {string|null} shipHit - Name of ship hit, or null
 * @property {boolean} shipSunk - Whether a ship was sunk
 * @property {string|null} shipSunkName - Name of ship sunk, or null
 */

/**
 * Checks if a cell contains a ship (hit or not).
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if cell contains a ship
 * @private
 */
function isShip(row, col) {
    const board = getPlayerBoard();
    return isValidCoordinate(row, col) &&
           (board[row][col][0] === CellState.SHIP || board[row][col][0] === CellState.HIT);
}

/**
 * Checks if a cell has been hit (contains a ship and was fired at).
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if cell was hit
 * @private
 */
function isHit(row, col) {
    const board = getPlayerBoard();
    return isValidCoordinate(row, col) && board[row][col][0] === CellState.HIT;
}

/**
 * Checks if a cell is empty (no ship, hasn't been fired at).
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if cell is empty and unfired
 * @private
 */
function isEmpty(row, col) {
    const board = getPlayerBoard();
    return isValidCoordinate(row, col) && board[row][col][0] === CellState.EMPTY;
}

/**
 * Checks if a cell contains an unhit ship.
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {boolean} True if cell has an unhit ship
 * @private
 */
function isUnhitShip(row, col) {
    const board = getPlayerBoard();
    return isValidCoordinate(row, col) && board[row][col][0] === CellState.SHIP;
}

/**
 * Gets the ship name at a position.
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {string} Ship name or empty string
 * @private
 */
function getShipName(row, col) {
    const board = getPlayerBoard();
    return board[row][col][1] || "";
}

/**
 * Checks if a specific ship has been completely sunk.
 * @param {string} shipName - Name of the ship
 * @returns {boolean} True if all cells of the ship are hit
 * @private
 */
function isShipSunk(shipName) {
    const board = getPlayerBoard();
    const shipLength = SHIP_LENGTHS[shipName];
    let hitCount = 0;

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (board[row][col][1] === shipName && board[row][col][0] === CellState.HIT) {
                hitCount++;
            }
        }
    }

    return hitCount >= shipLength;
}

/**
 * Marks all cells of a sunk ship with the SUNK state.
 * @param {string} shipName - Name of the ship
 * @private
 */
function markShipAsSunk(shipName) {
    const board = getPlayerBoard();

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (board[row][col][1] === shipName) {
                board[row][col][0] = CellState.SUNK;
            }
        }
    }
}

/**
 * Executes the AI's turn and returns the result.
 *
 * This is the main entry point for AI moves. It:
 * 1. Determines whether to use search or hunt mode
 * 2. Selects the target cell
 * 3. Executes the shot
 * 4. Updates AI state based on result
 * 5. Returns move information for UI updates
 *
 * @returns {AIMove} Result of the AI's move
 */
export function executeAIMove() {
    const board = getPlayerBoard();
    const aiState = getAIState();
    const remainingLengths = getRemainingPlayerShipLengths();

    let targetRow, targetCol;

    // Decide between hunt mode and search mode
    if (aiState.hitsNotSunk > 0) {
        // Hunt mode: we have hits that aren't part of sunk ships
        const huntTarget = getNextHuntTarget(
            board,
            aiState.lastShotX,
            aiState.lastShotY,
            aiState.attackDirection,
            remainingLengths
        );

        if (huntTarget) {
            targetRow = huntTarget.row;
            targetCol = huntTarget.col;
            updateAIState({ attackDirection: huntTarget.direction });
        } else {
            // Couldn't find hunt target - find another unsunk hit
            const unsunkHit = findUnsunkHit(board);
            if (unsunkHit) {
                updateAIState({
                    lastShotX: unsunkHit.row,
                    lastShotY: unsunkHit.col,
                    attackDirection: ""
                });
                // Recursive call with new target
                return executeAIMove();
            } else {
                // Fall back to search mode
                const searchTarget = selectSearchTarget(
                    board,
                    aiState.shotsFired,
                    aiState.missesInARow,
                    remainingLengths
                );
                targetRow = searchTarget.row;
                targetCol = searchTarget.col;
            }
        }
    } else {
        // Search mode: no active hits
        const searchTarget = selectSearchTarget(
            board,
            aiState.shotsFired,
            aiState.missesInARow,
            remainingLengths
        );
        targetRow = searchTarget.row;
        targetCol = searchTarget.col;
    }

    // Execute the shot
    const result = executeShot(targetRow, targetCol);

    // Update AI state based on result
    updateAIState({ shotsFired: aiState.shotsFired + 1 });

    if (result.isHit) {
        updateAIState({
            lastShotX: targetRow,
            lastShotY: targetCol,
            missesInARow: 0,
            hitsNotSunk: aiState.hitsNotSunk + 1
        });

        // If ship was sunk, update state
        if (result.shipSunk) {
            const shipLength = SHIP_LENGTHS[result.shipSunkName];
            updateAIState({
                hitsNotSunk: aiState.hitsNotSunk + 1 - shipLength,
                attackDirection: ""
            });

            // If there are still unsunk hits, find one to continue hunting
            if (aiState.hitsNotSunk + 1 - shipLength > 0) {
                const unsunkHit = findUnsunkHit(board);
                if (unsunkHit) {
                    updateAIState({
                        lastShotX: unsunkHit.row,
                        lastShotY: unsunkHit.col
                    });
                }
            }
        } else if (aiState.attackDirection) {
            // Continue in the same direction - update last shot position
            const next = getNextCell(aiState.lastShotX, aiState.lastShotY, aiState.attackDirection);
            if (next.row === targetRow && next.col === targetCol) {
                updateAIState({
                    lastShotX: targetRow,
                    lastShotY: targetCol
                });
            }
        }
    } else {
        // Miss
        updateAIState({
            missesInARow: aiState.missesInARow + 1
        });

        // If we were hunting, we need to reverse direction
        if (aiState.attackDirection && aiState.hitsNotSunk > 0) {
            // Find original hit and try opposite direction
            const opposite = getOppositeDirection(aiState.attackDirection);

            // Find the furthest hit in the opposite direction
            let searchRow = aiState.lastShotX;
            let searchCol = aiState.lastShotY;

            // Walk back to find original hit
            while (true) {
                const prev = getNextCell(searchRow, searchCol, opposite);
                if (!isValidCoordinate(prev.row, prev.col) || !isHit(prev.row, prev.col)) {
                    break;
                }
                searchRow = prev.row;
                searchCol = prev.col;
            }

            updateAIState({
                lastShotX: searchRow,
                lastShotY: searchCol,
                attackDirection: opposite
            });
        }
    }

    return result;
}

/**
 * Executes a shot at the specified coordinates.
 *
 * @param {number} row - Target row
 * @param {number} col - Target column
 * @returns {AIMove} Result of the shot
 * @private
 */
function executeShot(row, col) {
    const board = getPlayerBoard();
    const cellState = board[row][col][0];
    const shipName = board[row][col][1];

    const result = {
        row,
        col,
        isHit: false,
        shipHit: null,
        shipSunk: false,
        shipSunkName: null
    };

    if (cellState === CellState.EMPTY) {
        // Miss
        board[row][col][0] = CellState.MISS;
        result.isHit = false;
    } else if (cellState === CellState.SHIP) {
        // Hit
        board[row][col][0] = CellState.HIT;
        result.isHit = true;
        result.shipHit = shipName;

        // Check if ship is sunk
        if (isShipSunk(shipName)) {
            markShipAsSunk(shipName);
            result.shipSunk = true;
            result.shipSunkName = shipName;
        }
    }

    return result;
}

/**
 * Resets the AI state for a new game.
 */
export function resetAIState() {
    updateAIState({
        lastShotX: -1,
        lastShotY: -1,
        attackDirection: "",
        hitsNotSunk: 0,
        missesInARow: 0,
        shotsFired: 0
    });
}

/**
 * Updates the probability visualization if enabled.
 *
 * @param {boolean} show - Whether to show the visualization
 */
export function updateProbabilityVisualization(show) {
    if (!show) return;

    const board = getPlayerBoard();
    const remainingLengths = getRemainingPlayerShipLengths();
    const aiState = getAIState();

    let probabilities = calculateProbabilities(board, remainingLengths);

    // Apply boost if we have active hits
    if (aiState.hitsNotSunk > 0) {
        probabilities = applyTargetModeBoost(probabilities, board);
    }

    // Display on the player's board
    displayProbabilityHeatmap(probabilities, (row, col) => {
        return document.getElementById(getPlayerCellId(row, col));
    });
}

/**
 * Gets AI statistics for display or debugging.
 *
 * @returns {Object} AI statistics
 */
export function getAIStats() {
    const aiState = getAIState();
    const remainingLengths = getRemainingPlayerShipLengths();

    return {
        shotsFired: aiState.shotsFired,
        missesInARow: aiState.missesInARow,
        hitsNotSunk: aiState.hitsNotSunk,
        currentDirection: aiState.attackDirection || "none",
        remainingShips: remainingLengths.length,
        mode: aiState.hitsNotSunk > 0 ? "Hunt" : "Search"
    };
}
