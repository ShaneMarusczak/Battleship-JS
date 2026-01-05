/**
 * @fileoverview CPU Board module for Battleship.
 *
 * This module manages the CPU's game board - the board where the player
 * fires torpedoes at the computer's ships. It handles:
 *
 * - Board initialization and rendering
 * - Random ship placement for the CPU
 * - Player torpedo firing mechanics
 * - Hit/miss detection and visual feedback
 * - Ship sinking detection
 * - Win condition checking
 *
 * The board is represented as a 10x10 grid where each cell contains:
 * [state, shipName, direction]
 *
 * @module game/cpuBoard
 */

"use strict";

import {
    BOARD_ROWS,
    BOARD_COLS,
    CELL_SIZE,
    WINNING_HIT_COUNT,
    CellState,
    SHIPS,
    CssClasses,
    SEARCHING_PHRASES,
    FIRING_PHRASES,
    COMPUTER_SUNK_PHRASES,
    DEFAULT_CELL_COLOR,
    HOVER_CELL_COLOR
} from "../config/constants.js";
import {
    getCpuBoard,
    isGameStarted,
    isGameOver,
    setGameOver,
    setCurrentHoverColor,
    getCurrentHoverColor,
    getPlayerHitCount,
    incrementPlayerHitCount,
    getCpuShipState,
    updateCpuShipState
} from "../state/gameState.js";
import {
    randomInt,
    getCpuCellId,
    sleep,
    uiBlocker,
    randomChoice
} from "../utils/helpers.js";
import { getById } from "../utils/dom.js";
import { playHitSound, playMissSound, playSunkSound } from "../utils/audio.js";
import { showModal } from "../ui/modal.js";
import { incrementPlayerWins } from "../utils/cookies.js";

/**
 * Reference to the board container element.
 * @type {HTMLElement|null}
 * @private
 */
let boardContainer = null;

/**
 * Array of ship coordinate arrays for sink detection.
 * @type {Array<Array<[number, number]>>}
 * @private
 */
const shipCoordinates = [];

/**
 * Callback function to trigger CPU's turn.
 * @type {Function|null}
 * @private
 */
let onPlayerTurnComplete = null;

/**
 * Initializes the CPU board.
 * Creates the grid, places ships randomly, and sets up event listeners.
 *
 * @param {Function} turnCompleteCallback - Called when player finishes their turn
 */
export function initializeCpuBoard(turnCompleteCallback) {
    onPlayerTurnComplete = turnCompleteCallback;
    boardContainer = getById("gameboard");

    if (!boardContainer) {
        console.error("CPU board container not found");
        return;
    }

    const board = getCpuBoard();

    // Create the visual grid
    for (let col = 0; col < BOARD_COLS; col++) {
        for (let row = 0; row < BOARD_ROWS; row++) {
            const cell = document.createElement("div");
            boardContainer.appendChild(cell);
            cell.id = getCpuCellId(row, col);

            // Position the cell
            const topPosition = row * CELL_SIZE + 5;
            const leftPosition = col * CELL_SIZE + 5;
            cell.style.top = topPosition + "px";
            cell.style.left = leftPosition + "px";
            cell.style.background = DEFAULT_CELL_COLOR;

            // Add hover effects
            cell.addEventListener("mouseover", handleCellHover);
            cell.addEventListener("mouseleave", handleCellLeave);

            // Add click handler for firing
            cell.addEventListener("click", handleCellClick);
        }
    }

    // Place ships randomly
    placeAllShips();

    // Setup debug key
    document.addEventListener("keydown", handleDebugKey);
}

/**
 * Handles cell hover - lightens the color.
 * @param {MouseEvent} event - Mouse event
 * @private
 */
function handleCellHover(event) {
    setCurrentHoverColor(event.target.style.backgroundColor);

    if (event.target.style.backgroundColor === DEFAULT_CELL_COLOR) {
        event.target.style.backgroundColor = HOVER_CELL_COLOR;
    }
}

/**
 * Handles cell mouse leave - restores original color.
 * @param {MouseEvent} event - Mouse event
 * @private
 */
function handleCellLeave(event) {
    event.target.style.backgroundColor = getCurrentHoverColor();
}

/**
 * Handles cell click - fires a torpedo.
 * @param {MouseEvent} event - Click event
 * @private
 */
function handleCellClick(event) {
    if (event.target !== event.currentTarget) return;

    fireTorpedo(event);
}

/**
 * Fires a torpedo at the clicked cell.
 *
 * @param {MouseEvent} event - Click event
 * @private
 */
async function fireTorpedo(event) {
    // Check game state
    if (!isGameStarted() || isGameOver()) {
        return;
    }

    const board = getCpuBoard();
    const cellId = event.target.id;
    const row = Number(cellId[1]);
    const col = Number(cellId[2]);

    const cellState = board[row][col][0];
    let shipSunkThisShot = false;
    let sunkShipName = null;

    // Disable further clicks during processing
    removeAllClickHandlers();

    if (cellState === CellState.EMPTY) {
        // Miss
        board[row][col][0] = CellState.MISS;
        const cell = getById(getCpuCellId(row, col));
        cell.classList.add(CssClasses.MISS);
        cell.classList.add(CssClasses.MISS_BACKGROUND);
        setCurrentHoverColor("#4d88ff");
        playMissSound();

    } else if (cellState === CellState.SHIP) {
        // Hit
        const cell = getById(getCpuCellId(row, col));
        cell.style.backgroundColor = "red";
        board[row][col][0] = CellState.HIT;
        cell.classList.add(CssClasses.HIT);
        setCurrentHoverColor("red");
        playHitSound();

        incrementPlayerHitCount();

        // Check if ship is sunk
        const result = checkShipSunk(row, col);
        if (result.sunk) {
            shipSunkThisShot = true;
            sunkShipName = result.shipName;
            setCurrentHoverColor("darkred");

            // Update visuals for sunk ship
            markShipAsSunk(result.shipName);

            // Update ship list
            const sunkElement = getById(result.shipName + "Sunk");
            if (sunkElement) {
                sunkElement.classList.add(CssClasses.SUNK_TEXT);
            }

            playSunkSound();
        }

        // Check win condition
        if (getPlayerHitCount() >= WINNING_HIT_COUNT) {
            handlePlayerWin();
            return;
        }

    } else if (cellState > CellState.SHIP) {
        // Already fired here
        await showModal("Can't Fire Here!", 1400);
        addAllClickHandlers();
        return;
    }

    // Trigger CPU turn with delay for dramatic effect
    await sleep(200);
    await showTurnTransition(shipSunkThisShot, sunkShipName);
}

/**
 * Shows the thinking/firing transition and triggers CPU turn.
 *
 * @param {boolean} shipSunk - Whether a ship was just sunk
 * @param {string|null} shipName - Name of sunk ship
 * @private
 */
async function showTurnTransition(shipSunk, shipName) {
    if (shipSunk) {
        // Show sunk message first
        const phrase = randomChoice(COMPUTER_SUNK_PHRASES);
        await showModal(phrase, 1500);
    }

    // Show thinking animation
    const thinkingEl = getById("thinking");
    const messageEl = getById("message");

    if (thinkingEl && messageEl) {
        thinkingEl.style.display = "flex";
        messageEl.innerText = randomChoice(SEARCHING_PHRASES);

        uiBlocker(2000);

        await sleep(1400);
        messageEl.innerText = randomChoice(FIRING_PHRASES);

        await sleep(600);
        thinkingEl.style.display = "none";
    }

    await sleep(300);

    // Re-enable clicks and trigger CPU turn
    addAllClickHandlers();

    if (onPlayerTurnComplete) {
        onPlayerTurnComplete();
    }
}

/**
 * Checks if hitting a cell sunk a ship.
 *
 * @param {number} hitRow - Row of the hit
 * @param {number} hitCol - Column of the hit
 * @returns {{sunk: boolean, shipName: string|null}} Result
 * @private
 */
function checkShipSunk(hitRow, hitCol) {
    const board = getCpuBoard();

    for (const ship of shipCoordinates) {
        for (const [row, col] of ship) {
            if (row === hitRow && col === hitCol) {
                // Found the ship - check if all cells are hit
                let allHit = true;
                for (const [r, c] of ship) {
                    if (board[r][c][0] !== CellState.HIT) {
                        allHit = false;
                        break;
                    }
                }

                if (allHit) {
                    const shipName = board[hitRow][hitCol][1];
                    return { sunk: true, shipName };
                }

                return { sunk: false, shipName: null };
            }
        }
    }

    return { sunk: false, shipName: null };
}

/**
 * Marks all cells of a sunk ship with dark red background.
 *
 * @param {string} shipName - Name of the sunk ship
 * @private
 */
function markShipAsSunk(shipName) {
    const board = getCpuBoard();

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (board[row][col][1] === shipName) {
                const cell = getById(getCpuCellId(row, col));
                if (cell) {
                    cell.style.backgroundColor = "darkred";
                }
            }
        }
    }
}

/**
 * Handles the player winning the game.
 * @private
 */
async function handlePlayerWin() {
    const wintextEl = getById("wintext");
    if (wintextEl) {
        wintextEl.style.display = "block";
    }

    setGameOver(true, "player");
    await showModal("YOU WIN!!!", 3000);

    const wins = incrementPlayerWins();
    const playerWinsEl = getById("playerWins");
    if (playerWinsEl) {
        playerWinsEl.textContent = "Player Wins: " + wins;
    }
}

/**
 * Places all ships randomly on the CPU board.
 * @private
 */
function placeAllShips() {
    const usedRows = [];
    const usedCols = [];

    // Generate some initial used positions for variety
    for (let i = 0; i < 5; i++) {
        usedRows.push(randomInt(0, 9));
        usedCols.push(randomInt(0, 9));
    }

    // Place each ship
    for (const ship of SHIPS) {
        placeShip(ship.length, ship.displayName, usedRows, usedCols);
    }
}

/**
 * Places a single ship randomly on the board.
 *
 * @param {number} length - Ship length
 * @param {string} name - Ship name
 * @param {number[]} usedRows - Rows to avoid as starting points
 * @param {number[]} usedCols - Columns to avoid as starting points
 * @private
 */
function placeShip(length, name, usedRows, usedCols) {
    const board = getCpuBoard();
    const coordinates = [];

    // Random direction: 1 = horizontal, 2 = vertical
    const direction = randomInt(1, 2);

    // Find a valid starting position
    let row, col;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        attempts++;

        // Get random position, preferring unused rows/cols
        do {
            row = randomInt(0, 9);
        } while (usedRows.includes(row) && attempts < 20);

        do {
            col = randomInt(0, 9);
        } while (usedCols.includes(col) && attempts < 20);

        // Check if ship fits
        if (canPlaceShipAt(board, row, col, length, direction)) {
            // Place the ship
            for (let i = 0; i < length; i++) {
                let r = row;
                let c = col;

                if (direction === 1) {
                    // Horizontal
                    c = col >= length - 1 ? col - i : col + i;
                } else {
                    // Vertical
                    r = row >= length - 1 ? row - i : row + i;
                }

                board[r][c][0] = CellState.SHIP;
                board[r][c][1] = name;
                coordinates.push([r, c]);
            }

            // Mark position as used
            usedRows.push(row);
            usedCols.push(col);

            // Store coordinates for sink detection
            shipCoordinates.push(coordinates);

            // Update ship state
            updateCpuShipState(name.toLowerCase(), {
                placed: true,
                coordinates: coordinates
            });

            return;
        }
    }

    // If we couldn't place after max attempts, try again with fresh random
    // This is a fallback - should rarely happen
    placeShip(length, name, [], []);
}

/**
 * Checks if a ship can be placed at the given position.
 *
 * @param {Array} board - Game board
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} length - Ship length
 * @param {number} direction - 1 for horizontal, 2 for vertical
 * @returns {boolean} True if placement is valid
 * @private
 */
function canPlaceShipAt(board, row, col, length, direction) {
    let validCells = 0;

    for (let i = 0; i < length; i++) {
        let r = row;
        let c = col;

        if (direction === 1) {
            // Horizontal
            c = col >= length - 1 ? col - i : col + i;
        } else {
            // Vertical
            r = row >= length - 1 ? row - i : row + i;
        }

        // Check bounds
        if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) {
            return false;
        }

        // Check if cell is empty
        if (board[r][c][0] === CellState.EMPTY) {
            validCells++;
        }
    }

    return validCells === length;
}

/**
 * Adds click handlers to all cells.
 * @private
 */
function addAllClickHandlers() {
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const cell = getById(getCpuCellId(row, col));
            if (cell) {
                cell.addEventListener("click", handleCellClick);
            }
        }
    }
}

/**
 * Removes click handlers from all cells.
 * @private
 */
function removeAllClickHandlers() {
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const cell = getById(getCpuCellId(row, col));
            if (cell) {
                cell.removeEventListener("click", handleCellClick);
            }
        }
    }
}

/**
 * Handles the debug key (backtick) to reveal ship positions.
 * @param {KeyboardEvent} event - Keyboard event
 * @private
 */
function handleDebugKey(event) {
    if (event.key === "`") {
        const board = getCpuBoard();
        console.log("CPU Board:", board);

        // Reveal ships visually
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                if (board[row][col][0] === CellState.SHIP) {
                    const cell = getById(getCpuCellId(row, col));
                    if (cell) {
                        cell.style.background = "white";
                    }
                }
            }
        }
    }
}

/**
 * Gets the CPU board for external access (e.g., for game over display).
 * @returns {Array} The CPU's game board
 */
export function getBoard() {
    return getCpuBoard();
}
