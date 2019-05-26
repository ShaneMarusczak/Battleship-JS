/*
 * This code is under a lot of development.
 * There is a lot of refactoring and clean up that needs to be done.
 * When I am satisfied it is working correctly I will perform a major cleanup.
 */

(function() {
  const rows = 10;
  const cols = 10;
  const cellSize = 50;
  const totalShots = 100;
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
  var gameBoardContainer = document.getElementById("gameboard_cpu");
  var gameBoardContainer_2 = document.getElementById("gameboard");
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

  var rotateShip = function() {
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
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
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("c" + i + j)
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
            .getElementById("c" + i + j)
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
            .getElementById("c" + i + j)
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
            .getElementById("c" + i + j)
            .removeEventListener("click", placeShip);
        }
      }
    }
  };

  var resetColor = function() {
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
        if (document.getElementById("c" + i + j).className == "") {
          document.getElementById("c" + i + j).style.background = "#80aaff";
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
        document.getElementById("test1").style.display = "none";
        alert("All ships Placed!");
        document.getElementById("ready").style.display = "block";
        allShipsPlaced = true;
        for (i = 0; i < cols; i++) {
          for (j = 0; j < rows; j++) {
            document
              .getElementById("c" + i + j)
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
          document.getElementById("c" + i + j).classList.contains("carrier") &&
          document.getElementById("c" + i + j).classList.contains("hit") &&
          !carrierSunk
        ) {
          carrierCounter++;
        }
        if (
          document
            .getElementById("c" + i + j)
            .classList.contains("battleship") &&
          document.getElementById("c" + i + j).classList.contains("hit") &&
          !battleshipSunk
        ) {
          battleshipCounter++;
        }
        if (
          document.getElementById("c" + i + j).classList.contains("cruiser") &&
          document.getElementById("c" + i + j).classList.contains("hit") &&
          !cruiserSunk
        ) {
          cruiserCounter++;
        }
        if (
          document
            .getElementById("c" + i + j)
            .classList.contains("submarine") &&
          document.getElementById("c" + i + j).classList.contains("hit") &&
          !submarineSunk
        ) {
          submarineCounter++;
        }
        if (
          document
            .getElementById("c" + i + j)
            .classList.contains("destroyer") &&
          document.getElementById("c" + i + j).classList.contains("hit") &&
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
      shipFound = shipFound - 5;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (battleshipCounter == 4) {
      document.getElementById("BattleshipSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      battleshipSunk = true;
      shipFound = shipFound - 4;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (cruiserCounter == 3) {
      document.getElementById("CruiserSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      cruiserSunk = true;
      shipFound = shipFound - 3;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (submarineCounter == 3) {
      document.getElementById("SubmarineSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      submarineSunk = true;
      shipFound = shipFound - 3;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
    if (destroyerCounter == 2) {
      document.getElementById("DestroyerSunk_cpu").innerHTML +=
        ' <span class="sunkText"> Sunk!</span>';
      destroyerSunk = true;
      shipFound = shipFound - 2;
      shipDirection = "";
      firstTimeIn = true;
      testvalue = 0;
    }
  };

  var allShips = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
  var placeShipSetup = function() {
    for (ship of allShips) {
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

  for (i = 0; i < cols; i++) {
    gameBoard.push([]);
    for (j = 0; j < rows; j++) {
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

  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      document.getElementById("c" + i + j).style.background = "#80aaff";
      document
        .getElementById("c" + i + j)
        .addEventListener("mouseover", highlight);
      document
        .getElementById("c" + i + j)
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
      document.getElementById("losstext").style.display = "block";
      // document.getElementById("compfr").removeEventListener("click", compMove);
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          document
            .getElementById("s" + i + j)
            .removeEventListener("click", compMove);
          if (
            document.getElementById("s" + i + j).classList != "" &&
            !document.getElementById("s" + i + j).classList.contains("hit") &&
            !document.getElementById("s" + i + j).classList.contains("miss") &&
            !document.getElementById("s" + i + j).classList.contains("sunk")
          ) {
            document.getElementById("s" + i + j).style.background = "darkred";
          }
        }
      }
    } else if (shotsFired == totalShots) {
      alert("the computer is out of moves! You win!");
      document.getElementById("compfr").removeEventListener("click", compMove);
    }
  }

  var value = 0;
  var testvalue = 0;

  //I think this function is very close to being good.
  //I am not completely satisfied, but very close.
  var shipFoundAttack = function() {
    var x = lastShotX;
    var y = lastShotY;
    if (value == 0 && shipDirection == "") {
      if (x + 1 > 9) {
        value++;
      } else {
        if (gameBoard[x + 1][y] == 0) {
          document.getElementById("c" + (x + 1) + y).style.background =
            "#4d88ff";
          document.getElementById("c" + (x + 1) + y).classList.add("miss");
          gameBoard[x + 1][y] = 3;
          shotsFired++;
          value++;
          return;
        } else if (gameBoard[x + 1][y] == 1) {
          document.getElementById("c" + (x + 1) + y).style.background = "red";
          document.getElementById("c" + (x + 1) + y).classList.add("hit");
          gameBoard[x + 1][y] = 2;
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
    }
    if (value == 1 && shipDirection == "") {
      if (x - 1 < 0) {
        value++;
      } else {
        if (gameBoard[x - 1][y] == 0) {
          document.getElementById("c" + (x - 1) + y).style.background =
            "#4d88ff";
          document.getElementById("c" + (x - 1) + y).classList.add("miss");
          gameBoard[x - 1][y] = 3;
          shotsFired++;
          value++;
          return;
        } else if (gameBoard[x - 1][y] == 1) {
          document.getElementById("c" + (x - 1) + y).style.background = "red";
          document.getElementById("c" + (x - 1) + y).classList.add("hit");
          gameBoard[x - 1][y] = 2;
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
    }
    if (value == 2 && shipDirection == "") {
      if (y + 1 > 9) {
        value++;
      } else {
        if (gameBoard[x][y + 1] == 0) {
          document.getElementById("c" + x + (y + 1)).style.background =
            "#4d88ff";
          document.getElementById("c" + x + (y + 1)).classList.add("miss");
          gameBoard[x][y + 1] = 3;
          shotsFired++;
          value++;
          return;
        } else if (gameBoard[x][y + 1] == 1) {
          document.getElementById("c" + x + (y + 1)).style.background = "red";
          document.getElementById("c" + x + (y + 1)).classList.add("hit");
          gameBoard[x][y + 1] = 2;
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
    }
    if (value == 3 && shipDirection == "") {
      if (gameBoard[x][y - 1] == 0) {
        document.getElementById("c" + x + (y - 1)).style.background = "#4d88ff";
        document.getElementById("c" + x + (y - 1)).classList.add("miss");
        gameBoard[x][y - 1] = 3;
        shotsFired++;
        value++;
        return;
      } else if (gameBoard[x][y - 1] == 1) {
        document.getElementById("c" + x + (y - 1)).style.background = "red";
        document.getElementById("c" + x + (y - 1)).classList.add("hit");
        gameBoard[x][y - 1] = 2;
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
      if (gameBoard[x + 1][y] == 0) {
        document.getElementById("c" + (x + 1) + y).style.background = "#4d88ff";
        document.getElementById("c" + (x + 1) + y).classList.add("miss");
        gameBoard[x + 1][y] = 3;
        shotsFired++;
        value++;
        return;
      } else if (gameBoard[x + 1][y] == 1) {
        document.getElementById("c" + (x + 1) + y).style.background = "red";
        document.getElementById("c" + (x + 1) + y).classList.add("hit");
        gameBoard[x + 1][y] = 2;
        shotsFired++;
        shipFound++;
        shipDirection = "ver";
        value = 0;
        lastShotX++;
        return;
      } else if (
        gameBoard[x + 1][y] == 2 ||
        gameBoard[x + 1][y] == 3 ||
        x + 1 > 9
      ) {
        if (firstTimeIn) {
          testvalue = shipFound + testvalue;
          firstTimeIn = false;
        }
        if (gameBoard[x - testvalue][y] == 0) {
          document.getElementById("c" + (x - testvalue) + y).style.background =
            "#4d88ff";
          document
            .getElementById("c" + (x - testvalue) + y)
            .classList.add("miss");
          gameBoard[x - testvalue][y] = 3;
          shotsFired++;
          value++;
          return;
        } else if (gameBoard[x - testvalue][y] == 1) {
          document.getElementById("c" + (x - testvalue) + y).style.background =
            "red";
          document
            .getElementById("c" + (x - testvalue) + y)
            .classList.add("hit");
          gameBoard[x - testvalue][y] = 2;
          shotsFired++;
          shipFound++;
          shipDirection = "ver";
          value = 0;
          lastShotX--;
          return;
        }
      }
    }
    if (shipDirection == "hor") {
      if (gameBoard[x][y + 1] == 0) {
        document.getElementById("c" + x + (y + 1)).style.background = "#4d88ff";
        document.getElementById("c" + x + (y + 1)).classList.add("miss");
        gameBoard[x][y + 1] = 3;
        shotsFired++;
        value++;
        return;
      } else if (gameBoard[x][y + 1] == 1) {
        document.getElementById("c" + x + (y + 1)).style.background = "red";
        document.getElementById("c" + x + (y + 1)).classList.add("hit");
        gameBoard[x][y + 1] = 2;
        shotsFired++;
        shipFound++;
        shipDirection = "hor";
        value = 0;
        lastShotY++;
        return;
      } else if (
        gameBoard[x][y + 1] == 2 ||
        gameBoard[x][y + 1] == 3 ||
        y + 1 > 9
      ) {
        if (firstTimeIn) {
          testvalue = shipFound + testvalue;
          firstTimeIn = false;
        }
        if (gameBoard[x][y - testvalue] == 0) {
          document.getElementById("c" + x + (y - testvalue)).style.background =
            "#4d88ff";
          document
            .getElementById("c" + x + (y - testvalue))
            .classList.add("miss");
          gameBoard[x][y - testvalue] = 3;
          shotsFired++;
          value++;
          return;
        } else if (gameBoard[x][y - testvalue] == 1) {
          document.getElementById("c" + x + (y - testvalue)).style.background =
            "red";
          document
            .getElementById("c" + x + (y - testvalue))
            .classList.add("hit");
          gameBoard[x][y - testvalue] = 2;
          shotsFired++;
          shipFound++;
          shipDirection = "hor";
          value = 0;
          lastShotY--;
          return;
        }
      }
    }
  };

  var randomShot = function() {
    //This code actually works quite well.
    var x;
    var y;
    do {
      x = randomIntFromInterval(0, 9);
      y = randomIntFromInterval(0, 9);
    } while ((x % 2 != 0 && y % 2 == 0) || (x % 2 == 0 && y % 2 != 0));
    lastShotX = x;
    lastShotY = y;
    if (gameBoard[x][y] == 0) {
      document.getElementById("c" + x + y).style.background = "#4d88ff";
      document.getElementById("c" + x + y).classList.add("miss");
      gameBoard[x][y] = 3;
      shotsFired++;
    } else if (gameBoard[x][y] == 1) {
      document.getElementById("c" + x + y).style.background = "red";
      document.getElementById("c" + x + y).classList.add("hit");
      gameBoard[x][y] = 2;
      shotsFired++;
      shipFound++;
    } else if (gameBoard[x][y] == 2) {
      randomShot();
    } else if (gameBoard[x][y] == 3) {
      randomShot();
    }
  };

  var compMove = function() {
    console.log(this.id);
    if (
      document.getElementById("wintext").style.display == "block" ||
      document.getElementById("losstext").style.display == "block" ||
      this.style.background == "rgb(77, 136, 255)"
    ) {
      return;
    }
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
  // document.getElementById("compfr").addEventListener("click", compMove);
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      document.getElementById("s" + i + j).addEventListener("click", compMove);
    }
  }
})();
