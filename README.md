# Battleship-JS

Battleship-JS is a browser-based implementation of the classic Battleship game. This project features a computer opponent with an intelligent firing algorithm that first uses a checkerboard-based pseudorandom approach and then calculates probabilities to efficiently hunt down and sink the player’s ships. With polished visuals, sound effects, and a dark mode option, Battleship-JS delivers an engaging and modern twist on the classic game.

---

## Table of Contents

1. [Installation](#installation)
2. [Usage Guide](#usage-guide)
3. [Project Structure](#project-structure)
4. [Configuration Details](#configuration-details)
5. [Contribution Guidelines](#contribution-guidelines)
6. [License Information](#license-information)

---

## Installation

Battleship-JS is a client-side web application built with HTML, CSS, and JavaScript. To install and run the game locally, follow these steps:

1. **Download or Clone the Repository:**
   - To clone the repository, run:
     git clone https://github.com/ShaneMarusczak/Battleship-JS.git

2. **Directory Setup:**
   - Ensure the project folder structure remains intact. The main files and folders include:
     - `index.html` – the main HTML file.
     - `/css/` – contains both minified (`style.min.css`) and unminified (`style.css`) style sheets.
     - `/js/` – contains the JavaScript files for game logic:
       - `battleship.js` and `battleship.min.js` – player-side game logic.
       - `battleship_cpu.js` and `battleship_cpu.min.js` – computer opponent logic.
       - `shared.js` and `shared.min.js` – shared utility functions, settings, and dark mode functionality.
     - `/images/` – assets such as icons and background images.
     - `/sounds/` – contains audio files (e.g., hit, miss, and ship sunk sounds).

3. **Run the Application:**
   - Open the `index.html` file in your favorite web browser. No server setup or external dependencies are required.
   - For best results, use a modern browser with JavaScript enabled.

---

## Usage Guide

When you open the game in your browser, you will see the main game board and a set of controls:

1. **Game Setup:**
   - At startup, the screen shows two boards:
     - The player’s board (for placing and firing on ships).
     - The computer’s board (for the AI opponent).
   - The ship placement phase allows you to click on each ship (shown on the side) and drag or click on the board to place them. You can rotate ships by clicking on the "Rotate" control (the arrow icon).

2. **Starting the Game:**
   - Once ships are placed (and can still be moved before starting), click on the "Start Game" button.
   - The computer will begin its firing sequence, and a modal will display messages such as “Thinking…”, “Fire!”, or random phrases like “Aww Man!” after sinking a ship.

3. **Gameplay:**
   - On your board, click any valid square to fire a torpedo at the computer’s ships.
   - The game board uses visual feedback:
     - **Miss:** Marked with a distinct color (blue tones with a cross).
     - **Hit:** The target square flashes red.
     - **Sunk:** When all segments of a ship are hit, the ship’s cells change to dark red and the corresponding ship name is shown as sunk.
   - The game continues until all ships on one board are sunk. A win/loss message will display indicating the result, and win/loss counters are updated and stored via cookies.

4. **Additional Features:**
   - **Dark Mode:** Toggle dark mode with the “Dark Mode” button to adjust the UI colors.
   - **Reset Win/Loss:** Click on the “Reset Win/Loss” button to clear your game statistics.
   - **Navigation Links:** Use home and GitHub icons at the top for navigation or to check out the repository.

---

## Project Structure

Below is an overview of the important files and directories:

- **index.html:**
  - Entrypoint of the application containing the game boards, headers, footers, and linking to external CSS/JS assets.
  
- **css/**
  - `style.css` & `style.min.css`: Main styling files defining game board layout, animations (e.g., bounce effects, modal animations), dark/light mode classes, and responsive design rules.

- **js/**
  - `battleship.js` & `battleship.min.js`:
    - Contains logic for handling user actions, updating the game board upon firing torpedoes, handling hit/miss responses, win detection, and playing audio cues.
  - `battleship_cpu.js` & `battleship_cpu.min.js`:
    - Implements the computer player’s functionality for ship placement and a two-phase firing algorithm. Early in the game, the AI fires on a checkerboard pattern then switches to a probability-based approach.
  - `shared.js` & `shared.min.js`:
    - Utility functions shared across the game including cookie management (for maintaining win/loss records), dark mode toggling, UI animations (e.g., icon bounces), and other helper functions.
  
- **images/**
  - Contains door icons (home, GitHub, etc.) and other visual assets used by the game.

- **sounds/**
  - Audio files for ship hit, miss, and sunk events to enhance gameplay.

- **site.webmanifest, apple-touch-icon.png, favicon-*.png:**
  - Configuration files and assets for progressive web app enhancements and browser icon support.

---

## Configuration Details

While Battleship-JS is a client-side application not requiring a build process, take note of the following settings and configurations:

- **Viewport Setup in index.html:**
  - The meta tag `viewport` is configured with a fixed width (e.g., `<meta name="viewport" content="width=800" />`) to standardize layout.
  
- **Cookie Management (shared.js):**
  - Win/loss records and dark mode settings are stored in cookies. The functions `setCookie` and `getCookie` (assumed to be defined globally) help persist these settings.

- **Dark Mode:**
  - CSS classes such as `.darkBackground`, `.darkGrayBackground`, and `.lightText` are applied or removed by JavaScript functions (`setDarkMode`/`removeDarkMode`) based on user interactions.
  
- **Responsive Behavior:**
  - Media queries in the CSS ensure that the game boards reposition on screens with a width below 1500 pixels.

---

## Contribution Guidelines

Contributions to Battleship-JS are welcome. If you are interested in helping improve the game, please follow these guidelines:

- Fork the repository and create your feature branch:
  git checkout -b feature/YourFeatureName

- Commit your changes with clear commit messages.

- Open a pull request with detailed notes on your changes.

For more details, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file if available.

---

## License Information

Battleship-JS is released into the public domain. See the [LICENSE.md](LICENSE.md) file for complete details. In summary, anyone is free to use, modify, publish, or distribute the software for any purpose without warranty.

For more information, visit:  
https://unlicense.org

---

Enjoy playing Battleship, and may your tactical skills lead you to victory!
