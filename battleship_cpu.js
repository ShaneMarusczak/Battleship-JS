// (function() {
const rows = 10;
const cols = 10;
const squareSize = 50;
const totalShots = 100;
var values = [1, -1];
var lastShotHit = false;
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
var carrierSunk = false;
var battleshipSunk = false;
var cruiserSunk = false;
var submarineSunk = false;
var destroyerSunk = false;
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
var lastShotSunkShip = false;

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
        if (document.getElementById("s" + i + j).style.background == "black") {
          if (
            size == 5 &&
            document.getElementById("s" + i + j).classList == ""
          ) {
            document.getElementById("s" + i + j).classList.add("carrier");
          } else if (
            size == 4 &&
            document.getElementById("s" + i + j).classList == ""
          ) {
            document.getElementById("s" + i + j).classList.add("battleship");
          } else if (
            size == 3 &&
            placed == "cruiser" &&
            document.getElementById("s" + i + j).classList == ""
          ) {
            document.getElementById("s" + i + j).classList.add("cruiser");
          } else if (
            size == 3 &&
            placed == "submarine" &&
            document.getElementById("s" + i + j).classList == ""
          ) {
            document.getElementById("s" + i + j).classList.add("submarine");
          } else if (
            size == 2 &&
            document.getElementById("s" + i + j).classList == ""
          ) {
            document.getElementById("s" + i + j).classList.add("destroyer");
          }
          document
            .getElementById("s" + i + j)
            .removeEventListener("mouseover", highlight);
          gameBoard[i][j] = 1;
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
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .removeEventListener("mouseleave", resetColor);
        }
      }
      for (info of ships) {
        info.removeEventListener("click", placeShipSetup);
      }
    }
    size = 0;
    placedShips.push(ship);
  }
};

var shipSunkChecker = function() {
  var carrierCounter = 0;
  var battleshipCounter = 0;
  var cruiserCounter = 0;
  var submarineCounter = 0;
  var destroyerCounter = 0;
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      if (
        document.getElementById("s" + i + j).classList.contains("carrier") &&
        document.getElementById("s" + i + j).classList.contains("hit") &&
        !carrierSunk
      ) {
        carrierCounter++;
      }
      if (
        document.getElementById("s" + i + j).classList.contains("battleship") &&
        document.getElementById("s" + i + j).classList.contains("hit") &&
        !battleshipSunk
      ) {
        battleshipCounter++;
      }
      if (
        document.getElementById("s" + i + j).classList.contains("cruiser") &&
        document.getElementById("s" + i + j).classList.contains("hit") &&
        !cruiserSunk
      ) {
        cruiserCounter++;
      }
      if (
        document.getElementById("s" + i + j).classList.contains("submarine") &&
        document.getElementById("s" + i + j).classList.contains("hit") &&
        !submarineSunk
      ) {
        submarineCounter++;
      }
      if (
        document.getElementById("s" + i + j).classList.contains("destroyer") &&
        document.getElementById("s" + i + j).classList.contains("hit") &&
        !destroyerSunk
      ) {
        destroyerCounter++;
      }
    }
  }
  if (carrierCounter == 5) {
    alert("Carrier Sunk");
    carrierSunk = true;
  }
  if (battleshipCounter == 4) {
    alert("Battleship Sunk");
    battleshipSunk = true;
  }
  if (cruiserCounter == 3) {
    alert("Cruiser Sunk");
    cruiserSunk = true;
  }
  if (submarineCounter == 3) {
    alert("Submraine Sunk");
    submarineSunk = true;
  }
  if (destroyerCounter == 2) {
    alert("Destroyer Sunk");
    destroyerSunk = true;
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
    gameBoard[i].push(0);
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
  if (hits == 17) {
    alert("the computer wins!");
    document.getElementById("compfr").removeEventListener("click", compMove);
  } else if (shotsFired == totalShots) {
    alert("the computer is out of moves! You win!");
    document.getElementById("compfr").removeEventListener("click", compMove);
  }
}

var shipDirection;
var calculatedShot = function() {
  if (gameBoard[lastShotX + 1][lastShotY] == 1) {
    document.getElementById(
      "s" + (lastShotX + 1) + lastShotY
    ).style.background = "red";
    gameBoard[lastShotX + 1][lastShotY] = 2;
    hits++;
    shotsFired++;
    lastShotHit = true;
    lastShotX++;
    shipDirection = "hor-right";
    // lastShotSunkShip = false;
  } else if (gameBoard[lastShotX - 1][lastShotY] == 1) {
    document.getElementById(
      "s" + (lastShotX - 1) + lastShotY
    ).style.background = "red";
    gameBoard[lastShotX - 1][lastShotY] = 2;
    hits++;
    shotsFired++;
    lastShotHit = true;
    lastShotX--;
    shipDirection = "hor-left";
    // lastShotSunkShip = false;
  } else if (gameBoard[lastShotX][lastShotY - 1] == 1) {
    document.getElementById(
      "s" + lastShotX + (lastShotY - 1)
    ).style.background = "red";
    gameBoard[lastShotX][lastShotY - 1] = 2;
    hits++;
    shotsFired++;
    lastShotHit = true;
    lastShotY--;
    shipDirection = "ver-down";
    // lastShotSunkShip = false;
  } else if (gameBoard[lastShotX][lastShotY + 1] == 1) {
    document.getElementById(
      "s" + lastShotX + (lastShotY + 1)
    ).style.background = "red";
    gameBoard[lastShotX][lastShotY + 1] = 2;
    hits++;
    shotsFired++;
    lastShotHit = true;
    lastShotY++;
    shipDirection = "ver-up";
    // lastShotSunkShip = false;
  } else {
    if (shipDirection == "hor-right") {
      for (i = 1; i < 11; i++) {
        if (gameBoard[lastShotX - i][lastShotY] == 1) {
          document.getElementById(
            "s" + (lastShotX - i) + lastShotY
          ).style.background = "red";
          gameBoard[lastShotX - i][lastShotY] = 2;
          hits++;
          shotsFired++;
          lastShotHit = true;
          // lastShotX--;
          shipDirection = "hor-right";
          break;
        } else {
          shipDirection = "";
        }
        // shipDirection = "";
        // lastShotSunkShip = true;
        // else {
        //   lastShotSunkShip = true;
        //   randomShot();
        // }
      }
    } else if (shipDirection == "hor-left") {
      for (i = 1; i < 11; i++) {
        if (gameBoard[lastShotX + i][lastShotY] == 1) {
          document.getElementById(
            "s" + (lastShotX + i) + lastShotY
          ).style.background = "red";
          gameBoard[lastShotX + i][lastShotY] = 2;
          hits++;
          shotsFired++;
          lastShotHit = true;
          shipDirection = "hor-left";
          // lastShotX++;
          // lastShotSunkShip = true;
          break;
        } else {
          shipDirection = "";
        }
        // lastShotSunkShip = true;
        // else {
        //   lastShotSunkShip = true;
        //   randomShot();
        // }
      }
    } else if (shipDirection == "ver-down") {
      for (i = 1; i < 11; i++) {
        if (gameBoard[lastShotX][lastShotY + i] == 1) {
          document.getElementById(
            "s" + lastShotX + (lastShotY + i)
          ).style.background = "red";
          gameBoard[lastShotX][lastShotY + i] = 2;
          hits++;
          shotsFired++;
          lastShotHit = true;
          // lastShotY++;
          // lastShotSunkShip = true;
          shipDirection = "ver-down";
          break;
        } else {
          shipDirection = "";
        }
        // shipDirection = "";
        // lastShotSunkShip = true;
        // else {
        //   lastShotSunkShip = true;
        //   randomShot();
        // }
      }
    } else if (shipDirection == "ver-up") {
      for (i = 1; i < 11; i++) {
        if (gameBoard[lastShotX][lastShotY - i] == 1) {
          document.getElementById(
            "s" + lastShotX + (lastShotY - i)
          ).style.background = "red";
          gameBoard[lastShotX][lastShotY - i] = 2;
          hits++;
          shotsFired++;
          lastShotHit = true;
          shipDirection = "ver-up";
          // lastShotY--;
          // lastShotSunkShip = true;
          break;
        } else {
          shipDirection = "";
        }
        // shipDirection = "";
        // lastShotSunkShip = true;
      }
    }
    if (shipDirection == "") {
      randomShot();
    }
  }
};

var randomShot = function() {
  var x = randomIntFromInterval(0, 9);
  var y = randomIntFromInterval(0, 9);
  lastShotX = x;
  lastShotY = y;
  if (gameBoard[x][y] == 0) {
    document.getElementById("s" + x + y).style.background = "#4d88ff";
    document.getElementById("s" + x + y).classList.add("miss");
    gameBoard[x][y] = 3;
    shotsFired++;
    lastShotHit = false;
    lastShotSunkShip = false;
  } else if (gameBoard[x][y] == 1) {
    document.getElementById("s" + x + y).style.background = "red";
    document.getElementById("s" + x + y).classList.add("hit");
    gameBoard[x][y] = 2;
    hits++;
    shotsFired++;
    lastShotHit = true;
    lastShotSunkShip = false;
  } else if (gameBoard[x][y] == 2) {
    randomShot();
  } else if (gameBoard[x][y] == 3) {
    randomShot();
  }
};

var compMove = function() {
  // if (allShipsPlaced) {
  //   if (lastShotSunkShip) {
  //     randomShot();
  //   } else {
  //     if (lastShotHit) {
  //       calculatedShot();
  //     } else {
  //       randomShot();
  //     }
  //   }
  // } else {
  //   alert("Not all ships are placed.");
  // }

  if (allShipsPlaced) {
    randomShot();
  } else {
    alert("Not all ships are placed.");
  }
  shipSunkChecker();
  gaveOverChecker();
};
document.getElementById("compfr").addEventListener("click", compMove);
// })();
