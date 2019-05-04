(function() {
  const rows = 10;
  const cols = 10;
  const squareSize = 50;
  const totalShots = 100;

  var values = [1, -1];

  var lastShotHit = false;

  var tester = 0;

  var shipsPlaced = 0;

  var size;

  var direction;

  var gameBoard = [];

  var allShipsPlaced = false;

  var placedCarrier = false;
  var placedBattleship = false;
  var placedCruiser = false;
  var placedSubmarine = false;
  var placedDetroyer = false;

  var gameBoardContainer = document.getElementById("gameboard");
  var carrier = document.getElementById("carrier");
  var battleship = document.getElementById("battleship");
  var cruiser = document.getElementById("cruiser");
  var submarine = document.getElementById("submarine");
  var destroyer = document.getElementById("destroyer");

  var placed;

  var placedShips = [];

  var hits = 0;
  var shotsFired = 0;

  var lastShotX;
  var lastShotY;

  var ships = [carrier, battleship, cruiser, submarine, destroyer];

  function randomIntFromInterval(min, max) {
    //inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  var rotateShip = function() {
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
        if (direction == "hor") {
          document
            .getElementById("s" + i + j)
            .removeEventListener("mouseover", highlight);
          document
            .getElementById("s" + i + j)
            .addEventListener("mouseover", rotatedHighlight);
        } else {
          document
            .getElementById("s" + i + j)
            .removeEventListener("mouseover", rotatedHighlight);
          document
            .getElementById("s" + i + j)
            .addEventListener("mouseover", highlight);
        }
      }
    }
    if (direction == "hor") {
      direction = "ver";
    } else {
      direction = "hor";
    }
  };

  var rotatedHighlight = function() {
    if (Number(this.id[1]) < 11 - size) {
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .addEventListener("click", placeShip);
        }
      }
      for (i = 0; i < size; i++) {
        document.getElementById(
          this.id[0] + (Number(this.id[1]) + i) + this.id[2]
        ).style.background = "black";
      }
    } else {
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .removeEventListener("click", placeShip);
        }
      }
    }
  };

  var highlight = function() {
    if (Number(this.id[2]) < 11 - size) {
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .addEventListener("click", placeShip);
        }
      }
      for (i = 0; i < size; i++) {
        document.getElementById(
          this.id[0] + this.id[1] + (Number(this.id[2]) + i)
        ).style.background = "black";
      }
    } else {
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .removeEventListener("click", placeShip);
        }
      }
    }
  };

  var resetColor = function() {
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
        if (document.getElementById("s" + i + j).className == "") {
          document.getElementById("s" + i + j).style.background = "#80aaff";
        }
      }
    }
  };

  var placeShip = function() {
    var ship = [];
    var canPlace = true;
    var x = Number(this.id[1]);
    var y = Number(this.id[2]);

    for (val of placedShips) {
      for (coor of val) {
        if (direction == "hor") {
          for (i = 0; i < size; i++) {
            if (x == coor[0] && y + i == coor[1]) {
              canPlace = false;
            }
          }
        } else {
          for (i = 0; i < size; i++) {
            if (x + i == coor[0] && y == coor[1]) {
              canPlace = false;
            }
          }
        }
      }
    }
    if (!canPlace) {
      alert("cant place here");
    }

    if (canPlace) {
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          if (
            document.getElementById("s" + i + j).style.background == "black"
          ) {
            document.getElementById("s" + i + j).classList.add("ship");
            document
              .getElementById("s" + i + j)
              .removeEventListener("mouseover", highlight);
            gameBoard[i][j][0] = 1;
            ship.push([i, j]);
          }
        }
      }

      if (size == 5) {
        placedCarrier = true;
        shipsPlaced++;
      } else if (size == 4) {
        placedBattleship = true;
        shipsPlaced++;
      } else if (size == 3) {
        if (placed == "cruiser") {
          placedCruiser = true;
          shipsPlaced++;
        } else if (placed == "submarine") {
          placedSubmarine = true;
          shipsPlaced++;
        }
      } else if (size == 2) {
        placedDetroyer = true;
        shipsPlaced++;
      }
      if (shipsPlaced == 5) {
        alert("all ships placed");
        allShipsPlaced = true;
      }
      size = 0;
      placedShips.push(ship);
    }
  };

  var placeShipSetup = function() {
    if (this.id == "carrier" && !placedCarrier) {
      size = 5;
    } else if (this.id == "battleship" && !placedBattleship) {
      size = 4;
    } else if (this.id == "cruiser" && !placedCruiser) {
      size = 3;
      placed = "cruiser";
    } else if (this.id == "submarine" && !placedSubmarine) {
      size = 3;
      placed = "submarine";
    } else if (this.id == "destroyer" && !placedDetroyer) {
      size = 2;
    }
  };

  for (i = 0; i < cols; i++) {
    gameBoard.push([]);
    for (j = 0; j < rows; j++) {
      gameBoard[i].push([0, 1]);
      var square = document.createElement("div");
      gameBoardContainer.appendChild(square);
      square.id = "s" + j + i;
      var topPosition = j * squareSize;
      var leftPosition = i * squareSize;
      square.style.top = topPosition + "px";
      square.style.left = leftPosition + "px";
    }
  }

  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      document.getElementById("s" + i + j).style.background = "#80aaff";
      document
        .getElementById("s" + i + j)
        .addEventListener("mouseover", highlight);
      document
        .getElementById("s" + i + j)
        .addEventListener("mouseleave", resetColor);
      var direction = "hor";
    }
  }

  for (ship of ships) {
    ship.addEventListener("click", placeShipSetup);
  }

  document.getElementById("rotate").addEventListener("click", rotateShip);

  document.getElementById("strtOvrBtn").addEventListener("click", function() {
    location.reload();
  });
  console.log(gameBoard);

  function gaveOverChecker() {
    if (hits == 17 && tester == 0) {
      alert("the computer wins!");
      document.getElementById("compfr").removeEventListener("click", compMove);
      tester++;
    } else if (shotsFired == totalShots && tester == 0) {
      alert("the computer is out of moves! You win!");
      document.getElementById("compfr").removeEventListener("click", compMove);
      tester++;
    }
  }

  var compMove = function() {
    if (allShipsPlaced) {
      // if (lastShotHit) {
      //   console.log(lastShotX + 1);
      //   if (lastShotX + 1 < 10) {
      //     if (gameBoard[lastShotX + 1][lastShotY][0] == 0) {
      //       document.getElementById(
      //         "s" + (lastShotX + 1) + lastShotY
      //       ).style.background = "#4d88ff";
      //       document
      //         .getElementById("s" + (lastShotX + 1) + lastShotY)
      //         .classList.add("miss");
      //       gameBoard[lastShotX + 1][lastShotY][0] = 3;
      //       shotsFired++;
      //       lastShotHit = false;
      //     } else if (gameBoard[lastShotX + 1][lastShotY] == 1) {
      //       document.getElementById(
      //         "s" + (lastShotX + 1) + lastShotY
      //       ).style.background = "red";
      //       gameBoard[lastShotX + 1][lastShotY][0] = 2;
      //       hits++;
      //       shotsFired++;
      //       lastShotHit = true;
      //     } else if (gameBoard[lastShotX + 1][lastShotY][0] == 2) {
      //       lastShotHit = false;
      //       compMove();
      //     } else if (gameBoard[lastShotX + 1][lastShotY][0] == 3) {
      //       lastShotHit = false;
      //       compMove();
      //     }
      //     lastShotX++;
      //   } else {
      //     lastShotHit = false;
      //     compMove();
      //   }
      // } else {
      var x = randomIntFromInterval(0, 9);
      var y = randomIntFromInterval(0, 9);
      lastShotX = x;
      lastShotY = y;
      if (gameBoard[x][y][0] == 0) {
        document.getElementById("s" + x + y).style.background = "#4d88ff";
        document.getElementById("s" + x + y).classList.add("miss");
        gameBoard[x][y][0] = 3;
        shotsFired++;
        lastShotHit = false;
      } else if (gameBoard[x][y][0] == 1) {
        document.getElementById("s" + x + y).style.background = "red";
        gameBoard[x][y][0] = 2;
        hits++;
        shotsFired++;
        lastShotHit = true;
      } else if (gameBoard[x][y][0] == 2) {
        compMove();
      } else if (gameBoard[x][y][0] == 3) {
        compMove();
      }
      // }
    } else {
      alert("Not all ships are placed.");
    }
    gaveOverChecker();
  };
  document.getElementById("compfr").addEventListener("click", compMove);
})();
