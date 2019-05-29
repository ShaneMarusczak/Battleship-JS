(function() {
  const rows = 10;
  const cols = 10;
  const squareSize = 50;
  const winningHitCount = 17;
  var gameBoard = [];
  var gameBoardContainer = document.getElementById("gameboard");
  var strtOvrBtn = document.getElementById("strtOvrBtn");
  var hitCount = 0;
  var ships = [];

  gameBoardContainer.addEventListener("click", fireTorpedo, false);
  strtOvrBtn.addEventListener("click", function() {
    location.reload();
  });

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

  function fireTorpedo(e) {
    if (
      document.getElementById("ready").style.display != "block" ||
      document.getElementById("losstext").style.display == "block"
    ) {
      return;
    }

    var shipSunkCounter = 0;

    if (e.target !== e.currentTarget) {
      var row = e.target.id.substring(1, 2);
      var col = e.target.id.substring(2, 3);

      if (gameBoard[row][col] == 0) {
        e.target.style.background = "#4d88ff";
        gameBoard[row][col] = 3;
        document.getElementById("s" + row + col).classList.add("miss");
      } else if (gameBoard[row][col] == 1) {
        e.target.style.background = "red";
        gameBoard[row][col] = 2;
        document.getElementById("s" + row + col).classList.add("hit");
        hitCount++;

        for (ship of ships) {
          for (coor of ship) {
            if (coor[0] == row && coor[1] == col) {
              for (coor of ship) {
                if (gameBoard[coor[0]][coor[1]] == 2) {
                  shipSunkCounter++;
                }
                if (shipSunkCounter == ship.length) {
                  for (coor of ship) {
                    document.getElementById(
                      "s" + coor[0] + coor[1]
                    ).style.background = "black";
                  }
                  document.getElementById(
                    document.getElementById("s" + coor[0] + coor[1]).className +
                      "Sunk"
                  ).innerHTML += ' <span class="sunkText"> Sunk!</span>';
                }
              }
            }
          }
        }

        if (hitCount == winningHitCount) {
          document.getElementById("wintext").style.display = "block";
          gameBoardContainer.removeEventListener("click", fireTorpedo);
        }
      } else if (gameBoard[row][col] > 1) {
        alert("Already Fired Here!");
      }
    }
    e.stopPropagation();
  }

  var nameIndex = 0;
  var names = ["Carrier", "Battleship", "Cruiser", "Submarine", "Destroyer"];

  function placeShip(len) {
    var ship = [];
    var name = names[nameIndex];
    var dir = randomIntFromInterval(1, 2);
    var row = randomIntFromInterval(0, 9);
    var col = randomIntFromInterval(0, 9);
    var shipPlaceCounter = 0;
    if (dir == 1) {
      if (col >= len - 1) {
        for (i = 0; i < len; i++) {
          if (gameBoard[row][col - i] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row][col - i] = 1;
            document.getElementById("s" + row + (col - i)).classList.add(name);
            ship.push([row, col - i]);
          }
        } else {
          placeShip(len);
        }
      } else {
        for (i = 0; i < len; i++) {
          if (gameBoard[row][col + i] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row][col + i] = 1;
            document.getElementById("s" + row + (col + i)).classList.add(name);
            ship.push([row, col + i]);
          }
        } else {
          placeShip(len);
        }
      }
    } else {
      if (row >= len - 1) {
        for (i = 0; i < len; i++) {
          if (gameBoard[row - i][col] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row - i][col] = 1;
            document.getElementById("s" + (row - i) + col).classList.add(name);
            ship.push([row - i, col]);
          }
        } else {
          placeShip(len);
        }
      } else {
        for (i = 0; i < len; i++) {
          if (gameBoard[row + i][col] == 0) {
            shipPlaceCounter++;
          }
        }
        if (shipPlaceCounter == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row + i][col] = 1;
            document.getElementById("s" + (row + i) + col).classList.add(name);
            ship.push([row + i, col]);
          }
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

  placeShip(5);
  placeShip(4);
  placeShip(3);
  placeShip(3);
  placeShip(2);

  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      document.getElementById("s" + i + j).style.background = "#80aaff";
      if (gameBoard[i][j] == 1) {
        // document.getElementById("s" + i + j).style.background = "white";
      }
    }
  }
})();
