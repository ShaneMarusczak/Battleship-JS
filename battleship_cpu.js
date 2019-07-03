/*
 * This code is under a lot of development.
 * There is a lot of refactoring and clean up that needs to be done.
 * When I am satisfied it is working correctly I will perform a major cleanup.
 */
"use strict";
(function() {
  const rows = 10;
  const cols = 10;
  const cellSize = 50;
  var shipFound = 0;
  var shipsPlaced = 0;
  var size;
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
  var gameBoardContainer = document.getElementById("gameboard_cpu");
  var carrier = document.getElementById("carrier");
  var battleship = document.getElementById("battleship");
  var cruiser = document.getElementById("cruiser");
  var submarine = document.getElementById("submarine");
  var destroyer = document.getElementById("destroyer");
  var placed;
  var placedShips = [];
  var shotsFired = 0;
  var lastShotX;
  var lastShotY;
  var ships = [carrier, battleship, cruiser, submarine, destroyer];
  var shipDirection = "";
  var firstTimeIn = true;
  var scanCounter = 0;
  var tempShipFound = 0;
  var direction = "hor";

  function wait(ms) {
    var d = new Date();
    var d2 = null;
    do {
      d2 = new Date();
    } while (d2 - d < ms);
  }

  function randomIntFromInterval(min, max) {
    //inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  var shipSunkHelper = function(i, sunkShipName) {
    sunkColorChange(sunkShipName);
    shipFound = shipFound - i;
    shipDirection = "";
    firstTimeIn = true;
    tempShipFound = 0;
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (
          document.getElementById("c" + i + j).classList.contains(sunkShipName)
        ) {
          gameBoard[i][j] = 4;
        }
      }
    }
    shipHitButNotSunkReassign();
  };

  var rotateShip = function() {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (direction == "hor") {
          document
            .getElementById("c" + i + j)
            .removeEventListener("mouseover", highlight);
          document
            .getElementById("c" + i + j)
            .addEventListener("mouseover", rotatedHighlight);
        } else {
          document
            .getElementById("c" + i + j)
            .removeEventListener("mouseover", rotatedHighlight);
          document
            .getElementById("c" + i + j)
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
    if (Number(this.id[1]) < rows + 1 - size) {
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          document
            .getElementById("c" + i + j)
            .addEventListener("click", placeShip);
        }
      }
      for (var i = 0; i < size; i++) {
        document.getElementById(
          this.id[0] + (Number(this.id[1]) + i) + this.id[2]
        ).style.background = "black";
      }
    } else {
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          document
            .getElementById("c" + i + j)
            .removeEventListener("click", placeShip);
        }
      }
    }
  };

  var highlight = function() {
    if (Number(this.id[2]) < cols + 1 - size) {
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          document
            .getElementById("c" + i + j)
            .addEventListener("click", placeShip);
        }
      }
      for (var i = 0; i < size; i++) {
        document.getElementById(
          this.id[0] + this.id[1] + (Number(this.id[2]) + i)
        ).style.background = "black";
      }
    } else {
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          document
            .getElementById("c" + i + j)
            .removeEventListener("click", placeShip);
        }
      }
    }
  };

  var resetColor = function() {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (document.getElementById("c" + i + j).className == "") {
          document.getElementById("c" + i + j).style.background = "#80aaff";
        }
      }
    }
  };

  var placeShip = function() {
    if (allShipsPlaced) {
      return;
    }
    var ship = [];
    var canPlace = true;
    var x = Number(this.id[1]);
    var y = Number(this.id[2]);

    for (var placedShip of placedShips) {
      for (var coor of placedShip) {
        if (direction == "hor") {
          for (var i = 0; i < size; i++) {
            if (x == coor[0] && y + i == coor[1]) {
              canPlace = false;
            }
          }
        } else {
          for (var i = 0; i < size; i++) {
            if (x + i == coor[0] && y == coor[1]) {
              canPlace = false;
            }
          }
        }
      }
    }
    if (!canPlace) {
      alert("Can not place ship here!");
    }
    if (canPlace) {
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          if (
            document.getElementById("c" + i + j).style.background == "black"
          ) {
            if (
              size == 5 &&
              document.getElementById("c" + i + j).classList == ""
            ) {
              document.getElementById("c" + i + j).classList.add("carrier");
            } else if (
              size == 4 &&
              document.getElementById("c" + i + j).classList == ""
            ) {
              document.getElementById("c" + i + j).classList.add("battleship");
            } else if (
              size == 3 &&
              placed == "cruiser" &&
              document.getElementById("c" + i + j).classList == ""
            ) {
              document.getElementById("c" + i + j).classList.add("cruiser");
            } else if (
              size == 3 &&
              placed == "submarine" &&
              document.getElementById("c" + i + j).classList == ""
            ) {
              document.getElementById("c" + i + j).classList.add("submarine");
            } else if (
              size == 2 &&
              document.getElementById("c" + i + j).classList == ""
            ) {
              document.getElementById("c" + i + j).classList.add("destroyer");
            }
            document
              .getElementById("c" + i + j)
              .removeEventListener("mouseover", highlight);
            gameBoard[i][j] = 1;
            ship.push([i, j]);
          }
        }
      }
      if (size == 5) {
        placedCarrier = true;
        shipsPlaced++;
        document.getElementById("carrier").style.display = "none";
      } else if (size == 4) {
        placedBattleship = true;
        shipsPlaced++;
        document.getElementById("battleship").style.display = "none";
      } else if (size == 3) {
        if (placed == "cruiser") {
          placedCruiser = true;
          shipsPlaced++;
          document.getElementById("cruiser").style.display = "none";
        } else if (placed == "submarine") {
          placedSubmarine = true;
          shipsPlaced++;
          document.getElementById("submarine").style.display = "none";
        }
      } else if (size == 2) {
        placedDetroyer = true;
        shipsPlaced++;
        document.getElementById("destroyer").style.display = "none";
      }
      if (shipsPlaced == 5) {
        document.getElementById("instructions").style.display = "none";
        alert("All ships Placed!");
        document.getElementById("ready").style.display = "block";
        allShipsPlaced = true;
        for (var i = 0; i < cols; i++) {
          for (var j = 0; j < rows; j++) {
            document
              .getElementById("c" + i + j)
              .removeEventListener("mouseleave", resetColor);
          }
        }
        for (var info of ships) {
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
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (
          document.getElementById("c" + i + j).classList.contains("carrier") &&
          gameBoard[i][j] == 2 &&
          !carrierSunk
        ) {
          carrierCounter++;
        }
        if (
          document
            .getElementById("c" + i + j)
            .classList.contains("battleship") &&
          gameBoard[i][j] == 2 &&
          !battleshipSunk
        ) {
          battleshipCounter++;
        }
        if (
          document.getElementById("c" + i + j).classList.contains("cruiser") &&
          gameBoard[i][j] == 2 &&
          !cruiserSunk
        ) {
          cruiserCounter++;
        }
        if (
          document
            .getElementById("c" + i + j)
            .classList.contains("submarine") &&
          gameBoard[i][j] == 2 &&
          !submarineSunk
        ) {
          submarineCounter++;
        }
        if (
          document
            .getElementById("c" + i + j)
            .classList.contains("destroyer") &&
          gameBoard[i][j] == 2 &&
          !destroyerSunk
        ) {
          destroyerCounter++;
        }
      }
    }
    if (carrierCounter == 5) {
      document.getElementById("CarrierSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      carrierSunk = true;
      shipSunkHelper(5, "carrier");
    }
    if (battleshipCounter == 4) {
      document.getElementById("BattleshipSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      battleshipSunk = true;
      shipSunkHelper(4, "battleship");
    }
    if (cruiserCounter == 3) {
      document.getElementById("CruiserSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      cruiserSunk = true;
      shipSunkHelper(3, "cruiser");
    }
    if (submarineCounter == 3) {
      document.getElementById("SubmarineSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      submarineSunk = true;
      shipSunkHelper(3, "submarine");
    }
    if (destroyerCounter == 2) {
      document.getElementById("DestroyerSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      destroyerSunk = true;
      shipSunkHelper(2, "destroyer");
    }
  };

  var allShips = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
  var placeShipSetup = function() {
    for (var ship of allShips) {
      if (this.id != ship) {
        document.getElementById(ship).classList.remove("clicked");
      }
    }
    if (this.id == "carrier" && !placedCarrier) {
      size = 5;
      this.classList.add("clicked");
    } else if (this.id == "battleship" && !placedBattleship) {
      size = 4;
      this.classList.add("clicked");
    } else if (this.id == "cruiser" && !placedCruiser) {
      size = 3;
      this.classList.add("clicked");
      placed = "cruiser";
    } else if (this.id == "submarine" && !placedSubmarine) {
      size = 3;
      this.classList.add("clicked");
      placed = "submarine";
    } else if (this.id == "destroyer" && !placedDetroyer) {
      size = 2;
      this.classList.add("clicked");
    }
  };

  for (var i = 0; i < cols; i++) {
    gameBoard.push([]);
    for (var j = 0; j < rows; j++) {
      gameBoard[i].push(0);
      var cell = document.createElement("div");
      gameBoardContainer.appendChild(cell);
      cell.id = "c" + j + i;
      var topPosition = j * cellSize;
      var leftPosition = i * cellSize;
      cell.style.top = topPosition + "px";
      cell.style.left = leftPosition + "px";
    }
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      document.getElementById("c" + i + j).style.background = "#80aaff";
      document
        .getElementById("c" + i + j)
        .addEventListener("mouseover", highlight);
      document
        .getElementById("c" + i + j)
        .addEventListener("mouseleave", resetColor);
    }
  }

  for (var ship of ships) {
    ship.addEventListener("click", placeShipSetup);
  }

  document.getElementById("rotate").addEventListener("click", rotateShip);

  document.getElementById("strtOvrBtn").addEventListener("click", function() {
    location.reload();
  });

  function gaveOverChecker() {
    if (
      carrierSunk &&
      battleshipSunk &&
      cruiserSunk &&
      submarineSunk &&
      destroyerSunk
    ) {
      document.getElementById("losstext").style.display = "block";
      // document.getElementById("compfr").removeEventListener("click", compMove);
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .removeEventListener("click", compMove);
          if (
            document.getElementById("s" + i + j).classList != "" &&
            document.getElementById("s" + i + j).style.background != "red" &&
            document.getElementById("s" + i + j).style.background != "black"
          ) {
            document.getElementById("s" + i + j).style.background = "darkred";
          }
        }
      }
    }
  }

  var shipFoundAttack = function() {
    var x = lastShotX;
    var y = lastShotY;
    if (shipDirection == "ver") {
      if (!(x + 1 > 9)) {
        if (gameBoard[x + 1][y] == 0) {
          document.getElementById("c" + (x + 1) + y).style.background =
            "#4d88ff";
          gameBoard[x + 1][y] = 3;
          shotsFired++;
          return;
        } else if (gameBoard[x + 1][y] == 1) {
          document.getElementById("c" + (x + 1) + y).style.background = "red";
          gameBoard[x + 1][y] = 2;
          shotsFired++;
          shipFound++;
          lastShotX++;
          return;
        }
      }
      if (x + 1 > 9 || gameBoard[x + 1][y] == 2 || gameBoard[x + 1][y] == 3) {
        if (firstTimeIn) {
          tempShipFound = shipFound + tempShipFound;
          firstTimeIn = false;
        }
        if (x - tempShipFound > -1 && gameBoard[x - tempShipFound][y] == 0) {
          document.getElementById(
            "c" + (x - tempShipFound) + y
          ).style.background = "#4d88ff";

          gameBoard[x - tempShipFound][y] = 3;
          shotsFired++;
          return;
        } else if (
          x - tempShipFound > -1 &&
          gameBoard[x - tempShipFound][y] == 1
        ) {
          document.getElementById(
            "c" + (x - tempShipFound) + y
          ).style.background = "red";
          gameBoard[x - tempShipFound][y] = 2;
          shotsFired++;
          shipFound++;
          lastShotX--;
          return;
        } else {
          scanCounter = 0;
          shipDirection = "";
          firstTimeIn = true;
          tempShipFound--;
          tempShipFound--;
        }
      }
    }
    if (shipDirection == "hor") {
      if (!(y + 1 > 9)) {
        if (gameBoard[x][y + 1] == 0) {
          document.getElementById("c" + x + (y + 1)).style.background =
            "#4d88ff";

          gameBoard[x][y + 1] = 3;
          shotsFired++;
          return;
        } else if (gameBoard[x][y + 1] == 1) {
          document.getElementById("c" + x + (y + 1)).style.background = "red";
          gameBoard[x][y + 1] = 2;
          shotsFired++;
          shipFound++;
          lastShotY++;
          return;
        }
      }
      if (y + 1 > 9 || gameBoard[x][y + 1] == 2 || gameBoard[x][y + 1] == 3) {
        if (firstTimeIn) {
          tempShipFound = shipFound + tempShipFound;
          firstTimeIn = false;
        }
        if (gameBoard[x][y - tempShipFound] == 0) {
          document.getElementById(
            "c" + x + (y - tempShipFound)
          ).style.background = "#4d88ff";

          gameBoard[x][y - tempShipFound] = 3;
          shotsFired++;
          return;
        }
        for (var i = 1; i < 10; i++) {
          if (y - i < 0) {
            break;
          } else if (gameBoard[x][y - i] == 1) {
            document.getElementById("c" + x + (y - i)).style.background = "red";
            gameBoard[x][y - i] = 2;
            shotsFired++;
            shipFound++;
            return;
          }
        }
        scanCounter = 0;
        shipDirection = "";
        firstTimeIn = true;
        tempShipFound--;
        tempShipFound--;
      }
    }
    if (scanCounter == 0 && shipDirection == "") {
      if (x + 1 > 9) {
        scanCounter++;
      } else {
        if (gameBoard[x + 1][y] == 0) {
          document.getElementById("c" + (x + 1) + y).style.background =
            "#4d88ff";

          gameBoard[x + 1][y] = 3;
          shotsFired++;
          scanCounter++;
          return;
        } else if (gameBoard[x + 1][y] == 1) {
          document.getElementById("c" + (x + 1) + y).style.background = "red";
          gameBoard[x + 1][y] = 2;
          shotsFired++;
          shipFound++;
          shipDirection = "ver";
          scanCounter = 0;
          lastShotX++;
          return;
        } else {
          scanCounter++;
        }
      }
    }
    if (scanCounter == 1 && shipDirection == "") {
      if (x - 1 < 0) {
        scanCounter++;
      } else {
        if (gameBoard[x - 1][y] == 0) {
          document.getElementById("c" + (x - 1) + y).style.background =
            "#4d88ff";

          gameBoard[x - 1][y] = 3;
          shotsFired++;
          scanCounter++;
          return;
        } else if (gameBoard[x - 1][y] == 1) {
          document.getElementById("c" + (x - 1) + y).style.background = "red";
          gameBoard[x - 1][y] = 2;
          shotsFired++;
          shipFound++;
          shipDirection = "ver";
          scanCounter = 0;
          lastShotX--;
          tempShipFound--;
          return;
        } else {
          scanCounter++;
        }
      }
    }
    if (scanCounter == 2 && shipDirection == "") {
      if (y + 1 > 9) {
        scanCounter++;
      } else {
        if (gameBoard[x][y + 1] == 0) {
          document.getElementById("c" + x + (y + 1)).style.background =
            "#4d88ff";

          gameBoard[x][y + 1] = 3;
          shotsFired++;
          scanCounter++;
          return;
        } else if (gameBoard[x][y + 1] == 1) {
          document.getElementById("c" + x + (y + 1)).style.background = "red";
          gameBoard[x][y + 1] = 2;
          shotsFired++;
          shipFound++;
          shipDirection = "hor";
          scanCounter = 0;
          lastShotY++;
          return;
        } else {
          scanCounter++;
        }
      }
    }
    if (scanCounter == 3 && shipDirection == "") {
      if (gameBoard[x][y - 1] == 0) {
        document.getElementById("c" + x + (y - 1)).style.background = "#4d88ff";
        gameBoard[x][y - 1] = 3;
        shotsFired++;
        scanCounter++;
        return;
      } else if (gameBoard[x][y - 1] == 1) {
        document.getElementById("c" + x + (y - 1)).style.background = "red";
        gameBoard[x][y - 1] = 2;
        shotsFired++;
        shipFound++;
        shipDirection = "hor";
        scanCounter = 0;
        lastShotY--;
        tempShipFound--;
        return;
      }
    }
  };

  var searchingShot = function() {
    var x;
    var y;
    do {
      if (shotsFired < 6) {
        x = randomIntFromInterval(3, 7);
        y = randomIntFromInterval(3, 7);
      } else if (shotsFired < 12) {
        x = randomIntFromInterval(2, 8);
        y = randomIntFromInterval(2, 8);
      } else {
        x = randomIntFromInterval(0, 9);
        y = randomIntFromInterval(0, 9);
      }
    } while ((x % 2 != 0 && y % 2 == 0) || (x % 2 == 0 && y % 2 != 0));
    lastShotX = x;
    lastShotY = y;
    if (gameBoard[x][y] == 0) {
      document.getElementById("c" + x + y).style.background = "#4d88ff";
      gameBoard[x][y] = 3;
      shotsFired++;
    } else if (gameBoard[x][y] == 1) {
      document.getElementById("c" + x + y).style.background = "red";
      gameBoard[x][y] = 2;
      shotsFired++;
      shipFound++;
    } else if (gameBoard[x][y] == 2 || gameBoard[x][y] == 3 || gameBoard[x][y] == 4) {
      searchingShot();
    }
  };

  var compMove = function() {
    // console.log(gameBoard);
    if (
      document.getElementById("wintext").style.display == "block" ||
      document.getElementById("losstext").style.display == "block" ||
      this.style.background == "rgb(77, 136, 255)" ||
      this.style.background == "red"
    ) {
      return;
    }
    if (allShipsPlaced) {
      if (shipFound > 0) {
        shipFoundAttack();
      } else {
        searchingShot();
      }
    } else {
      alert("Not all ships are placed.");
    }
    shipSunkChecker();
    gaveOverChecker();
  };

  var shipHitButNotSunkReassign = function() {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (gameBoard[i][j] == 2) {
          lastShotX = i;
          lastShotY = j;
          return;
        }
      }
    }
  };

  var sunkColorChange = function(shipName) {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (
          document.getElementById("c" + i + j).classList.contains(shipName) &&
          gameBoard[i][j] == 2
        ) {
          document.getElementById("c" + i + j).style.background = "darkred";
        }
      }
    }
  };

  // document.getElementById("compfr").addEventListener("click", compMove);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      document.getElementById("s" + i + j).addEventListener("click", compMove);
    }
  }
})();
