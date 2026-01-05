/**
 * @fileoverview Game constants and configuration for Battleship.
 * Contains all static values used throughout the game including board dimensions,
 * ship definitions, cell states, and UI phrases.
 * @module config/constants
 */

"use strict";

/** @constant {number} Number of rows on the game board */
export const BOARD_ROWS = 10;

/** @constant {number} Number of columns on the game board */
export const BOARD_COLS = 10;

/** @constant {number} Size of each cell in pixels */
export const CELL_SIZE = 50;

/** @constant {number} Total hits needed to win (sum of all ship lengths: 5+4+3+3+2) */
export const WINNING_HIT_COUNT = 17;

/**
 * Cell state values used to track the status of each board position.
 * @enum {number}
 */
export const CellState = {
    /** Cell has not been fired at and contains no ship */
    EMPTY: 0,
    /** Cell contains a ship but has not been fired at */
    SHIP: 1,
    /** Cell contained a ship and has been hit */
    HIT: 2,
    /** Cell was fired at but contained no ship */
    MISS: 3,
    /** Cell is part of a sunk ship */
    SUNK: 4
};

/**
 * @typedef {Object} ShipDefinition
 * @property {string} name - Internal name of the ship (lowercase)
 * @property {string} displayName - Display name of the ship (capitalized)
 * @property {number} length - Number of cells the ship occupies
 */

/**
 * Ship definitions with their names and lengths.
 * Ships are ordered by length (largest to smallest) for placement priority.
 * @constant {ShipDefinition[]}
 */
export const SHIPS = [
    { name: "carrier", displayName: "Carrier", length: 5 },
    { name: "battleship", displayName: "Battleship", length: 4 },
    { name: "cruiser", displayName: "Cruiser", length: 3 },
    { name: "submarine", displayName: "Submarine", length: 3 },
    { name: "destroyer", displayName: "Destroyer", length: 2 }
];

/**
 * Map of ship names to their lengths for quick lookup.
 * @constant {Object.<string, number>}
 */
export const SHIP_LENGTHS = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2
};

/**
 * Directions for ship placement and AI movement.
 * @enum {string}
 */
export const Direction = {
    UP: "u",
    DOWN: "d",
    LEFT: "l",
    RIGHT: "r",
    HORIZONTAL: "hor",
    VERTICAL: "ver"
};

/**
 * Phrases displayed when the computer is "thinking" about its next move.
 * Adds personality to the AI opponent.
 * @constant {string[]}
 */
export const SEARCHING_PHRASES = [
    "Thinking...",
    "Hmm...",
    "Finding...",
    "Tracking...",
    "Spotting...",
    "Hunting...",
    "Looking...",
    "Scanning...",
    "Seeking..."
];

/**
 * Phrases displayed when the computer fires a torpedo.
 * @constant {string[]}
 */
export const FIRING_PHRASES = [
    "Fire!",
    "Launch!",
    "Blast!",
    "BOOM!",
    "BANG!",
    "There!",
    "Attack!"
];

/**
 * Phrases displayed when the player sinks one of the computer's ships.
 * Shows the computer's "frustration".
 * @constant {string[]}
 */
export const COMPUTER_SUNK_PHRASES = [
    "Aww Man!",
    "SOS!",
    "I'm Going Down!",
    "Capsized!",
    "I'm Sinking!",
    "Cheater!",
    "Shipwreck!",
    "No Fair!",
    "Hull Breach!",
    "I won't lose!",
    "Abandon Ship!",
    "Overboard!",
    "Stop it!",
    "No Way!",
    "Hey! Stop!",
    "You wont win!",
    "Lucky Shot!",
    ":("
];

/**
 * Phrases displayed when the computer sinks one of the player's ships.
 * Shows the computer's "excitement".
 * @constant {string[]}
 */
export const PLAYER_SUNK_PHRASES = [
    "Found You!",
    "You're Sunk!",
    "Down she goes!",
    "Gotcha!",
    "Ha Ha!",
    "I'm the best!",
    "Woo Hoo!",
    "I'm Better!",
    "I'm gonna win!",
    "Easy!",
    "Sink that ship!",
    "Try Harder!",
    "Yawn...",
    "Sunk!",
    "Oh Yeah!",
    "You're Gonna Lose!",
    "Really? Easy..",
    "Yes!!",
    "So Easy!",
    "Child's Play!",
    ":)"
];

/**
 * Cookie expiration time in days.
 * @constant {number}
 */
export const COOKIE_EXPIRATION_DAYS = 0.25;

/**
 * Cookie names used for persistent storage.
 * @enum {string}
 */
export const CookieNames = {
    PLAYER_WINS: "playerwinsBattleship",
    COMPUTER_WINS: "compwinsBattleship",
    DARK_MODE: "darkMode"
};

/**
 * CSS class names used throughout the application.
 * Centralizing these helps prevent typos and makes refactoring easier.
 * @enum {string}
 */
export const CssClasses = {
    HIDDEN: "hidden",
    NOT_DISPLAYED: "notDisplayed",
    CLICKED: "clicked",
    CURSOR_POINTER: "curserPointer",
    BLACK_BACKGROUND: "blackBackground",
    GREY_BACKGROUND: "greyBackground",
    RED_BACKGROUND: "redBackground",
    DARK_RED_BACKGROUND: "darkRedBackground",
    MISS_BACKGROUND: "missBackground",
    MISS: "miss",
    HIT: "hit",
    SUNK_TEXT: "sunkText",
    HIT_TEXT: "hitText",
    LIGHT_TEXT: "lightText",
    DARK_BACKGROUND: "darkBackground",
    DARK_BACKGROUND_HTML: "darkBackgroundHTML",
    DARK_GRAY_BACKGROUND: "darkGrayBackground",
    LIGHT_BACKGROUND: "lightBackground",
    UP_BOUNCE: "upBounce",
    DOWN_BOUNCE: "downBounce",
    ROTATE_ANIMATION: "rotateAnimation",
    ROTATE_BACK_ANIMATION: "rotateBackAnimation",
    SHADOW_BOX: "shadowBox"
};

/**
 * Sound file paths.
 * @enum {string}
 */
export const SoundPaths = {
    HIT: "sounds/Hit Ship Sound.mp3",
    MISS: "sounds/Miss Fire Sound.mp3",
    SUNK: "sounds/Ship Sunk Sound.mp3"
};

/**
 * Default hover color for board cells.
 * @constant {string}
 */
export const DEFAULT_CELL_COLOR = "rgb(128, 170, 255)";

/**
 * Highlighted hover color for board cells.
 * @constant {string}
 */
export const HOVER_CELL_COLOR = "#87CEFA";

/**
 * Hex color for water cells.
 * @constant {string}
 */
export const WATER_COLOR = "#80aaff";
