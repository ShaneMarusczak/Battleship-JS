(function() {
  const rows = 10;
  const cols = 10;
  const squareSize = 50;
  const winningHitCount = 17;
  const totalShots = 40;
  var counter = 0;
  var gameBoard = [];
  var gameBoardContainer = document.getElementById("gameboard");
  var strtOvrBtn = document.getElementById("strtOvrBtn");
  var hitCount = 0;
  var ships = [];
  var shotsTaken = 0;

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
  document.getElementById("shots").innerHTML = shotsTaken;
  document.getElementById("shotsleft").innerHTML = totalShots - shotsTaken;

  function fireTorpedo(e) {
    shotsTaken++;

    var test = 0;

    if (e.target !== e.currentTarget) {
      var row = e.target.id.substring(1, 2);
      var col = e.target.id.substring(2, 3);

      if (gameBoard[row][col] == 0) {
        e.target.style.background = "#4d88ff";
        gameBoard[row][col] = 3;
      } else if (gameBoard[row][col] == 1) {
        e.target.style.background = "red";
        gameBoard[row][col] = 2;

        hitCount++;

        for (ship of ships) {
          for (coor of ship) {
            if (coor[0] == row && coor[1] == col) {
              for (coor of ship) {
                if (gameBoard[coor[0]][coor[1]] == 2) {
                  test++;
                }
                if (test == ship.length) {
                  for (coor of ship) {
                    document.getElementById(
                      "s" + coor[0] + coor[1]
                    ).style.background = "black";
                  }
                  document.getElementById(
                    document.getElementById("s" + coor[0] + coor[1]).className +
                      "Sunk"
                  ).innerHTML = document.getElementById(
                    "s" + coor[0] + coor[1]
                  ).className;
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
        counter--;
        shotsTaken--;
      }
    }
    document.getElementById("shots").innerHTML = shotsTaken;
    document.getElementById("shotsleft").innerHTML = totalShots - shotsTaken;

    counter++;
    if (counter == totalShots && hitCount != winningHitCount) {
      // alert("You are out of shots, the enemy fleet wins!");
      document.getElementById("losstext").style.display = "block";
      gameBoardContainer.removeEventListener("click", fireTorpedo);
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          if (gameBoard[i][j] == 1) {
            document.getElementById("s" + i + j).style.background = "darkred";
          }
        }
      }
    }
    e.stopPropagation();
  }

  function setTag(i, j, k) {
    var element = document.getElementById("s" + i + j);
    element.classList.add(k);
  }

  var num = 0;
  var nams = ["Carrier", "Battleship", "Cruiser", "Submarine", "Destroyer"];

  function placeShip(len) {
    var ship = [];
    var nam = nams[num];
    var dir = randomIntFromInterval(1, 2);
    var row = randomIntFromInterval(0, 9);
    var col = randomIntFromInterval(0, 9);
    var counter_2 = 0;
    if (dir == 1) {
      if (col >= len - 1) {
        for (i = 0; i < len; i++) {
          if (gameBoard[row][col - i] == 0) {
            counter_2++;
          }
        }

        if (counter_2 == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row][col - i] = 1;
            setTag(row, col - i, nam);
            ship.push([row, col - i]);
          }
        } else {
          placeShip(len);
        }
      } else {
        for (i = 0; i < len; i++) {
          if (gameBoard[row][col + i] == 0) {
            counter_2++;
          }
        }
        if (counter_2 == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row][col + i] = 1;
            setTag(row, col + i, nam);
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
            counter_2++;
          }
        }
        if (counter_2 == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row - i][col] = 1;
            setTag(row - i, col, nam);
            ship.push([row - i, col]);
          }
        } else {
          placeShip(len);
        }
      } else {
        for (i = 0; i < len; i++) {
          if (gameBoard[row + i][col] == 0) {
            counter_2++;
          }
        }
        if (counter_2 == len) {
          for (i = 0; i < len; i++) {
            gameBoard[row + i][col] = 1;
            setTag(row + i, col, nam);
            ship.push([row + i, col]);
          }
        } else {
          placeShip(len);
        }
      }
    }
    if (ship.length != 0) {
      ships.push(ship);
      num++;
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
  var checker = 0;
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      document.getElementById("s" + i + j).style.background = "#80aaff";
      if (gameBoard[i][j] == 1) {
        checker++;
        // document.getElementById("s" + i + j).style.background = "white";
      }
    }
  }
  // console.log(ships);
  // console.log(checker);

  // console.log(gameBoard);
})();
