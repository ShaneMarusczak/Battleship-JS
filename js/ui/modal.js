/**
 * @fileoverview Modal dialog system for Battleship.
 * Provides a simple modal dialog for displaying messages to the player.
 * Replaces the external buildingBlocks modal dependency.
 * @module ui/modal
 */

"use strict";

import { sleep } from "../utils/helpers.js";

/**
 * Reference to the modal overlay element.
 * @type {HTMLDivElement|null}
 * @private
 */
let modalOverlay = null;

/**
 * Reference to the modal content element.
 * @type {HTMLDivElement|null}
 * @private
 */
let modalContent = null;

/**
 * Timeout ID for auto-closing modal.
 * @type {number|null}
 * @private
 */
let autoCloseTimeout = null;

/**
 * Creates the modal DOM elements if they don't exist.
 * @private
 */
function ensureModalExists() {
    if (modalOverlay) return;

    // Create overlay
    modalOverlay = document.createElement("div");
    modalOverlay.id = "modal-overlay";
    modalOverlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        justify-content: center;
        align-items: center;
    `;

    // Create content box
    modalContent = document.createElement("div");
    modalContent.id = "modal-message";
    modalContent.style.cssText = `
        background-color: linen;
        border: 3px solid black;
        border-radius: 15px;
        padding: 20px 40px;
        font-size: 2em;
        font-family: "Roboto Mono", monospace;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: modalPop 0.3s ease-out;
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add animation keyframes
    const style = document.createElement("style");
    style.textContent = `
        @keyframes modalPop {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        @keyframes modalFade {
            0% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Close on overlay click
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });
}

/**
 * Shows a modal dialog with the specified message.
 * @param {string} message - The message to display
 * @param {number} [duration=0] - Auto-close duration in ms (0 = manual close)
 * @returns {Promise<void>} Promise that resolves when modal closes
 * @example
 * // Show message that auto-closes after 2 seconds
 * await showModal("You Win!", 2000);
 *
 * // Show message that requires manual close
 * showModal("Game Over");
 */
export function showModal(message, duration = 0) {
    ensureModalExists();

    // Clear any existing auto-close timeout
    if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = null;
    }

    modalContent.textContent = message;
    modalOverlay.style.display = "flex";

    if (duration > 0) {
        return new Promise((resolve) => {
            autoCloseTimeout = setTimeout(() => {
                hideModal();
                resolve();
            }, duration);
        });
    }

    return Promise.resolve();
}

/**
 * Hides the modal dialog.
 */
export function hideModal() {
    if (modalOverlay) {
        modalOverlay.style.display = "none";
    }

    if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = null;
    }
}

/**
 * Shows a modal with a fade-out animation.
 * @param {string} message - The message to display
 * @param {number} duration - Display duration in ms
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
export async function showModalWithFade(message, duration) {
    ensureModalExists();

    modalContent.textContent = message;
    modalOverlay.style.display = "flex";

    // Wait for display duration minus fade time
    const fadeTime = 300;
    await sleep(duration - fadeTime);

    // Apply fade animation
    modalContent.style.animation = `modalFade ${fadeTime}ms ease-out forwards`;

    await sleep(fadeTime);

    // Reset and hide
    modalContent.style.animation = "modalPop 0.3s ease-out";
    modalOverlay.style.display = "none";
}

/**
 * Checks if the modal is currently visible.
 * @returns {boolean} True if modal is visible
 */
export function isModalVisible() {
    return modalOverlay && modalOverlay.style.display === "flex";
}
