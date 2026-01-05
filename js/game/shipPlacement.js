/**
 * @fileoverview Ship Placement module for Battleship.
 *
 * This module handles the player's ship placement phase before the
 * game begins. It provides:
 *
 * - Click-to-select ship from the ship list
 * - Hover preview showing where ship will be placed
 * - Rotate functionality (horizontal/vertical)
 * - Click-to-place on the board
 * - Move already-placed ships
 * - Start game button when all ships are placed
 *
 * Ships are placed on the player's board (gameboard_cpu) where the
 * computer will later attack.
 *
 * @module game/shipPlacement
 */

"use strict";

import {
    BOARD_ROWS,
    BOARD_COLS,
    CellState,
    SHIP_LENGTHS,
    SHIPS,
    CssClasses,
    Direction
} from "../config/constants.js";
import {
    getPlayerBoard,
    isGameStarted,
    setGameStarted,
    updatePlayerShipState,
    areAllPlayerShipsPlaced
} from "../state/gameState.js";
import { getPlayerCellId, isValidCoordinate } from "../utils/helpers.js";
import { getById, addClassById, removeClassById, hasClassById } from "../utils/dom.js";
import { showModal } from "../ui/modal.js";
import {
    announce,
    announceShipPlacement,
    announceGameStart,
    getCellCoordinate,
    updateCellLabel
} from "../utils/accessibility.js";

/**
 * Currently selected ship for placement.
 * @type {string|null}
 * @private
 */
let selectedShip = null;

/**
 * Size of the currently selected ship.
 * @type {number}
 * @private
 */
let selectedShipSize = 0;

/**
 * Current placement direction.
 * @type {string}
 * @private
 */
let placementDirection = Direction.HORIZONTAL;

/**
 * Tracks which ships have been placed.
 * @type {Object.<string, boolean>}
 * @private
 */
const placedShips = {
    carrier: false,
    battleship: false,
    cruiser: false,
    submarine: false,
    destroyer: false
};

/**
 * Coordinates of placed ships for move functionality.
 * @type {Array<Array<[number, number]>>}
 * @private
 */
const placedShipCoordinates = [];

/**
 * Count of ships placed.
 * @type {number}
 * @private
 */
let shipsPlacedCount = 0;

/**
 * Initializes the ship placement system.
 * Sets up click handlers for ships and board cells.
 */
export function initializeShipPlacement() {
    // Setup click handlers for each ship in the list
    for (const ship of SHIPS) {
        const shipElement = getById(ship.name);
        if (shipElement) {
            shipElement.addEventListener("click", handleShipSelect);
        }
    }

    // Setup rotate button
    const rotateBtn = getById("rotate");
    if (rotateBtn) {
        rotateBtn.addEventListener("click", handleRotate);
    }

    // Setup start game button
    const startBtn = getById("startGame");
    if (startBtn) {
        startBtn.addEventListener("click", handleStartGame);
    }

    // Setup board cell hover and click handlers
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const cell = getById(getPlayerCellId(row, col));
            if (cell) {
                cell.addEventListener("mouseover", handleCellHover);
                cell.addEventListener("mouseleave", handleCellLeave);
            }
        }
    }
}

/**
 * Handles clicking on a ship in the ship list.
 * @param {MouseEvent} event - Click event
 * @private
 */
function handleShipSelect(event) {
    if (isGameStarted()) return;

    // Get the ship element (might be the p child)
    let shipElement = event.target;
    if (shipElement.tagName === "P") {
        shipElement = shipElement.parentElement;
    }

    const shipName = shipElement.id;

    // If already placed, don't allow re-selection
    if (placedShips[shipName]) {
        return;
    }

    // Toggle selection
    if (selectedShip === shipName) {
        // Deselect
        deselectShip();
        return;
    }

    // Deselect previous
    deselectAllShips();

    // Select new ship
    selectedShip = shipName;
    selectedShipSize = SHIP_LENGTHS[shipName];
    shipElement.classList.add(CssClasses.CLICKED);

    // Announce ship selection for accessibility
    announceShipPlacement(shipName, selectedShipSize);
}

/**
 * Deselects the currently selected ship.
 * @private
 */
function deselectShip() {
    if (selectedShip) {
        removeClassById(selectedShip, CssClasses.CLICKED);
    }
    selectedShip = null;
    selectedShipSize = 0;
}

/**
 * Deselects all ships.
 * @private
 */
function deselectAllShips() {
    for (const ship of SHIPS) {
        removeClassById(ship.name, CssClasses.CLICKED);
    }
    selectedShip = null;
    selectedShipSize = 0;
}

/**
 * Handles the rotate button click.
 * @private
 */
function handleRotate() {
    if (placementDirection === Direction.HORIZONTAL) {
        placementDirection = Direction.VERTICAL;
    } else {
        placementDirection = Direction.HORIZONTAL;
    }

    // Clear any current highlights
    clearHighlights();
}

/**
 * Handles hovering over a board cell.
 * Shows preview of ship placement.
 * @param {MouseEvent} event - Mouse event
 * @private
 */
function handleCellHover(event) {
    if (!selectedShip || selectedShipSize === 0 || isGameStarted()) {
        return;
    }

    const cellId = event.target.id;
    const startRow = Number(cellId[1]);
    const startCol = Number(cellId[2]);

    // Get cells that would be occupied
    const cells = getPlacementCells(startRow, startCol);

    if (cells.length === selectedShipSize && canPlaceAt(cells)) {
        // Valid placement - highlight cells
        for (const [row, col] of cells) {
            addClassById(getPlayerCellId(row, col), CssClasses.BLACK_BACKGROUND);
        }

        // Add click handler for placement
        event.target.addEventListener("click", handlePlaceShip);
    }
}

/**
 * Handles mouse leaving a board cell.
 * Removes placement preview.
 * @param {MouseEvent} event - Mouse event
 * @private
 */
function handleCellLeave(event) {
    clearHighlights();
    event.target.removeEventListener("click", handlePlaceShip);
}

/**
 * Clears all placement highlights.
 * @private
 */
function clearHighlights() {
    const board = getPlayerBoard();

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            // Only clear if cell is empty (not a placed ship)
            if (board[row][col][0] === CellState.EMPTY) {
                removeClassById(getPlayerCellId(row, col), CssClasses.BLACK_BACKGROUND);
                removeClassById(getPlayerCellId(row, col), CssClasses.GREY_BACKGROUND);
            }
        }
    }
}

/**
 * Gets the cells that would be occupied by placing a ship.
 *
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @returns {Array<[number, number]>} Array of [row, col] coordinates
 * @private
 */
function getPlacementCells(startRow, startCol) {
    const cells = [];

    for (let i = 0; i < selectedShipSize; i++) {
        let row = startRow;
        let col = startCol;

        if (placementDirection === Direction.HORIZONTAL) {
            col = startCol + i;
        } else {
            row = startRow + i;
        }

        // Check bounds
        if (!isValidCoordinate(row, col)) {
            return []; // Invalid placement
        }

        cells.push([row, col]);
    }

    return cells;
}

/**
 * Checks if a ship can be placed at the given cells.
 *
 * @param {Array<[number, number]>} cells - Cells to check
 * @returns {boolean} True if placement is valid
 * @private
 */
function canPlaceAt(cells) {
    const board = getPlayerBoard();

    for (const [row, col] of cells) {
        if (board[row][col][0] !== CellState.EMPTY) {
            return false;
        }
    }

    return true;
}

/**
 * Handles clicking to place a ship.
 * @param {MouseEvent} event - Click event
 * @private
 */
function handlePlaceShip(event) {
    if (!selectedShip || isGameStarted()) {
        return;
    }

    const board = getPlayerBoard();
    const cellId = event.target.id;
    const startRow = Number(cellId[1]);
    const startCol = Number(cellId[2]);

    const cells = getPlacementCells(startRow, startCol);

    if (cells.length !== selectedShipSize || !canPlaceAt(cells)) {
        return;
    }

    // Place the ship
    const shipCoords = [];

    for (const [row, col] of cells) {
        board[row][col][0] = CellState.SHIP;
        board[row][col][1] = selectedShip;
        board[row][col][2] = placementDirection;
        shipCoords.push([row, col]);

        // Setup move functionality
        const cell = getById(getPlayerCellId(row, col));
        if (cell) {
            cell.addEventListener("click", handleMoveShip);
            cell.addEventListener("mouseover", handlePlacedShipHover);
            cell.addEventListener("mouseleave", handlePlacedShipLeave);
            cell.classList.add(CssClasses.CURSOR_POINTER);

            // Update accessibility label
            const coordinate = getCellCoordinate(row, col);
            updateCellLabel(getPlayerCellId(row, col), `${coordinate}, your ${selectedShip}`);
        }
    }

    // Update state
    placedShips[selectedShip] = true;
    placedShipCoordinates.push(shipCoords);
    shipsPlacedCount++;

    updatePlayerShipState(selectedShip, {
        placed: true,
        coordinates: shipCoords
    });

    // Hide ship from list
    addClassById(selectedShip, CssClasses.HIDDEN);

    // Announce ship placement
    const startCoord = getCellCoordinate(startRow, startCol);
    const direction = placementDirection === Direction.HORIZONTAL ? "horizontally" : "vertically";
    announce(`${selectedShip} placed at ${startCoord}, ${direction}. ${5 - shipsPlacedCount} ships remaining.`);

    // Check if all ships placed
    if (shipsPlacedCount === 5) {
        removeClassById("startGame", CssClasses.NOT_DISPLAYED);
        const instructionsEl = getById("instructions");
        if (instructionsEl) {
            instructionsEl.innerHTML = "<b>Placed ships can be moved before starting!</b>";
        }
        announce("All ships placed! Press Enter on the Start Game button to begin.");
    }

    // Deselect ship
    deselectShip();
}

/**
 * Handles hovering over an already-placed ship.
 * @param {MouseEvent} event - Mouse event
 * @private
 */
function handlePlacedShipHover(event) {
    if (selectedShipSize > 0 || isGameStarted()) {
        return;
    }

    const board = getPlayerBoard();
    const cellId = event.target.id;
    const row = Number(cellId[1]);
    const col = Number(cellId[2]);

    const shipName = board[row][col][1];
    if (!shipName) return;

    // Highlight all cells of this ship
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (board[r][c][1] === shipName) {
                const cell = getById(getPlayerCellId(r, c));
                if (cell) {
                    cell.classList.remove(CssClasses.BLACK_BACKGROUND);
                    cell.classList.add(CssClasses.GREY_BACKGROUND);
                }
            }
        }
    }
}

/**
 * Handles leaving a placed ship cell.
 * @param {MouseEvent} event - Mouse event
 * @private
 */
function handlePlacedShipLeave(event) {
    const board = getPlayerBoard();
    const cellId = event.target.id;
    const row = Number(cellId[1]);
    const col = Number(cellId[2]);

    const shipName = board[row][col][1];
    if (!shipName) return;

    // Restore black background for all cells of this ship
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (board[r][c][1] === shipName) {
                const cell = getById(getPlayerCellId(r, c));
                if (cell) {
                    cell.classList.add(CssClasses.BLACK_BACKGROUND);
                    cell.classList.remove(CssClasses.GREY_BACKGROUND);
                }
            }
        }
    }
}

/**
 * Handles clicking on a placed ship to move it.
 * @param {MouseEvent} event - Click event
 * @private
 */
function handleMoveShip(event) {
    if (selectedShipSize > 0 || isGameStarted()) {
        return;
    }

    event.stopImmediatePropagation();

    const board = getPlayerBoard();
    const cellId = event.target.id;
    const row = Number(cellId[1]);
    const col = Number(cellId[2]);

    const shipName = board[row][col][1];
    const shipDirection = board[row][col][2];

    if (!shipName) return;

    // Find and remove ship from placedShipCoordinates
    let shipCoords = null;
    for (let i = 0; i < placedShipCoordinates.length; i++) {
        for (const [r, c] of placedShipCoordinates[i]) {
            if (r === row && c === col) {
                shipCoords = placedShipCoordinates[i];
                placedShipCoordinates.splice(i, 1);
                break;
            }
        }
        if (shipCoords) break;
    }

    // Clear the ship from board
    for (const [r, c] of shipCoords) {
        board[r][c][0] = CellState.EMPTY;
        board[r][c][1] = "";
        board[r][c][2] = "";

        const cell = getById(getPlayerCellId(r, c));
        if (cell) {
            cell.removeEventListener("click", handleMoveShip);
            cell.removeEventListener("mouseover", handlePlacedShipHover);
            cell.removeEventListener("mouseleave", handlePlacedShipLeave);
            cell.classList.remove(CssClasses.CURSOR_POINTER);
            cell.classList.remove(CssClasses.BLACK_BACKGROUND);
            cell.classList.remove(CssClasses.GREY_BACKGROUND);
        }
    }

    // Update state
    placedShips[shipName] = false;
    shipsPlacedCount--;

    updatePlayerShipState(shipName, {
        placed: false,
        coordinates: []
    });

    // Show ship in list again
    removeClassById(shipName, CssClasses.HIDDEN);

    // Hide start button if not all ships placed
    if (shipsPlacedCount < 5) {
        addClassById("startGame", CssClasses.NOT_DISPLAYED);
    }

    // Select this ship for re-placement
    deselectAllShips();
    selectedShip = shipName;
    selectedShipSize = SHIP_LENGTHS[shipName];
    addClassById(shipName, CssClasses.CLICKED);

    // Set direction to match original placement
    placementDirection = shipDirection || Direction.HORIZONTAL;
}

/**
 * Handles clicking the start game button.
 * @private
 */
async function handleStartGame() {
    if (shipsPlacedCount !== 5) {
        return;
    }

    // Hide ship selection UI
    addClassById("downArrow", CssClasses.NOT_DISPLAYED);
    removeClassById("leftList", CssClasses.NOT_DISPLAYED);
    addClassById("ships", CssClasses.NOT_DISPLAYED);
    addClassById("startGame", CssClasses.NOT_DISPLAYED);
    removeClassById("strtOvrBtn", CssClasses.NOT_DISPLAYED);

    // Remove move functionality from placed ships
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const cell = getById(getPlayerCellId(row, col));
            if (cell) {
                cell.removeEventListener("mouseleave", clearHighlights);
                cell.removeEventListener("click", handleMoveShip);
                cell.removeEventListener("mouseover", handlePlacedShipHover);
                cell.removeEventListener("mouseleave", handlePlacedShipLeave);
                cell.classList.remove(CssClasses.CURSOR_POINTER);
            }
        }
    }

    // Start the game
    setGameStarted(true);

    // Announce game start for accessibility
    announceGameStart();

    await showModal("Game on!", 1500);
}

/**
 * Checks if all ships have been placed.
 * @returns {boolean} True if all ships are placed
 */
export function allShipsPlaced() {
    return shipsPlacedCount === 5;
}

/**
 * Gets the current placement state for debugging.
 * @returns {Object} Placement state
 */
export function getPlacementState() {
    return {
        selectedShip,
        selectedShipSize,
        placementDirection,
        placedShips: { ...placedShips },
        shipsPlacedCount
    };
}
