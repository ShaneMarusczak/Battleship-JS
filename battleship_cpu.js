/*eslint-disable prefer-destructuring */
/*eslint-disable no-tabs */
/* eslint-disable spaced-comment */
/* eslint-disable multiline-comment-style */
/* eslint-disable arrow-parens */
/*eslint-disable no-console */
/*eslint-disable no-redeclare */
/*
 * This code is under a lot of development.
 * There is a lot of refactoring and clean up that needs to be done.
 * When I am satisfied it is working correctly I will perform a major cleanup.
 */
"use strict";
(function () {
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
	var lastShotX;
	var lastShotY;
	var ships = [carrier, battleship, cruiser, submarine, destroyer];
	var shipDirection = "";
	var scanCounter = 0;
	var direction = "hor";
	var gameOver = false;
	var probabilityChart = [];

	var shipSunkHelper = function (num, sunkShipName) {
		document.getElementById(sunkShipName + "Sunk_cpu").classList.add("inline");
		sunkColorChange(sunkShipName);
		shipFound = shipFound - num;
		shipDirection = "";
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				if (gameBoard[i][j][1] == sunkShipName) {
					gameBoard[i][j][0] = 4;
				}
			}
		}
		shipHitButNotSunkReassign();
	};

	var rotateShip = function () {
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

	var rotatedHighlight = function () {
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

	var highlight = function () {
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

	var resetColor = function () {
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				if (gameBoard[i][j][0] == 0) {
					document.getElementById("c" + i + j).style.background = "#80aaff";
				}
			}
		}
	};

	var placeShip = function () {
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
						document.getElementById("c" + i + j).style.background == "black" &&
						gameBoard[i][j][1] == ""
					) {
						if (size == 5) {
							gameBoard[i][j][1] = "carrier";
						} else if (size == 4) {
							gameBoard[i][j][1] = "battleship";
						} else if (size == 3 && placed == "cruiser") {
							gameBoard[i][j][1] = "cruiser";
						} else if (size == 3 && placed == "submarine") {
							gameBoard[i][j][1] = "submarine";
						} else if (size == 2) {
							gameBoard[i][j][1] = "destroyer";
						}
						document
							.getElementById("c" + i + j)
							.removeEventListener("mouseover", highlight);
						gameBoard[i][j][0] = 1;
						ship.push([i, j]);
					}
				}
			}
			if (size == 5) {
				placedCarrier = true;
				shipsPlaced++;
				document.getElementById("carrier").classList.add("notDisplayed");
			} else if (size == 4) {
				placedBattleship = true;
				shipsPlaced++;
				document.getElementById("battleship").classList.add("notDisplayed");
			} else if (size == 3) {
				if (placed == "cruiser") {
					placedCruiser = true;
					shipsPlaced++;
					document.getElementById("cruiser").classList.add("notDisplayed");
				} else if (placed == "submarine") {
					placedSubmarine = true;
					shipsPlaced++;
					document.getElementById("submarine").classList.add("notDisplayed");
				}
			} else if (size == 2) {
				placedDetroyer = true;
				shipsPlaced++;
				document.getElementById("destroyer").classList.add("notDisplayed");
			}
			if (shipsPlaced == 5) {
				document.getElementById("instructions").classList.add("notDisplayed");
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
			}
			size = 0;
			placedShips.push(ship);
		}
	};

	var shipSunkChecker = function () {
		var carrierCounter = 0;
		var battleshipCounter = 0;
		var cruiserCounter = 0;
		var submarineCounter = 0;
		var destroyerCounter = 0;
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				if (
					gameBoard[i][j][1] == "carrier" &&
					gameBoard[i][j][0] == 2 &&
					!carrierSunk
				) {
					carrierCounter++;
				}
				if (
					gameBoard[i][j][1] == "battleship" &&
					gameBoard[i][j][0] == 2 &&
					!battleshipSunk
				) {
					battleshipCounter++;
				}
				if (
					gameBoard[i][j][1] == "cruiser" &&
					gameBoard[i][j][0] == 2 &&
					!cruiserSunk
				) {
					cruiserCounter++;
				}
				if (
					gameBoard[i][j][1] == "submarine" &&
					gameBoard[i][j][0] == 2 &&
					!submarineSunk
				) {
					submarineCounter++;
				}
				if (
					gameBoard[i][j][1] == "destroyer" &&
					gameBoard[i][j][0] == 2 &&
					!destroyerSunk
				) {
					destroyerCounter++;
				}
			}
		}
		if (carrierCounter == 5) {
			carrierSunk = true;
			shipSunkHelper(5, "carrier");
		}
		if (battleshipCounter == 4) {
			battleshipSunk = true;
			shipSunkHelper(4, "battleship");
		}
		if (cruiserCounter == 3) {
			cruiserSunk = true;
			shipSunkHelper(3, "cruiser");
		}
		if (submarineCounter == 3) {
			submarineSunk = true;
			shipSunkHelper(3, "submarine");
		}
		if (destroyerCounter == 2) {
			destroyerSunk = true;
			shipSunkHelper(2, "destroyer");
		}
	};

	var allShips = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
	var placeShipSetup = function () {
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
			gameBoard[i].push([0, ""]);
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

	document.getElementById("strtOvrBtn").addEventListener("click", function () {
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
			gameOver = true;
			for (var i = 0; i < cols; i++) {
				for (var j = 0; j < rows; j++) {
					document
						.getElementById("s" + i + j)
						.removeEventListener("click", compMove);
					if (
						document.getElementById("s" + i + j).classList.contains("ship") &&
						!document.getElementById("s" + i + j).classList.contains("hit") &&
						!document.getElementById("s" + i + j).classList.contains("miss")
					) {
						document.getElementById("s" + i + j).style.background = "black";
					}
				}
			}
		}
	}

	var shipFoundAttack = function () {
		var x = lastShotX;
		var y = lastShotY;
		if (shipDirection == "ver") {
			if (!(x + 1 > 9)) {
				if (gameBoard[x + 1][y][0] == 0) {
					document.getElementById("c" + (x + 1) + y).style.background =
						"#4d88ff";
					gameBoard[x + 1][y][0] = 3;
					return;
				} else if (gameBoard[x + 1][y][0] == 1) {
					document.getElementById("c" + (x + 1) + y).style.background = "red";
					gameBoard[x + 1][y][0] = 2;
					shipFound++;
					lastShotX++;
					return;
				}
			}
			if (
				x + 1 > 9 ||
				gameBoard[x + 1][y][0] == 2 ||
				gameBoard[x + 1][y][0] == 3 ||
				gameBoard[x + 1][y][0] == 4
			) {
				for (var i = 1; i < 10; i++) {
					if (x - i < 0) {
						break;
					} else if (gameBoard[x - i][y][0] == 0) {
						document.getElementById("c" + (x - i) + y).style.background =
							"#4d88ff";
						gameBoard[x - i][y][0] = 3;
						return;
					} else if (gameBoard[x - i][y][0] == 1) {
						document.getElementById("c" + (x - i) + y).style.background = "red";
						gameBoard[x - i][y][0] = 2;
						shipFound++;
						return;
					}
				}
				scanCounter = 0;
				shipDirection = "";
			}
		}
		if (shipDirection == "hor") {
			if (!(y + 1 > 9)) {
				if (gameBoard[x][y + 1][0] == 0) {
					document.getElementById("c" + x + (y + 1)).style.background =
						"#4d88ff";
					gameBoard[x][y + 1][0] = 3;
					return;
				} else if (gameBoard[x][y + 1][0] == 1) {
					document.getElementById("c" + x + (y + 1)).style.background = "red";
					gameBoard[x][y + 1][0] = 2;
					shipFound++;
					lastShotY++;
					return;
				}
			}
			if (
				y + 1 > 9 ||
				gameBoard[x][y + 1][0] == 2 ||
				gameBoard[x][y + 1][0] == 3 ||
				gameBoard[x][y + 1][0] == 4
			) {
				for (var i = 1; i < 10; i++) {
					if (y - i < 0) {
						break;
					} else if (gameBoard[x][y - i][0] == 0) {
						document.getElementById("c" + x + (y - i)).style.background =
							"#4d88ff";
						gameBoard[x][y - i][0] = 3;
						return;
					} else if (gameBoard[x][y - i][0] == 1) {
						document.getElementById("c" + x + (y - i)).style.background = "red";
						gameBoard[x][y - i][0] = 2;
						shipFound++;
						return;
					}
				}
				scanCounter = 0;
				shipDirection = "";
			}
		}
		if (scanCounter == 0 && shipDirection == "") {
			if (x + 1 > 9) {
				scanCounter++;
			} else {
				if (gameBoard[x + 1][y][0] == 0) {
					document.getElementById("c" + (x + 1) + y).style.background =
						"#4d88ff";
					gameBoard[x + 1][y][0] = 3;
					scanCounter++;
					return;
				} else if (gameBoard[x + 1][y][0] == 1) {
					document.getElementById("c" + (x + 1) + y).style.background = "red";
					gameBoard[x + 1][y][0] = 2;
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
				if (gameBoard[x - 1][y][0] == 0) {
					document.getElementById("c" + (x - 1) + y).style.background =
						"#4d88ff";
					gameBoard[x - 1][y][0] = 3;
					scanCounter++;
					return;
				} else if (gameBoard[x - 1][y][0] == 1) {
					document.getElementById("c" + (x - 1) + y).style.background = "red";
					gameBoard[x - 1][y][0] = 2;
					shipFound++;
					shipDirection = "ver";
					scanCounter = 0;
					lastShotX--;
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
				if (gameBoard[x][y + 1][0] == 0) {
					document.getElementById("c" + x + (y + 1)).style.background =
						"#4d88ff";
					gameBoard[x][y + 1][0] = 3;
					scanCounter++;
					return;
				} else if (gameBoard[x][y + 1][0] == 1) {
					document.getElementById("c" + x + (y + 1)).style.background = "red";
					gameBoard[x][y + 1][0] = 2;
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
			if (gameBoard[x][y - 1][0] == 0) {
				document.getElementById("c" + x + (y - 1)).style.background = "#4d88ff";
				gameBoard[x][y - 1][0] = 3;
				scanCounter++;
				return;
			} else if (gameBoard[x][y - 1][0] == 1) {
				document.getElementById("c" + x + (y - 1)).style.background = "red";
				gameBoard[x][y - 1][0] = 2;
				shipFound++;
				shipDirection = "hor";
				scanCounter = 0;
				lastShotY--;
				return;
			}
		}
	};

	var searchingShot = function () {
		var x;
		var y;
		var location = probabilityCalculator();
		x = location[0];
		y = location[1];
		resetProbabilityChart();
		lastShotX = x;
		lastShotY = y;
		if (gameBoard[x][y][0] == 0) {
			document.getElementById("c" + x + y).style.background = "#4d88ff";
			gameBoard[x][y][0] = 3;
		} else if (gameBoard[x][y][0] == 1) {
			document.getElementById("c" + x + y).style.background = "red";
			gameBoard[x][y][0] = 2;
			shipFound++;
		} else if (
			gameBoard[x][y][0] == 2 ||
			gameBoard[x][y][0] == 3 ||
			gameBoard[x][y][0] == 4
		) {
			searchingShot();
		}
	};

	var compMove = function () {
		if (
			document.getElementById("wintext").style.display == "block" ||
			gameOver == true ||
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

	var shipHitButNotSunkReassign = function () {
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				if (gameBoard[i][j][0] == 2) {
					lastShotX = i;
					lastShotY = j;
					return;
				}
			}
		}
	};

	var sunkColorChange = function (shipName) {
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				if (gameBoard[i][j][1] == shipName && gameBoard[i][j][0] == 2) {
					document.getElementById("c" + i + j).style.background = "darkred";
				}
			}
		}
	};

	var probabilityCalculator = function () {
		var longestLength;
		var counter = 0;
		if (!carrierSunk) {
			longestLength = 5;
		} else if (!battleshipSunk) {
			longestLength = 4;
		} else if (!submarineSunk || !cruiserSunk) {
			longestLength = 3;
		} else {
			longestLength = 2;
		}
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < rows - longestLength + 1; j++) {
				for (var k = 0; k < longestLength; k++) {
					if (gameBoard[i][j + k][0] !== 2 && gameBoard[i][j + k][0] !== 3 && gameBoard[i][j + k][0] !== 4) {
						counter++;
					}
				}
				if (counter === longestLength) {
					for (var k = 0; k < longestLength; k++) {
						probabilityChart[i][j + k]++;
					}
				}
				counter = 0;
			}
		}
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < cols - longestLength + 1; j++) {
				for (var k = 0; k < longestLength; k++) {
					if (gameBoard[j + k][i][0] !== 2 && gameBoard[j + k][i][0] !== 3 && gameBoard[j + k][i][0] !== 4) {
						counter++;
					}
				}
				if (counter === longestLength) {
					for (var k = 0; k < longestLength; k++) {
						probabilityChart[j + k][i]++;
					}
				}
				counter = 0;
			}
		}
		var currentMax = 0;
		var x;
		var y;
		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				if (probabilityChart[i][j] > currentMax) {
					currentMax = probabilityChart[i][j];
					x = i;
					y = j;
				}
			}
		}
		return [x, y];
	};

	var resetProbabilityChart = function () {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				probabilityChart[i][j] = 0;
			}
		}
	};

	for (var i = 0; i < cols; i++) {
		probabilityChart.push([]);
		for (var j = 0; j < rows; j++) {
			probabilityChart[i].push(0);
			document.getElementById("s" + i + j).addEventListener("click", compMove);
		}
	}

	document.addEventListener("keydown", function (event) {
		if (event.keyCode == 192) {
			console.log(gameBoard);
		}
	});
})();
