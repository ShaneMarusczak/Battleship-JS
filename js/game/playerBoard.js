/**
 * @fileoverview Player Board module for Battleship.
 *
 * This module manages the player's game board - the board where the
 * computer AI fires torpedoes. It handles:
 *
 * - Board initialization and rendering
 * - Processing AI moves
 * - Visual feedback for hits/misses
 * - Ship sinking detection and display
 * - Loss condition checking
 * - Probability visualization (optional debug feature)
 *
 * The board works closely with the AI controller and ship placement
 * modules to create a complete gameplay experience.
 *
 * @module game/playerBoard
 */

"use strict";

import {
    BOARD_ROWS,
    BOARD_COLS,
    CELL_SIZE,
    CellState,
    SHIP_LENGTHS,
    CssClasses,
    PLAYER_SUNK_PHRASES,
    WATER_COLOR
} from "../config/constants.js";
import {
    getPlayerBoard,
    getCpuBoard,
    isGameStarted,
    isGameOver,
    setGameOver,
    getPlayerShipState,
    updatePlayerShipState,
    areAllPlayerShipsPlaced,
    areAllPlayerShipsSunk
} from "../state/gameState.js";
import {
    getPlayerCellId,
    getCpuCellId,
    capitalizeFirst,
    randomChoice,
    sleep
} from "../utils/helpers.js";
import { getById, addClassById, removeClassById } from "../utils/dom.js";
import { playSunkSound } from "../utils/audio.js";
import { showModal } from "../ui/modal.js";
import { incrementComputerWins } from "../utils/cookies.js";
import { executeAIMove, updateProbabilityVisualization } from "../ai/aiController.js";

/**
 * Reference to the board container element.
 * @type {HTMLElement|null}
 * @private
 */
let boardContainer = null;

/**
 * Initializes the player's board.
 * Creates the grid and sets up for ship placement.
 */
export function initializePlayerBoard() {
    boardContainer = getById("gameboard_cpu");

    if (!boardContainer) {
        console.error("Player board container not found");
        return;
    }

    const board = getPlayerBoard();

    // Create the visual grid
    for (let col = 0; col < BOARD_COLS; col++) {
        for (let row = 0; row < BOARD_ROWS; row++) {
            const cell = document.createElement("div");
            boardContainer.appendChild(cell);
            cell.id = getPlayerCellId(row, col);

            // Position the cell
            const topPosition = row * CELL_SIZE + 5;
            const leftPosition = col * CELL_SIZE + 5;
            cell.style.top = topPosition + "px";
            cell.style.left = leftPosition + "px";
            cell.style.backgroundColor = WATER_COLOR;
        }
    }

    // Setup debug key
    document.addEventListener("keydown", handleDebugKey);
}

/**
 * Executes the computer's turn.
 * Gets the AI's move, applies it to the board, and updates the UI.
 *
 * @returns {Promise<void>}
 */
export async function executeComputerTurn() {
    if (!isGameStarted() || isGameOver()) {
        return;
    }

    if (!areAllPlayerShipsPlaced()) {
        await showModal("Place all ships!", 1400);
        return;
    }

    // Execute the AI move
    const move = executeAIMove();

    // Update the visual display
    updateCellDisplay(move.row, move.col, move.isHit);

    // Update hit indicators on ship list
    updateShipHitIndicators();

    // Handle ship sunk
    if (move.shipSunk) {
        await handleShipSunk(move.shipSunkName);
    }

    // Check for game over
    if (areAllPlayerShipsSunk()) {
        await handleComputerWin();
    }

    // Update probability visualization if enabled
    const visualizeCheckbox = getById("visualize");
    if (visualizeCheckbox && visualizeCheckbox.checked) {
        updateProbabilityVisualization(true);
    }
}

/**
 * Updates the visual display of a cell after it's been fired at.
 *
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {boolean} isHit - Whether the shot was a hit
 * @private
 */
function updateCellDisplay(row, col, isHit) {
    const cell = getById(getPlayerCellId(row, col));
    if (!cell) return;

    if (isHit) {
        cell.classList.remove(CssClasses.BLACK_BACKGROUND);
        cell.classList.add(CssClasses.RED_BACKGROUND);
    } else {
        cell.classList.remove(CssClasses.BLACK_BACKGROUND);
        cell.classList.add(CssClasses.MISS_BACKGROUND);
    }
}

/**
 * Updates the ship list to show which ships have been hit.
 * @private
 */
function updateShipHitIndicators() {
    const board = getPlayerBoard();
    const ships = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];

    for (const shipName of ships) {
        // Check if any cell of this ship has been hit
        let hasHit = false;

        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                if (board[row][col][1] === shipName &&
                    (board[row][col][0] === CellState.HIT || board[row][col][0] === CellState.SUNK)) {
                    hasHit = true;
                    break;
                }
            }
            if (hasHit) break;
        }

        if (hasHit) {
            const element = getById(shipName + "Sunk_cpu");
            if (element && !element.classList.contains(CssClasses.SUNK_TEXT)) {
                element.classList.add(CssClasses.HIT_TEXT);
            }
        }
    }
}

/**
 * Handles a ship being sunk.
 *
 * @param {string} shipName - Name of the sunk ship
 * @private
 */
async function handleShipSunk(shipName) {
    playSunkSound();

    // Update ship list visual
    const element = getById(shipName + "Sunk_cpu");
    if (element) {
        element.classList.remove(CssClasses.HIT_TEXT);
        element.classList.add(CssClasses.SUNK_TEXT);
    }

    // Change hit cells to dark red
    markShipAsSunk(shipName);

    // Update ship state
    updatePlayerShipState(shipName, { sunk: true });

    // Show taunt message
    const phrase = randomInt(0, 10) === 0
        ? capitalizeFirst(shipName) + " Sunk!"
        : randomChoice(PLAYER_SUNK_PHRASES);

    await showModal(phrase, 1500);
}

/**
 * Random integer helper for message selection.
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 * @private
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Marks all cells of a sunk ship with dark red background.
 *
 * @param {string} shipName - Name of the sunk ship
 * @private
 */
function markShipAsSunk(shipName) {
    const board = getPlayerBoard();

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (board[row][col][1] === shipName) {
                const cell = getById(getPlayerCellId(row, col));
                if (cell) {
                    cell.classList.add(CssClasses.DARK_RED_BACKGROUND);
                    cell.classList.remove(CssClasses.RED_BACKGROUND);
                }
                board[row][col][0] = CellState.SUNK;
            }
        }
    }
}

/**
 * Handles the computer winning the game.
 * @private
 */
async function handleComputerWin() {
    const losstextEl = getById("losstext");
    if (losstextEl) {
        losstextEl.style.display = "block";
    }

    setGameOver(true, "cpu");

    // Reveal remaining CPU ships
    revealCpuShips();

    await sleep(1500);
    await showModal("HA HA! I WIN!", 2000);

    const wins = incrementComputerWins();
    const compWinsEl = getById("compWins");
    if (compWinsEl) {
        compWinsEl.textContent = "Computer Wins: " + wins;
    }
}

/**
 * Reveals all unfired-at CPU ships when game ends.
 * @private
 */
function revealCpuShips() {
    const cpuBoard = getCpuBoard();

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (cpuBoard[row][col][0] === CellState.SHIP) {
                addClassById(getCpuCellId(row, col), CssClasses.BLACK_BACKGROUND);
            }
        }
    }
}

/**
 * Handles the debug key (backtick) to show probability visualization.
 * @param {KeyboardEvent} event - Keyboard event
 * @private
 */
function handleDebugKey(event) {
    if (event.key === "`") {
        const board = getPlayerBoard();
        console.log("Player Board:", board);

        // Show probability visualization
        updateProbabilityVisualization(true);
    }
}

/**
 * Gets the player board for external access.
 * @returns {Array} The player's game board
 */
export function getBoard() {
    return getPlayerBoard();
}

/**
 * Checks if all player ships are sunk (game over condition).
 * @returns {boolean} True if all ships are sunk
 */
export function checkGameOver() {
    return areAllPlayerShipsSunk();
}
