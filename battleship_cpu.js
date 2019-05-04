const rows = 10;
const cols = 10;
const squareSize = 50;

var shipsPlaced = 0;

var size;

var direction;

var gameBoard = [];

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

var ships = [carrier, battleship, cruiser, submarine, destroyer];

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
  for (i = 0; i < size; i++) {
    document.getElementById(
      this.id[0] + (Number(this.id[1]) + i) + this.id[2]
    ).style.background = "black";
  }
};

var highlight = function() {
  for (i = 0; i < size; i++) {
    document.getElementById(
      this.id[0] + this.id[1] + (Number(this.id[2]) + i)
    ).style.background = "black";
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

var setColor = function() {
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
          document.getElementById("s" + i + j).classList.add("ship");
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
      if (shipsPlaced == 5) {
        alert("all ships placed");
      }
    } else if (size == 4) {
      placedBattleship = true;
      shipsPlaced++;
      if (shipsPlaced == 5) {
        alert("all ships placed");
      }
    } else if (size == 3) {
      if (placed == "cruiser") {
        placedCruiser = true;
        shipsPlaced++;
        if (shipsPlaced == 5) {
          alert("all ships placed");
        }
      } else if (placed == "submarine") {
        placedSubmarine = true;
        shipsPlaced++;
        if (shipsPlaced == 5) {
          alert("all ships placed");
        }
      }
    } else if (size == 2) {
      placedDetroyer = true;
      shipsPlaced++;
      if (shipsPlaced == 5) {
        alert("all ships placed");
      }
    }
    size = 0;
    placedShips.push(ship);
  }
};

var placeShip = function() {
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
    document.getElementById("s" + i + j).addEventListener("click", setColor);
    var direction = "hor";
  }
}

for (ship of ships) {
  ship.addEventListener("click", placeShip);
}

document.getElementById("rotate").addEventListener("click", rotateShip);

// console.log(gameBoard);
