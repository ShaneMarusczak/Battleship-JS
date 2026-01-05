/**
 * @fileoverview Audio management for Battleship.
 * Handles loading and playing game sound effects.
 * @module utils/audio
 */

"use strict";

import { SoundPaths } from "../config/constants.js";

/**
 * Audio instance for hit sound effect.
 * @type {HTMLAudioElement}
 * @private
 */
let hitSound = null;

/**
 * Audio instance for miss sound effect.
 * @type {HTMLAudioElement}
 * @private
 */
let missSound = null;

/**
 * Audio instance for ship sunk sound effect.
 * @type {HTMLAudioElement}
 * @private
 */
let sunkSound = null;

/**
 * Initializes all audio elements.
 * Should be called once when the game loads.
 */
export function initializeAudio() {
    hitSound = new Audio(SoundPaths.HIT);
    missSound = new Audio(SoundPaths.MISS);
    sunkSound = new Audio(SoundPaths.SUNK);
}

/**
 * Plays the hit sound effect.
 * Used when a torpedo hits a ship.
 */
export function playHitSound() {
    if (hitSound) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {
            // Ignore autoplay restrictions
        });
    }
}

/**
 * Plays the miss sound effect.
 * Used when a torpedo misses all ships.
 */
export function playMissSound() {
    if (missSound) {
        missSound.currentTime = 0;
        missSound.play().catch(() => {
            // Ignore autoplay restrictions
        });
    }
}

/**
 * Plays the ship sunk sound effect.
 * Used when a ship is completely destroyed.
 */
export function playSunkSound() {
    if (sunkSound) {
        sunkSound.currentTime = 0;
        sunkSound.play().catch(() => {
            // Ignore autoplay restrictions
        });
    }
}

/**
 * Preloads all audio files to reduce latency during gameplay.
 * @returns {Promise<void>} Promise that resolves when all audio is loaded
 */
export async function preloadAudio() {
    initializeAudio();

    const loadPromises = [hitSound, missSound, sunkSound].map(audio => {
        return new Promise((resolve) => {
            if (audio.readyState >= 2) {
                resolve();
            } else {
                audio.addEventListener("canplaythrough", resolve, { once: true });
                audio.addEventListener("error", resolve, { once: true });
            }
            audio.load();
        });
    });

    await Promise.all(loadPromises);
}
