/**
 * @fileoverview Animation utilities for Battleship.
 * Handles icon bounce animations and other visual effects.
 * @module ui/animations
 */

"use strict";

import { CssClasses } from "../config/constants.js";
import { sleep } from "../utils/helpers.js";
import { getById, addClassById, removeClassById } from "../utils/dom.js";

/**
 * Applies the upward bounce animation to an element.
 * @param {string} elementId - ID of the element to animate
 */
export function bounceUp(elementId) {
    addClassById(elementId, CssClasses.UP_BOUNCE);
    removeClassById(elementId, CssClasses.DOWN_BOUNCE);
}

/**
 * Applies the downward bounce animation to an element.
 * Automatically removes the class after animation completes.
 * @param {string} elementId - ID of the element to animate
 */
export async function bounceDown(elementId) {
    addClassById(elementId, CssClasses.DOWN_BOUNCE);
    removeClassById(elementId, CssClasses.UP_BOUNCE);

    // Remove bounce class after animation completes
    await sleep(1000);
    removeClassById(elementId, CssClasses.DOWN_BOUNCE);
}

/**
 * Sets up hover bounce animation for an element.
 * Element bounces up on hover and down when mouse leaves.
 * @param {string} elementId - ID of the element to set up
 */
export function setupHoverBounce(elementId) {
    const element = getById(elementId);
    if (!element) return;

    element.addEventListener("mouseover", () => bounceUp(elementId));
    element.addEventListener("mouseleave", () => bounceDown(elementId));
}

/**
 * Applies the rotate animation to the rotate arrow.
 */
export function rotateIcon() {
    addClassById("rotateArrow", CssClasses.ROTATE_ANIMATION);
    removeClassById("rotateArrow", CssClasses.ROTATE_BACK_ANIMATION);
}

/**
 * Applies the reverse rotate animation to the rotate arrow.
 */
export function rotateIconBack() {
    removeClassById("rotateArrow", CssClasses.ROTATE_ANIMATION);
    addClassById("rotateArrow", CssClasses.ROTATE_BACK_ANIMATION);
}

/**
 * Sets up the rotate button hover animations.
 */
export function setupRotateAnimation() {
    const rotateBtn = getById("rotate");
    if (!rotateBtn) return;

    rotateBtn.addEventListener("mouseover", rotateIcon);
    rotateBtn.addEventListener("mouseleave", rotateIconBack);
}

/**
 * Initializes all UI animations.
 * Sets up hover effects for icons and buttons.
 */
export function initializeAnimations() {
    // Setup bounce animations for icons
    setupHoverBounce("homeIcon");
    setupHoverBounce("githubicon");

    // Setup rotate button animation
    setupRotateAnimation();
}
