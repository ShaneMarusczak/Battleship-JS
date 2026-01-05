/**
 * @fileoverview Centralized game state management for Battleship.
 * Replaces the global window.* variables with a proper state management system.
 * Uses the observer pattern to notify listeners of state changes.
 * @module state/gameState
 */

"use strict";

import { BOARD_ROWS, BOARD_COLS, CellState } from "../config/constants.js";

/**
 * @typedef {Object} ShipState
 * @property {boolean} placed - Whether the ship has been placed on the board
 * @property {boolean} sunk - Whether the ship has been sunk
 * @property {Array<[number, number]>} coordinates - Array of [row, col] positions
 */

/**
 * @typedef {Object} AIState
 * @property {number} lastShotX - Row of the AI's last shot
 * @property {number} lastShotY - Column of the AI's last shot
 * @property {string} attackDirection - Current direction when hunting a ship ("u", "d", "l", "r", or "")
 * @property {number} hitsNotSunk - Count of hit cells that aren't part of a sunk ship
 * @property {number} missesInARow - Consecutive misses (resets on hit)
 * @property {number} shotsFired - Total shots fired by AI
 */

/**
 * @typedef {Object} GameState
 * @property {boolean} isStarted - Whether the game has begun
 * @property {boolean} isOver - Whether the game has ended
 * @property {string|null} winner - "player" or "cpu" or null
 * @property {Array<Array<[number, string, string]>>} cpuBoard - Computer's board (player attacks)
 * @property {Array<Array<[number, string, string]>>} playerBoard - Player's board (CPU attacks)
 * @property {string} currentHoverColor - Current hover color for visual feedback
 * @property {Object.<string, ShipState>} playerShips - State of player's ships
 * @property {Object.<string, ShipState>} cpuShips - State of CPU's ships
 * @property {AIState} ai - AI-specific state
 * @property {number} playerHitCount - Player's hit count on CPU board
 */

/**
 * The centralized game state object.
 * All game state is stored here rather than in scattered global variables.
 * @type {GameState}
 * @private
 */
const state = {
    isStarted: false,
    isOver: false,
    winner: null,
    cpuBoard: null,
    playerBoard: null,
    currentHoverColor: null,
    playerShips: {
        carrier: { placed: false, sunk: false, coordinates: [] },
        battleship: { placed: false, sunk: false, coordinates: [] },
        cruiser: { placed: false, sunk: false, coordinates: [] },
        submarine: { placed: false, sunk: false, coordinates: [] },
        destroyer: { placed: false, sunk: false, coordinates: [] }
    },
    cpuShips: {
        carrier: { placed: false, sunk: false, coordinates: [] },
        battleship: { placed: false, sunk: false, coordinates: [] },
        cruiser: { placed: false, sunk: false, coordinates: [] },
        submarine: { placed: false, sunk: false, coordinates: [] },
        destroyer: { placed: false, sunk: false, coordinates: [] }
    },
    ai: {
        lastShotX: -1,
        lastShotY: -1,
        attackDirection: "",
        hitsNotSunk: 0,
        missesInARow: 0,
        shotsFired: 0
    },
    playerHitCount: 0
};

/**
 * Subscribers to state changes.
 * @type {Set<Function>}
 * @private
 */
const subscribers = new Set();

/**
 * Creates an empty game board with the specified dimensions.
 * Each cell is initialized as [CellState.EMPTY, "", ""].
 * The array format is [state, shipName, direction].
 * @returns {Array<Array<[number, string, string]>>} Empty game board
 */
export function createEmptyBoard() {
    const board = [];
    for (let i = 0; i < BOARD_COLS; i++) {
        board.push([]);
        for (let j = 0; j < BOARD_ROWS; j++) {
            board[i].push([CellState.EMPTY, "", ""]);
        }
    }
    return board;
}

/**
 * Initializes the game state with fresh boards.
 * Should be called at the start of a new game.
 */
export function initializeState() {
    state.isStarted = false;
    state.isOver = false;
    state.winner = null;
    state.cpuBoard = createEmptyBoard();
    state.playerBoard = createEmptyBoard();
    state.currentHoverColor = null;
    state.playerHitCount = 0;

    // Reset ship states
    for (const shipName of Object.keys(state.playerShips)) {
        state.playerShips[shipName] = { placed: false, sunk: false, coordinates: [] };
        state.cpuShips[shipName] = { placed: false, sunk: false, coordinates: [] };
    }

    // Reset AI state
    state.ai = {
        lastShotX: -1,
        lastShotY: -1,
        attackDirection: "",
        hitsNotSunk: 0,
        missesInARow: 0,
        shotsFired: 0
    };

    notifySubscribers();
}

/**
 * Gets the current game state.
 * Returns a reference to the state object (not a copy) for performance.
 * @returns {GameState} Current game state
 */
export function getState() {
    return state;
}

/**
 * Updates the game state with the provided changes.
 * @param {Partial<GameState>} updates - Object containing state updates
 */
export function updateState(updates) {
    Object.assign(state, updates);
    notifySubscribers();
}

/**
 * Gets the game started status.
 * @returns {boolean} Whether the game has started
 */
export function isGameStarted() {
    return state.isStarted;
}

/**
 * Sets the game started status.
 * @param {boolean} started - New started status
 */
export function setGameStarted(started) {
    state.isStarted = started;
    notifySubscribers();
}

/**
 * Gets the game over status.
 * @returns {boolean} Whether the game is over
 */
export function isGameOver() {
    return state.isOver;
}

/**
 * Sets the game over status and winner.
 * @param {boolean} over - New game over status
 * @param {string|null} [winner=null] - Winner ("player" or "cpu")
 */
export function setGameOver(over, winner = null) {
    state.isOver = over;
    state.winner = winner;
    notifySubscribers();
}

/**
 * Gets the CPU's board (where the player attacks).
 * @returns {Array<Array<[number, string, string]>>} CPU's game board
 */
export function getCpuBoard() {
    return state.cpuBoard;
}

/**
 * Gets the player's board (where the CPU attacks).
 * @returns {Array<Array<[number, string, string]>>} Player's game board
 */
export function getPlayerBoard() {
    return state.playerBoard;
}

/**
 * Gets the current hover color.
 * @returns {string|null} Current hover color
 */
export function getCurrentHoverColor() {
    return state.currentHoverColor;
}

/**
 * Sets the current hover color.
 * @param {string} color - New hover color
 */
export function setCurrentHoverColor(color) {
    state.currentHoverColor = color;
}

/**
 * Gets the AI state.
 * @returns {AIState} AI state object
 */
export function getAIState() {
    return state.ai;
}

/**
 * Updates the AI state with the provided changes.
 * @param {Partial<AIState>} updates - Object containing AI state updates
 */
export function updateAIState(updates) {
    Object.assign(state.ai, updates);
}

/**
 * Gets the player's hit count.
 * @returns {number} Number of hits on CPU board
 */
export function getPlayerHitCount() {
    return state.playerHitCount;
}

/**
 * Increments the player's hit count.
 * @returns {number} New hit count
 */
export function incrementPlayerHitCount() {
    state.playerHitCount++;
    return state.playerHitCount;
}

/**
 * Gets the state of a specific player ship.
 * @param {string} shipName - Name of the ship
 * @returns {ShipState} Ship state object
 */
export function getPlayerShipState(shipName) {
    return state.playerShips[shipName];
}

/**
 * Updates the state of a specific player ship.
 * @param {string} shipName - Name of the ship
 * @param {Partial<ShipState>} updates - State updates
 */
export function updatePlayerShipState(shipName, updates) {
    Object.assign(state.playerShips[shipName], updates);
}

/**
 * Gets the state of a specific CPU ship.
 * @param {string} shipName - Name of the ship
 * @returns {ShipState} Ship state object
 */
export function getCpuShipState(shipName) {
    return state.cpuShips[shipName];
}

/**
 * Updates the state of a specific CPU ship.
 * @param {string} shipName - Name of the ship
 * @param {Partial<ShipState>} updates - State updates
 */
export function updateCpuShipState(shipName, updates) {
    Object.assign(state.cpuShips[shipName], updates);
}

/**
 * Checks if all player ships have been placed.
 * @returns {boolean} True if all ships are placed
 */
export function areAllPlayerShipsPlaced() {
    return Object.values(state.playerShips).every(ship => ship.placed);
}

/**
 * Checks if all player ships have been sunk.
 * @returns {boolean} True if all ships are sunk
 */
export function areAllPlayerShipsSunk() {
    return Object.values(state.playerShips).every(ship => ship.sunk);
}

/**
 * Checks if all CPU ships have been sunk.
 * @returns {boolean} True if all ships are sunk
 */
export function areAllCpuShipsSunk() {
    return Object.values(state.cpuShips).every(ship => ship.sunk);
}

/**
 * Subscribes to state changes.
 * @param {Function} callback - Function to call when state changes
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

/**
 * Notifies all subscribers of a state change.
 * @private
 */
function notifySubscribers() {
    subscribers.forEach(callback => callback(state));
}

/**
 * Gets the lengths of ships that haven't been sunk yet.
 * Used by the AI for probability calculations.
 * @returns {number[]} Array of remaining ship lengths
 */
export function getRemainingPlayerShipLengths() {
    const lengths = [];
    const shipLengths = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };

    for (const [name, shipState] of Object.entries(state.playerShips)) {
        if (!shipState.sunk) {
            lengths.push(shipLengths[name]);
        }
    }
    return lengths;
}
