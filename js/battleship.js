"use strict";
(() => {
  let hitCount = 0;
  const rows = 10;
  const cols = 10;
  const squareSize = 50;
  const winningHitCount = 17;
  const gameBoard = [];
  const gameBoardContainer = document.getElementById("gameboard");
  const hitSound = new Audio("sounds/Hit Ship Sound.mp3");
  const missSound = new Audio("sounds/Miss Fire Sound.mp3");
  const sunkSound = new Audio("sounds/Ship Sunk Sound.mp3");
  const ships = [];
  const searchngPhrases = [
    "Thinking...",
    "Hmm...",
    "Finding...",
    "Tracking...",
    "Spotting...",
    "Hunting...",
    "Looking...",
    "Scanning...",
    "Seeking...",
  ];
  const firingPhrases = [
    "Fire!",
    "Launch!",
    "Blast!",
    "BOOM!",
    "BANG!",
    "There!",
    "Attack!",
  ];
  const compSunkPhrases = [
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
    ":(",
  ];

  const hoverColor = function (e) {
    window.currentColor = e.target.style.backgroundColor;
    if (e.target.style.backgroundColor === "rgb(128, 170, 255)") {
      e.target.style.backgroundColor = "#87CEFA";
    }
  };

  const resetHoverColor = function (e) {
    e.target.style.backgroundColor = window.currentColor;
  };

  const innerModalControl = () => {
    document.getElementById("thinking").style.display = "flex";
    window.uiBlocker(2000);
    window.sleep(1400).then(() => {
      document.getElementById("message").innerText =
        firingPhrases[
          window.randomIntFromInterval(0, firingPhrases.length - 1)
        ];
    });
    window.sleep(2000).then(() => {
      document.getElementById("thinking").style.display = "none";
      window.sleep(300).then(() => {
        addClickEvent();
        window.compMoveWindow();
      });
    });
    document.getElementById("message").innerText =
      searchngPhrases[
        window.randomIntFromInterval(0, searchngPhrases.length - 1)
      ];
  };

  const modalControl = (shipSunkThisShot) => {
    if (shipSunkThisShot) {
      const delay = 1500;
      window.modal(
        compSunkPhrases[
          window.randomIntFromInterval(0, compSunkPhrases.length - 1)
        ],
        delay
      );
      window.sleep(delay).then(() => innerModalControl());
    } else {
      innerModalControl();
    }
  };

  function fireTorpedo(e) {
    let shipSunkThisShot = false;
    if (!window.gameStarted || window.gameOver) {
      return;
    }

    if (e.target === e.currentTarget) {
      removeClickEvent();
      const row = e.target.id.substring(1, 2);
      const col = e.target.id.substring(2, 3);
      if (gameBoard[row][col][0] == 0) {
        document.getElementById("s" + row + col).style.backgroundColor =
          "#4d88ff";
        gameBoard[row][col][0] = 3;
        document.getElementById("s" + row + col).classList.add("miss");
        window.currentColor = "#4d88ff";
        missSound.play();
      } else if (gameBoard[row][col][0] == 1) {
        document.getElementById("s" + row + col).style.backgroundColor = "red";
        gameBoard[row][col][0] = 2;
        document.getElementById("s" + row + col).classList.add("hit");
        window.currentColor = "red";
        hitSound.play();
        hitCount++;
        let shipSunkCounter = 0;
        for (const ship of ships) {
          for (const coor of ship) {
            if (coor[0] == row && coor[1] == col) {
              for (const coor of ship) {
                if (gameBoard[coor[0]][coor[1]][0] == 2) {
                  shipSunkCounter++;
                }
                if (shipSunkCounter == ship.length) {
                  window.currentColor = "darkred";
                  for (const coor of ship) {
                    document.getElementById(
                      "s" + coor[0] + coor[1]
                    ).style.backgroundColor = "darkred";
                  }
                  document
                    .getElementById(gameBoard[coor[0]][coor[1]][1] + "Sunk")
                    .classList.add("sunkText");
                  shipSunkThisShot = true;
                  sunkSound.play();
                }
              }
            }
          }
        }

        if (hitCount == winningHitCount) {
          document.getElementById("wintext").style.display = "block";
          window.gameOver = true;
          window.modal("YOU WIN!!!", 3000);
          const valuetoPass = window.playerWinsOnLoad() + 1;
          window.setCookie("playerwinsBattleship", valuetoPass, 0.25);
          document.getElementById("playerWins").textContent =
            "Player Wins: " + valuetoPass;
          return;
        }
      } else if (gameBoard[row][col][0] > 1) {
        window.modal("Can't Fire Here!", 1400);
        addClickEvent();
        return;
      }
    }
    window.sleep(200).then(() => modalControl(shipSunkThisShot));
    e.stopPropagation();
  }

  function addClickEvent() {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        document
          .getElementById("s" + i + j)
          .addEventListener("click", fireTorpedo);
      }
    }
  }

  function removeClickEvent() {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        document
          .getElementById("s" + i + j)
          .removeEventListener("click", fireTorpedo);
      }
    }
  }

  let nameIndex = 0;
  const names = ["Carrier", "Battleship", "Cruiser", "Submarine", "Destroyer"];

  const usedCols = [1, 2, 4, 6, 8];
  const usedRows = [2, 4, 6, 7, 9];

  function placeShip(len) {
    const ship = [];
    const name = names[nameIndex];
    const dir = window.randomIntFromInterval(1, 2);
    let row;
    let col;
    do {
      row = window.randomIntFromInterval(0, 9);
    } while (usedRows.includes(row));
    do {
      col = window.randomIntFromInterval(0, 9);
    } while (usedCols.includes(col));
    let shipPlaceCounter = 0;
    if (dir == 1) {
      if (col >= len - 1) {
        for (let i = 0; i < len; i++) {
          if (gameBoard[row][col - i][0] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (let i = 0; i < len; i++) {
            gameBoard[row][col - i][0] = 1;
            gameBoard[row][col - i][1] = name;
            ship.push([row, col - i]);
          }
          usedRows.push(row);
          usedCols.push(col);
        } else {
          placeShip(len);
        }
      } else {
        for (let i = 0; i < len; i++) {
          if (gameBoard[row][col + i][0] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (let i = 0; i < len; i++) {
            gameBoard[row][col + i][0] = 1;
            gameBoard[row][col + i][1] = name;
            ship.push([row, col + i]);
          }
          usedRows.push(row);
          usedCols.push(col);
        } else {
          placeShip(len);
        }
      }
    } else {
      if (row >= len - 1) {
        for (let i = 0; i < len; i++) {
          if (gameBoard[row - i][col][0] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (let i = 0; i < len; i++) {
            gameBoard[row - i][col][0] = 1;
            gameBoard[row - i][col][1] = name;
            ship.push([row - i, col]);
          }
          usedRows.push(row);
          usedCols.push(col);
        } else {
          placeShip(len);
        }
      } else {
        for (let i = 0; i < len; i++) {
          if (gameBoard[row + i][col][0] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (let i = 0; i < len; i++) {
            gameBoard[row + i][col][0] = 1;
            gameBoard[row + i][col][1] = name;
            ship.push([row + i, col]);
          }
          usedRows.push(row);
          usedCols.push(col);
        } else {
          placeShip(len);
        }
      }
    }
    if (ship.length != 0) {
      ships.push(ship);
      nameIndex++;
    }
  }

  (() => {
    document.getElementById("playerWins").textContent =
      "Player Wins: " + window.playerWinsOnLoad();

    for (let i = 0; i < cols; i++) {
      gameBoard.push([]);
      for (let j = 0; j < rows; j++) {
        gameBoard[i].push([0, ""]);
        const square = document.createElement("div");
        gameBoardContainer.appendChild(square);
        square.id = "s" + j + i;
        const topPosition = j * squareSize + 5;
        const leftPosition = i * squareSize + 5;
        square.style.top = topPosition + "px";
        square.style.left = leftPosition + "px";
        square.style.background = "rgb(128, 170, 255)";
        square.addEventListener("mouseover", hoverColor);
        square.addEventListener("mouseleave", resetHoverColor);
        square.addEventListener("click", fireTorpedo);
      }
    }

    placeShip(5);
    placeShip(4);
    placeShip(3);
    placeShip(3);
    placeShip(2);
    window.exportedGameBoard = gameBoard;

    document.addEventListener("keydown", function (event) {
      if (event.keyCode == 192) {
        console.log(gameBoard);
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            if (gameBoard[i][j][0] == 1) {
              document.getElementById("s" + i + j).style.background = "white";
            }
          }
        }
      }
    });
  })();
})();
