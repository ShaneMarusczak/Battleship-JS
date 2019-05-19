/*
 * This code is under a lot of development.
 * There is a lot of refactoring and clean up that needs to be done.
 * When I am satisfied it is working correctly I will perform a major cleanup.
 */

(function() {
  const rows = 10;
  const cols = 10;
  const squareSize = 50;
  const totalShots = 100;
  var lastShotHit = false;
  var shipFound = 0;
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
  var shotsFired = 0;
  var lastShotX;
  var lastShotY;
  var lastShotSunkShip = false;
  var ships = [carrier, battleship, cruiser, submarine, destroyer];
  var shipDirection = "";
  var lastShotMiss;
  var hits;
  var firstTimeIn = true;

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
    if (Number(this.id[1]) < rows + 1 - size) {
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
    if (Number(this.id[2]) < cols + 1 - size) {
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
          document
            .getElementById("s" + i + j)
            .classList.contains("battleship") &&
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
          document
            .getElementById("s" + i + j)
            .classList.contains("submarine") &&
          document.getElementById("s" + i + j).classList.contains("hit") &&
          !submarineSunk
        ) {
          submarineCounter++;
        }
        if (
          document
            .getElementById("s" + i + j)
            .classList.contains("destroyer") &&
          document.getElementById("s" + i + j).classList.contains("hit") &&
          !destroyerSunk
        ) {
          destroyerCounter++;
        }
      }
    }
    if (carrierCounter == 5) {
      document.getElementById("CarrierSunk").innerHTML = "Carrier";
      carrierSunk = true;
      shipFound = shipFound - 5;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (battleshipCounter == 4) {
      document.getElementById("BattleshipSunk").innerHTML = "Battleship";
      battleshipSunk = true;
      shipFound = shipFound - 4;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (cruiserCounter == 3) {
      document.getElementById("CruiserSunk").innerHTML = "Cruiser";
      cruiserSunk = true;
      shipFound = shipFound - 3;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (submarineCounter == 3) {
      document.getElementById("SubmarineSunk").innerHTML = "Submarine";
      submarineSunk = true;
      shipFound = shipFound - 3;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (destroyerCounter == 2) {
      document.getElementById("DestroyerSunk").innerHTML = "Destroyer";
      destroyerSunk = true;
      shipFound = shipFound - 2;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
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
    if (
      carrierSunk &&
      battleshipSunk &&
      cruiserSunk &&
      submarineSunk &&
      destroyerSunk
    ) {
      alert("the computer wins!");
      document.getElementById("compfr").removeEventListener("click", compMove);
    } else if (shotsFired == totalShots) {
      alert("the computer is out of moves! You win!");
      document.getElementById("compfr").removeEventListener("click", compMove);
    }
  }

  var calculatedShot = function() {
    //This function is complete garbage, if you are reading this please help!
    //Like for real, it is garbage.
    //The computer player cheats, and even then it still cant win.

    //This function is depracated. It has been replaced with the foundShipAttack function.
    //The code is left in here temporarily for reference purposes.
    //I will remove it eventually.

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

  var value = 0;
  var testvalue = 0;

  //I think this function is very close to being good.
  //I am not completely satisfied, but very close.
  var shipFoundAttack = function() {
    // if (shipDirection == "") {
    var x = lastShotX;
    var y = lastShotY;
    if (value == 0 && shipDirection == "") {
      if (gameBoard[x + 1][y] == 0) {
        document.getElementById("s" + (x + 1) + y).style.background = "#4d88ff";
        document.getElementById("s" + (x + 1) + y).classList.add("miss");
        gameBoard[x + 1][y] = 3;
        shotsFired++;
        value++;
        // lastShotX++;
        return;
      } else if (gameBoard[x + 1][y] == 1) {
        document.getElementById("s" + (x + 1) + y).style.background = "red";
        document.getElementById("s" + (x + 1) + y).classList.add("hit");
        gameBoard[x + 1][y] = 2;
        hits++;
        shotsFired++;
        shipFound++;
        shipDirection = "ver";
        value = 0;
        lastShotX++;
        return;
      } else if (gameBoard[x + 1][y] == 2) {
        value++;
      } else if (gameBoard[x + 1][y] == 3) {
        value++;
      }
    }
    if (value == 1 && shipDirection == "") {
      if (gameBoard[x - 1][y] == 0) {
        document.getElementById("s" + (x - 1) + y).style.background = "#4d88ff";
        document.getElementById("s" + (x - 1) + y).classList.add("miss");
        gameBoard[x - 1][y] = 3;
        shotsFired++;
        value++;
        // lastShotX--;
        return;
      } else if (gameBoard[x - 1][y] == 1) {
        document.getElementById("s" + (x - 1) + y).style.background = "red";
        document.getElementById("s" + (x - 1) + y).classList.add("hit");
        gameBoard[x - 1][y] = 2;
        hits++;
        shotsFired++;
        shipFound++;
        shipDirection = "ver";
        value = 0;
        lastShotX--;
        testvalue = -1;
        return;
      } else if (gameBoard[x - 1][y] == 2) {
        value++;
      } else if (gameBoard[x - 1][y] == 3) {
        value++;
      }
    }
    if (value == 2 && shipDirection == "") {
      if (gameBoard[x][y + 1] == 0) {
        document.getElementById("s" + x + (y + 1)).style.background = "#4d88ff";
        document.getElementById("s" + x + (y + 1)).classList.add("miss");
        gameBoard[x][y + 1] = 3;
        shotsFired++;
        value++;
        // lastShotY--;
        return;
      } else if (gameBoard[x][y + 1] == 1) {
        document.getElementById("s" + x + (y + 1)).style.background = "red";
        document.getElementById("s" + x + (y + 1)).classList.add("hit");
        gameBoard[x][y + 1] = 2;
        hits++;
        shotsFired++;
        shipFound++;
        shipDirection = "hor";
        value = 0;
        lastShotY++;
        return;
      } else if (gameBoard[x][y + 1] == 2) {
        value++;
      } else if (gameBoard[x][y + 1] == 3) {
        value++;
      }
    }
    if (value == 3 && shipDirection == "") {
      if (gameBoard[x][y - 1] == 0) {
        document.getElementById("s" + x + (y - 1)).style.background = "#4d88ff";
        document.getElementById("s" + x + (y - 1)).classList.add("miss");
        gameBoard[x][y - 1] = 3;
        shotsFired++;
        value++;
        // lastShotY--;
        return;
      } else if (gameBoard[x][y - 1] == 1) {
        document.getElementById("s" + x + (y - 1)).style.background = "red";
        document.getElementById("s" + x + (y - 1)).classList.add("hit");
        gameBoard[x][y - 1] = 2;
        hits++;
        shotsFired++;
        shipFound++;
        shipDirection = "hor";
        value = 0;
        lastShotY--;
        testvalue = -1;
        return;
      } else if (gameBoard[x][y - 1] == 2) {
        value++;
      } else if (gameBoard[x][y - 1] == 3) {
        value++;
      }
    }
    if (shipDirection == "ver") {
      console.log(x - testvalue);
      if (gameBoard[x + 1][y] == 0) {
        document.getElementById("s" + (x + 1) + y).style.background = "#4d88ff";
        document.getElementById("s" + (x + 1) + y).classList.add("miss");
        gameBoard[x + 1][y] = 3;
        shotsFired++;
        value++;

        // lastShotX++;
        return;
      } else if (gameBoard[x + 1][y] == 1) {
        document.getElementById("s" + (x + 1) + y).style.background = "red";
        document.getElementById("s" + (x + 1) + y).classList.add("hit");
        gameBoard[x + 1][y] = 2;
        hits++;
        shotsFired++;
        shipFound++;
        shipDirection = "ver";
        value = 0;
        lastShotX++;
        // testvalue++;
        return;
      } else if (gameBoard[x + 1][y] == 2 || gameBoard[x + 1][y] == 3) {
        if (firstTimeIn) {
          testvalue = shipFound + testvalue;
          // testvalue--;
          console.log(testvalue);
          firstTimeIn = false;
        }
        if (gameBoard[x - testvalue][y] == 0) {
          document.getElementById("s" + (x - testvalue) + y).style.background =
            "#4d88ff";
          document
            .getElementById("s" + (x - testvalue) + y)
            .classList.add("miss");
          gameBoard[x - testvalue][y] = 3;
          shotsFired++;
          value++;

          // lastShotX++;
          return;
        } else if (gameBoard[x - testvalue][y] == 1) {
          document.getElementById("s" + (x - testvalue) + y).style.background =
            "red";
          document
            .getElementById("s" + (x - testvalue) + y)
            .classList.add("hit");
          gameBoard[x - testvalue][y] = 2;
          hits++;
          shotsFired++;
          shipFound++;
          shipDirection = "ver";
          value = 0;
          lastShotX--;
          // lastShotX = lastShotX-testvalue;
          // testvalue++;
          return;
        }
        // console.log(x - shipFound + 1);
        // console.log(y);
      }
    }

    if (shipDirection == "hor") {
      console.log(x - testvalue);
      if (gameBoard[x][y + 1] == 0) {
        document.getElementById("s" + x + (y + 1)).style.background = "#4d88ff";
        document.getElementById("s" + x + (y + 1)).classList.add("miss");
        gameBoard[x][y + 1] = 3;
        shotsFired++;
        value++;

        // lastShotX++;
        return;
      } else if (gameBoard[x][y + 1] == 1) {
        document.getElementById("s" + x + (y + 1)).style.background = "red";
        document.getElementById("s" + x + (y + 1)).classList.add("hit");
        gameBoard[x][y + 1] = 2;
        hits++;
        shotsFired++;
        shipFound++;
        shipDirection = "hor";
        value = 0;
        lastShotY++;
        // testvalue++;
        return;
      } else if (gameBoard[x][y + 1] == 2 || gameBoard[x][y + 1] == 3) {
        if (firstTimeIn) {
          testvalue = shipFound + testvalue;
          // testvalue--;
          console.log(testvalue);
          firstTimeIn = false;
        }
        if (gameBoard[x][y - testvalue] == 0) {
          document.getElementById("s" + x + (y - testvalue)).style.background =
            "#4d88ff";
          document
            .getElementById("s" + x + (y - testvalue))
            .classList.add("miss");
          gameBoard[x][y - testvalue] = 3;
          shotsFired++;
          value++;

          // lastShotX++;
          return;
        } else if (gameBoard[x][y - testvalue] == 1) {
          document.getElementById("s" + x + (y - testvalue)).style.background =
            "red";
          document
            .getElementById("s" + x + (y - testvalue))
            .classList.add("hit");
          gameBoard[x][y - testvalue] = 2;
          hits++;
          shotsFired++;
          shipFound++;
          shipDirection = "hor";
          value = 0;
          lastShotY--;
          // lastShotX = lastShotX-testvalue;
          // testvalue++;
          return;
        }
        // console.log(x - shipFound + 1);
        // console.log(y);
      }
    }
    // }
  };

  var randomShot = function() {
    //This code actually works quite well.
    var x = randomIntFromInterval(0, 9);
    var y = randomIntFromInterval(0, 9);
    lastShotX = x;
    lastShotY = y;
    if (gameBoard[x][y] == 0) {
      document.getElementById("s" + x + y).style.background = "#4d88ff";
      document.getElementById("s" + x + y).classList.add("miss");
      gameBoard[x][y] = 3;
      shotsFired++;
    } else if (gameBoard[x][y] == 1) {
      document.getElementById("s" + x + y).style.background = "red";
      document.getElementById("s" + x + y).classList.add("hit");
      gameBoard[x][y] = 2;
      // hits++;
      shotsFired++;
      shipFound++;
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
    console.log(shipFound);
    if (allShipsPlaced) {
      if (shipFound > 0) {
        shipFoundAttack();
      } else {
        randomShot();
      }
    } else {
      alert("Not all ships are placed.");
    }
    shipSunkChecker();
    gaveOverChecker();
  };
  document.getElementById("compfr").addEventListener("click", compMove);
})();
