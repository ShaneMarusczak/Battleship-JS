/**
 * @fileoverview Main entry point for the Battleship game.
 *
 * This module initializes all game components and coordinates the
 * startup sequence. It:
 *
 * 1. Initializes the game state
 * 2. Sets up the audio system
 * 3. Initializes both game boards
 * 4. Sets up ship placement
 * 5. Initializes UI components (dark mode, animations)
 * 6. Loads persisted data (win/loss records, preferences)
 *
 * The game follows this flow:
 * 1. Player places ships on their board
 * 2. Player clicks "Start Game"
 * 3. Player fires at CPU board
 * 4. CPU fires at player board
 * 5. Repeat until all ships of one side are sunk
 *
 * @module main
 */

"use strict";

// State management
import { initializeState, createEmptyBoard, getState } from "./state/gameState.js";

// Configuration
import { CookieNames } from "./config/constants.js";

// Utilities
import { getPlayerWins, getComputerWins, resetWinLoss, getDarkModePreference } from "./utils/cookies.js";
import { getById, setTextById, addEventById } from "./utils/dom.js";
import { preloadAudio } from "./utils/audio.js";

// UI Components
import { initializeDarkModeToggle, applySavedDarkModePreference } from "./ui/darkMode.js";
import { initializeAnimations } from "./ui/animations.js";

// Game Components
import { initializeCpuBoard } from "./game/cpuBoard.js";
import { initializePlayerBoard, executeComputerTurn } from "./game/playerBoard.js";
import { initializeShipPlacement } from "./game/shipPlacement.js";

/**
 * Initializes the Battleship game.
 * Called when the DOM is fully loaded.
 */
async function initializeGame() {
    console.log("Initializing Battleship...");

    try {
        // Initialize game state with empty boards
        initializeState();

        // Preload audio files
        await preloadAudio();

        // Initialize the player's board (where CPU attacks)
        initializePlayerBoard();

        // Initialize ship placement UI
        initializeShipPlacement();

        // Initialize the CPU's board (where player attacks)
        // Pass the computer turn callback
        initializeCpuBoard(executeComputerTurn);

        // Initialize UI components
        initializeDarkModeToggle();
        initializeAnimations();

        // Load and display win/loss records
        displayWinLossRecords();

        // Setup reset button
        setupResetButton();

        console.log("Battleship initialized successfully!");

    } catch (error) {
        console.error("Failed to initialize Battleship:", error);
    }
}

/**
 * Displays the win/loss records from cookies.
 */
function displayWinLossRecords() {
    const playerWins = getPlayerWins();
    const computerWins = getComputerWins();

    setTextById("playerWins", `Player Wins: ${playerWins}`);
    setTextById("compWins", `Computer Wins: ${computerWins}`);
}

/**
 * Sets up the reset win/loss button.
 */
function setupResetButton() {
    addEventById("resetWinLoss", "click", () => {
        resetWinLoss();
        displayWinLossRecords();
    });
}

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeGame);
} else {
    // DOM is already ready
    initializeGame();
}

// Export for potential external use or testing
export { initializeGame };
