/**
 * @fileoverview Accessibility utilities for Battleship.
 *
 * This module provides comprehensive accessibility support including:
 * - Screen reader announcements via ARIA live regions
 * - Keyboard navigation for game boards
 * - Focus management
 * - Accessible labels and descriptions
 *
 * Accessibility features implemented:
 * - Arrow key navigation between cells
 * - Enter/Space to fire or place ships
 * - Tab navigation between major sections
 * - Live announcements for all game events
 * - High contrast focus indicators
 * - Screen reader descriptions for all game elements
 *
 * @module utils/accessibility
 */

"use strict";

import { BOARD_ROWS, BOARD_COLS } from "../config/constants.js";
import { isValidCoordinate, getPlayerCellId, getCpuCellId } from "./helpers.js";

/**
 * Reference to the live region element for announcements.
 * @type {HTMLElement|null}
 * @private
 */
let liveRegion = null;

/**
 * Reference to the polite live region for less urgent announcements.
 * @type {HTMLElement|null}
 * @private
 */
let politeRegion = null;

/**
 * Currently focused cell coordinates.
 * @type {{row: number, col: number, board: string}}
 * @private
 */
let focusedCell = { row: 0, col: 0, board: "cpu" };

/**
 * Initializes accessibility features.
 * Creates live regions and sets up global keyboard handlers.
 */
export function initializeAccessibility() {
    createLiveRegions();
    setupGlobalKeyboardHandlers();
    addBoardAccessibility();
}

/**
 * Creates ARIA live regions for screen reader announcements.
 * @private
 */
function createLiveRegions() {
    // Assertive live region for important announcements (hits, wins, etc.)
    liveRegion = document.createElement("div");
    liveRegion.id = "game-announcer";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "assertive");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);

    // Polite live region for less urgent announcements
    politeRegion = document.createElement("div");
    politeRegion.id = "game-status";
    politeRegion.setAttribute("role", "log");
    politeRegion.setAttribute("aria-live", "polite");
    politeRegion.setAttribute("aria-atomic", "false");
    politeRegion.className = "sr-only";
    document.body.appendChild(politeRegion);
}

/**
 * Announces a message to screen readers via the assertive live region.
 * Used for important game events like hits, misses, and wins.
 *
 * @param {string} message - The message to announce
 * @param {boolean} [assertive=true] - Use assertive (interrupt) or polite mode
 */
export function announce(message, assertive = true) {
    const region = assertive ? liveRegion : politeRegion;

    if (region) {
        // Clear and re-set to ensure announcement
        region.textContent = "";

        // Use setTimeout to ensure the DOM update triggers the announcement
        setTimeout(() => {
            region.textContent = message;
        }, 50);
    }
}

/**
 * Converts column number to letter (0=A, 1=B, etc.).
 *
 * @param {number} col - Column index (0-9)
 * @returns {string} Column letter (A-J)
 */
export function columnToLetter(col) {
    return String.fromCharCode(65 + col);
}

/**
 * Converts row number to display number (0-indexed to 1-indexed).
 *
 * @param {number} row - Row index (0-9)
 * @returns {string} Row number (1-10)
 */
export function rowToNumber(row) {
    return String(row + 1);
}

/**
 * Gets a human-readable cell coordinate string.
 *
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string} Coordinate string like "A1" or "J10"
 */
export function getCellCoordinate(row, col) {
    return `${columnToLetter(col)}${rowToNumber(row)}`;
}

/**
 * Gets a description of a cell's current state.
 *
 * @param {number} cellState - Cell state value
 * @param {string} shipName - Ship name if present
 * @param {boolean} isPlayerBoard - Whether this is the player's board
 * @returns {string} Description of the cell
 */
export function getCellStateDescription(cellState, shipName, isPlayerBoard) {
    switch (cellState) {
        case 0: // EMPTY
            return isPlayerBoard ? "empty water" : "unknown";
        case 1: // SHIP
            return isPlayerBoard ? `your ${shipName}` : "unknown";
        case 2: // HIT
            return isPlayerBoard ? `${shipName}, hit` : "hit";
        case 3: // MISS
            return "miss";
        case 4: // SUNK
            return isPlayerBoard ? `${shipName}, sunk` : "sunk ship";
        default:
            return "unknown";
    }
}

/**
 * Sets up global keyboard handlers for navigation.
 * @private
 */
function setupGlobalKeyboardHandlers() {
    document.addEventListener("keydown", handleGlobalKeydown);
}

/**
 * Handles global keyboard events.
 *
 * @param {KeyboardEvent} event - Keyboard event
 * @private
 */
function handleGlobalKeydown(event) {
    // Don't handle if user is typing in an input
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        return;
    }

    switch (event.key) {
        case "?":
            // Show keyboard shortcuts help
            announceKeyboardShortcuts();
            event.preventDefault();
            break;

        case "Escape":
            // Announce current game state
            announce("Press Tab to navigate between sections. Use arrow keys on game boards.");
            event.preventDefault();
            break;
    }
}

/**
 * Announces available keyboard shortcuts.
 * @private
 */
function announceKeyboardShortcuts() {
    const shortcuts = [
        "Keyboard shortcuts:",
        "Arrow keys: Move between cells",
        "Enter or Space: Fire torpedo or place ship",
        "R: Rotate ship during placement",
        "Tab: Move to next section",
        "Escape: Hear instructions",
        "Question mark: Hear this help message"
    ].join(". ");

    announce(shortcuts);
}

/**
 * Adds accessibility attributes and keyboard handlers to game boards.
 */
export function addBoardAccessibility() {
    // Player's board (where CPU attacks)
    const playerBoard = document.getElementById("gameboard_cpu");
    if (playerBoard) {
        playerBoard.setAttribute("role", "application");
        playerBoard.setAttribute("aria-label", "Your fleet - place ships here and defend against computer attacks");
        playerBoard.setAttribute("tabindex", "0");

        addBoardKeyboardNavigation(playerBoard, "player");
    }

    // CPU's board (where player attacks)
    const cpuBoard = document.getElementById("gameboard");
    if (cpuBoard) {
        cpuBoard.setAttribute("role", "application");
        cpuBoard.setAttribute("aria-label", "Enemy waters - fire torpedoes here to find and sink computer ships");
        cpuBoard.setAttribute("tabindex", "0");

        addBoardKeyboardNavigation(cpuBoard, "cpu");
    }
}

/**
 * Adds keyboard navigation to a game board.
 *
 * @param {HTMLElement} board - Board container element
 * @param {string} boardType - "player" or "cpu"
 * @private
 */
function addBoardKeyboardNavigation(board, boardType) {
    board.addEventListener("keydown", (event) => {
        handleBoardKeydown(event, boardType);
    });

    board.addEventListener("focus", () => {
        // When board receives focus, focus the first or last focused cell
        if (focusedCell.board === boardType) {
            focusCellVisually(focusedCell.row, focusedCell.col, boardType);
        } else {
            focusedCell = { row: 0, col: 0, board: boardType };
            focusCellVisually(0, 0, boardType);
        }

        announceCell(focusedCell.row, focusedCell.col, boardType);
    });
}

/**
 * Handles keyboard events on a game board.
 *
 * @param {KeyboardEvent} event - Keyboard event
 * @param {string} boardType - "player" or "cpu"
 * @private
 */
function handleBoardKeydown(event, boardType) {
    let { row, col } = focusedCell;
    let handled = true;

    switch (event.key) {
        case "ArrowUp":
            row = Math.max(0, row - 1);
            break;
        case "ArrowDown":
            row = Math.min(BOARD_ROWS - 1, row + 1);
            break;
        case "ArrowLeft":
            col = Math.max(0, col - 1);
            break;
        case "ArrowRight":
            col = Math.min(BOARD_COLS - 1, col + 1);
            break;
        case "Home":
            col = 0;
            break;
        case "End":
            col = BOARD_COLS - 1;
            break;
        case "PageUp":
            row = 0;
            break;
        case "PageDown":
            row = BOARD_ROWS - 1;
            break;
        case "Enter":
        case " ":
            // Trigger click on the focused cell
            const cellId = boardType === "cpu"
                ? getCpuCellId(row, col)
                : getPlayerCellId(row, col);
            const cell = document.getElementById(cellId);
            if (cell) {
                cell.click();
            }
            break;
        case "r":
        case "R":
            // Rotate ship during placement
            const rotateBtn = document.getElementById("rotate");
            if (rotateBtn) {
                rotateBtn.click();
                announce("Ship rotated");
            }
            break;
        default:
            handled = false;
    }

    if (handled) {
        event.preventDefault();
        event.stopPropagation();

        // Update focus if position changed
        if (row !== focusedCell.row || col !== focusedCell.col) {
            focusedCell = { row, col, board: boardType };
            focusCellVisually(row, col, boardType);
            announceCell(row, col, boardType);
        }
    }
}

/**
 * Visually focuses a cell (adds focus ring).
 *
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {string} boardType - "player" or "cpu"
 * @private
 */
function focusCellVisually(row, col, boardType) {
    // Remove focus from all cells first
    document.querySelectorAll(".cell-focused").forEach(cell => {
        cell.classList.remove("cell-focused");
    });

    // Add focus to the target cell
    const cellId = boardType === "cpu"
        ? getCpuCellId(row, col)
        : getPlayerCellId(row, col);
    const cell = document.getElementById(cellId);

    if (cell) {
        cell.classList.add("cell-focused");
    }
}

/**
 * Announces the current cell's position and state.
 *
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {string} boardType - "player" or "cpu"
 * @private
 */
function announceCell(row, col, boardType) {
    const coordinate = getCellCoordinate(row, col);
    const boardName = boardType === "cpu" ? "enemy waters" : "your fleet";

    // Get cell state from the game state
    let stateDescription = "unknown";

    // We'll get the actual state when the cell modules set up their cells
    const cellId = boardType === "cpu"
        ? getCpuCellId(row, col)
        : getPlayerCellId(row, col);
    const cell = document.getElementById(cellId);

    if (cell) {
        stateDescription = cell.getAttribute("aria-label") || stateDescription;
    }

    announce(`${coordinate}, ${stateDescription}`, false);
}

/**
 * Updates the ARIA label on a cell when its state changes.
 *
 * @param {string} cellId - Cell element ID
 * @param {string} description - New state description
 */
export function updateCellLabel(cellId, description) {
    const cell = document.getElementById(cellId);
    if (cell) {
        cell.setAttribute("aria-label", description);
    }
}

/**
 * Sets up a cell with accessibility attributes.
 *
 * @param {HTMLElement} cell - Cell element
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {boolean} isPlayerBoard - Whether this is the player's board
 */
export function setupAccessibleCell(cell, row, col, isPlayerBoard) {
    const coordinate = getCellCoordinate(row, col);

    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `${coordinate}, ${isPlayerBoard ? "empty" : "unknown"}`);
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);
}

/**
 * Announces a hit event.
 *
 * @param {string} coordinate - Cell coordinate (e.g., "A5")
 * @param {string} [shipName] - Name of ship hit, if known
 */
export function announceHit(coordinate, shipName) {
    if (shipName) {
        announce(`Hit! ${coordinate} hit the ${shipName}!`);
    } else {
        announce(`Hit! ${coordinate} is a hit!`);
    }
}

/**
 * Announces a miss event.
 *
 * @param {string} coordinate - Cell coordinate
 */
export function announceMiss(coordinate) {
    announce(`Miss. ${coordinate} is a miss.`);
}

/**
 * Announces a ship sinking.
 *
 * @param {string} shipName - Name of the sunk ship
 * @param {boolean} isPlayerShip - Whether it's the player's ship
 */
export function announceShipSunk(shipName, isPlayerShip) {
    if (isPlayerShip) {
        announce(`Your ${shipName} has been sunk!`);
    } else {
        announce(`You sunk the computer's ${shipName}!`);
    }
}

/**
 * Announces game over.
 *
 * @param {boolean} playerWon - Whether the player won
 */
export function announceGameOver(playerWon) {
    if (playerWon) {
        announce("Congratulations! You won the game! All enemy ships have been sunk.");
    } else {
        announce("Game over. The computer has sunk all your ships. Click Start Over to play again.");
    }
}

/**
 * Announces the start of the game.
 */
export function announceGameStart() {
    announce("Game started! Use arrow keys to navigate the enemy waters board, then press Enter to fire.");
}

/**
 * Announces ship placement instructions.
 *
 * @param {string} shipName - Name of the ship to place
 * @param {number} shipLength - Length of the ship
 */
export function announceShipPlacement(shipName, shipLength) {
    announce(`Place your ${shipName}, ${shipLength} cells long. Use arrow keys to position, R to rotate, Enter to place.`);
}

/**
 * Announces whose turn it is.
 *
 * @param {boolean} isPlayerTurn - Whether it's the player's turn
 */
export function announceTurn(isPlayerTurn) {
    if (isPlayerTurn) {
        announce("Your turn. Navigate to a cell and press Enter to fire.", false);
    } else {
        announce("Computer's turn.", false);
    }
}

/**
 * Creates a visually hidden skip link.
 *
 * @param {string} targetId - ID of the element to skip to
 * @param {string} text - Link text
 * @returns {HTMLAnchorElement} The skip link element
 */
export function createSkipLink(targetId, text) {
    const link = document.createElement("a");
    link.href = `#${targetId}`;
    link.className = "skip-link";
    link.textContent = text;

    link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView();
        }
    });

    return link;
}
