"use strict";
/*eslint-disable no-implicit-globals */
/*eslint-disable no-console */
//eslint-disable-next-line no-unused-vars
var compMoveWindow;
(function () {
	const rows = 10;
	const cols = 10;
	const cellSize = 50;
	let shipFound = 0;
	let shipsPlaced = 0;
	let size;
	const gameBoard = [];
	let allShipsPlaced = false;
	let placedCarrier = false;
	let placedBattleship = false;
	let placedCruiser = false;
	let placedSubmarine = false;
	let placedDetroyer = false;
	let carrierSunk = false;
	let battleshipSunk = false;
	let cruiserSunk = false;
	let submarineSunk = false;
	let destroyerSunk = false;
	const gameBoardContainer = document.getElementById("gameboard_cpu");
	const carrier = document.getElementById("carrier");
	const battleship = document.getElementById("battleship");
	const cruiser = document.getElementById("cruiser");
	const submarine = document.getElementById("submarine");
	const destroyer = document.getElementById("destroyer");
	const sunkSound = new Audio("Ship Sunk Sound.mp3");
	let placed;
	const placedShips = [];
	let lastShotX;
	let lastShotY;
	const ships = [carrier, battleship, cruiser, submarine, destroyer];
	let shipDirection = "";
	let scanCounter = 0;
	let direction = "hor";
	let gameOver = false;
	const probabilityChart = [];
	let shotsfired = 0;
	const sunkPhrases = [
						"I am winning!", "That was easy!", "Found You!", "You're Sunk!", "Down she goes!", "Gotcha!", "Success!", "Ha Ha!", "Easy Spot!",
						"I'm Better!", "I'm gonna win!", "Easy!", "Sink that ship!", "Boom!"
					];

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

	const alertModalControl = (message, duration) => {
		document.getElementById("alertshader").style.display = "block";
		document.getElementById("alertmessage").innerText = message;
		sleep(duration).then(() => {
			document.getElementById("alertshader").style.display = "none";
		});
	};

	//inclusive
	const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

	const shipSunkHelper = function (num, sunkShipName) {
		document.getElementById(sunkShipName + "Sunk_cpu").classList.add("inline");
		sunkColorChange(sunkShipName);
		shipFound = shipFound - num;
		shipDirection = "";
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (gameBoard[i][j][1] == sunkShipName) {
					gameBoard[i][j][0] = 4;
				}
			}
		}
		if (randomIntFromInterval(0, 10) === 0) {
			alertModalControl(capitalizeFirst(sunkShipName) + " Sunk!", 1500);
		} else {
			alertModalControl(sunkPhrases[randomIntFromInterval(0, sunkPhrases.length - 1)], 1500);
		}
		shipHitButNotSunkReassign();
	};

	const rotateShip = function () {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
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

	const rotatedHighlight = function () {
		if (Number(this.id[1]) < rows + 1 - size) {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document
						.getElementById("c" + i + j)
						.addEventListener("click", placeShip);
				}
			}
			for (let i = 0; i < size; i++) {
				document.getElementById(
					this.id[0] + (Number(this.id[1]) + i) + this.id[2]
				).style.background = "black";
			}
		} else {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document
						.getElementById("c" + i + j)
						.removeEventListener("click", placeShip);
				}
			}
		}
	};

	const highlight = function () {
		if (Number(this.id[2]) < cols + 1 - size) {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document
						.getElementById("c" + i + j)
						.addEventListener("click", placeShip);
				}
			}
			for (let i = 0; i < size; i++) {
				document.getElementById(
					this.id[0] + this.id[1] + (Number(this.id[2]) + i)
				).style.background = "black";
			}
		} else {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document
						.getElementById("c" + i + j)
						.removeEventListener("click", placeShip);
				}
			}
		}
	};

	const resetColor = function () {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (gameBoard[i][j][0] == 0) {
					document.getElementById("c" + i + j).style.background = "#80aaff";
				}
			}
		}
	};

	const placeShip = function () {
		if (allShipsPlaced) {
			return;
		}
		const ship = [];
		let canPlace = true;
		const x = Number(this.id[1]);
		const y = Number(this.id[2]);

		for (const placedShip of placedShips) {
			for (const coor of placedShip) {
				if (direction == "hor") {
					for (let i = 0; i < size; i++) {
						if (x == coor[0] && y + i == coor[1]) {
							canPlace = false;
						}
					}
				} else {
					for (let i = 0; i < size; i++) {
						if (x + i == coor[0] && y == coor[1]) {
							canPlace = false;
						}
					}
				}
			}
		}
		if (!canPlace) {
			alertModalControl("Can't place here!", 1400);
		}
		if (canPlace) {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
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
				alertModalControl("All ships Placed!", 1400);
				document.getElementById("ready").style.display = "block";
				allShipsPlaced = true;
				for (let i = 0; i < cols; i++) {
					for (let j = 0; j < rows; j++) {
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

	const shipSunkChecker = function () {
		let carrierCounter = 0;
		let battleshipCounter = 0;
		let cruiserCounter = 0;
		let submarineCounter = 0;
		let destroyerCounter = 0;
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (
					gameBoard[i][j][1] == "carrier" &&
					gameBoard[i][j][0] == 2 &&
					!carrierSunk
				) {
					carrierCounter++;
				} else if (
					gameBoard[i][j][1] == "battleship" &&
					gameBoard[i][j][0] == 2 &&
					!battleshipSunk
				) {
					battleshipCounter++;
				} else if (
					gameBoard[i][j][1] == "cruiser" &&
					gameBoard[i][j][0] == 2 &&
					!cruiserSunk
				) {
					cruiserCounter++;
				} else if (
					gameBoard[i][j][1] == "submarine" &&
					gameBoard[i][j][0] == 2 &&
					!submarineSunk
				) {
					submarineCounter++;
				} else if (
					gameBoard[i][j][1] == "destroyer" &&
					gameBoard[i][j][0] == 2 &&
					!destroyerSunk
				) {
					destroyerCounter++;
				}
			}
		}
		if (carrierCounter == 5) {
			sunkSound.play();
			carrierSunk = true;
			shipSunkHelper(5, "carrier");
		}
		if (battleshipCounter == 4) {
			sunkSound.play();
			battleshipSunk = true;
			shipSunkHelper(4, "battleship");
		}
		if (cruiserCounter == 3) {
			sunkSound.play();
			cruiserSunk = true;
			shipSunkHelper(3, "cruiser");
		}
		if (submarineCounter == 3) {
			sunkSound.play();
			submarineSunk = true;
			shipSunkHelper(3, "submarine");
		}
		if (destroyerCounter == 2) {
			sunkSound.play();
			destroyerSunk = true;
			shipSunkHelper(2, "destroyer");
		}
	};

	const allShips = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
	const placeShipSetup = function () {
		for (const ship of allShips) {
			if (this.id != ship) {
				document.getElementById(ship).classList.remove("clicked");
			}
		}
		if (document.getElementById(this.id).classList.contains("clicked")) {
			document.getElementById(this.id).classList.remove("clicked");
			size = 0;
			return;
		}
		if (this.id === "carrier" && !placedCarrier) {
			size = 5;
			this.classList.add("clicked");
		} else if (this.id === "battleship" && !placedBattleship) {
			size = 4;
			this.classList.add("clicked");
		} else if (this.id === "cruiser" && !placedCruiser) {
			size = 3;
			this.classList.add("clicked");
			placed = "cruiser";
		} else if (this.id === "submarine" && !placedSubmarine) {
			size = 3;
			this.classList.add("clicked");
			placed = "submarine";
		} else if (this.id === "destroyer" && !placedDetroyer) {
			size = 2;
			this.classList.add("clicked");
		}
	};

	for (let i = 0; i < cols; i++) {
		gameBoard.push([]);
		for (let j = 0; j < rows; j++) {
			gameBoard[i].push([0, ""]);
			const cell = document.createElement("div");
			gameBoardContainer.appendChild(cell);
			cell.id = "c" + j + i;
			const topPosition = j * cellSize + 5;
			const leftPosition = i * cellSize + 5;
			cell.style.top = topPosition + "px";
			cell.style.left = leftPosition + "px";
		}
	}

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			document.getElementById("c" + i + j).style.background = "#80aaff";
			document
				.getElementById("c" + i + j)
				.addEventListener("mouseover", highlight);
			document
				.getElementById("c" + i + j)
				.addEventListener("mouseleave", resetColor);
		}
	}

	for (const ship of ships) {
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
			gameOverColorChange();
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document
						.getElementById("s" + i + j)
						.removeEventListener("click", compMove);
				}
			}
		}
	}

	const shipFoundAttack = function () {
		const x = lastShotX;
		const y = lastShotY;
		if (shipDirection == "ver") {
			if (!(x + 1 > 9)) {
				if (gameBoard[x + 1][y][0] == 0) {
					document.getElementById("c" + (x + 1) + y).style.background =
						"#4d88ff";
					gameBoard[x + 1][y][0] = 3;
					shotsfired++;
					return;
				} else if (gameBoard[x + 1][y][0] == 1) {
					document.getElementById("c" + (x + 1) + y).style.background = "red";
					gameBoard[x + 1][y][0] = 2;
					shipFound++;
					lastShotX++;
					shotsfired++;
					return;
				}
			}
			if (
				x + 1 > 9 ||
				gameBoard[x + 1][y][0] == 2 ||
				gameBoard[x + 1][y][0] == 3 ||
				gameBoard[x + 1][y][0] == 4
			) {
				for (let i = 1; i < 10; i++) {
					if (x - i < 0 || gameBoard[x - i][y][0] == 3 || gameBoard[x - i][y][0] == 4) {
						break;
					} else if (gameBoard[x - i][y][0] == 0) {
						document.getElementById("c" + (x - i) + y).style.background =
							"#4d88ff";
						gameBoard[x - i][y][0] = 3;
						shotsfired++;
						return;
					} else if (gameBoard[x - i][y][0] == 1) {
						document.getElementById("c" + (x - i) + y).style.background = "red";
						gameBoard[x - i][y][0] = 2;
						shipFound++;
						shotsfired++;
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
					shotsfired++;
					return;
				} else if (gameBoard[x][y + 1][0] == 1) {
					document.getElementById("c" + x + (y + 1)).style.background = "red";
					gameBoard[x][y + 1][0] = 2;
					shipFound++;
					lastShotY++;
					shotsfired++;
					return;
				}
			}
			if (
				y + 1 > 9 ||
				gameBoard[x][y + 1][0] == 2 ||
				gameBoard[x][y + 1][0] == 3 ||
				gameBoard[x][y + 1][0] == 4
			) {
				for (let i = 1; i < 10; i++) {
					if (y - i < 0 || gameBoard[x][y - i][0] === 3 || gameBoard[x][y - i][0] === 4) {
						break;
					} else if (gameBoard[x][y - i][0] == 0) {
						document.getElementById("c" + x + (y - i)).style.background =
							"#4d88ff";
						gameBoard[x][y - i][0] = 3;
						shotsfired++;
						return;
					} else if (gameBoard[x][y - i][0] == 1) {
						document.getElementById("c" + x + (y - i)).style.background = "red";
						gameBoard[x][y - i][0] = 2;
						shipFound++;
						shotsfired++;
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
					shotsfired++;
					return;
				} else if (gameBoard[x + 1][y][0] == 1) {
					document.getElementById("c" + (x + 1) + y).style.background = "red";
					gameBoard[x + 1][y][0] = 2;
					shipFound++;
					shipDirection = "ver";
					scanCounter = 0;
					lastShotX++;
					shotsfired++;
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
					shotsfired++;
					return;
				} else if (gameBoard[x - 1][y][0] == 1) {
					document.getElementById("c" + (x - 1) + y).style.background = "red";
					gameBoard[x - 1][y][0] = 2;
					shipFound++;
					shipDirection = "ver";
					scanCounter = 0;
					lastShotX--;
					shotsfired++;
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
					shotsfired++;
					return;
				} else if (gameBoard[x][y + 1][0] == 1) {
					document.getElementById("c" + x + (y + 1)).style.background = "red";
					gameBoard[x][y + 1][0] = 2;
					shipFound++;
					shipDirection = "hor";
					scanCounter = 0;
					lastShotY++;
					shotsfired++;
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
				shotsfired++;
				return;
			} else if (gameBoard[x][y - 1][0] == 1) {
				document.getElementById("c" + x + (y - 1)).style.background = "red";
				gameBoard[x][y - 1][0] = 2;
				shipFound++;
				shipDirection = "hor";
				scanCounter = 0;
				lastShotY--;
				shotsfired++;
				return;
			}
		}
	};

	const searchingShot = function () {
		let x;
		let y;
		if (shotsfired < 8) {
			do {
				if (shotsfired < 4) {
					x = randomIntFromInterval(2, 7);
					y = randomIntFromInterval(2, 7);
				} else {
					x = randomIntFromInterval(1, 8);
					y = randomIntFromInterval(1, 8);
				}
			} while ((x % 2 != 0 && y % 2 == 0) || (x % 2 == 0 && y % 2 != 0));
		} else {
			[x, y] = probabilityCalculator();
			resetProbabilityChart();
		}
		lastShotX = x;
		lastShotY = y;
		if (gameBoard[x][y][0] == 0) {
			document.getElementById("c" + x + y).style.background = "#4d88ff";
			gameBoard[x][y][0] = 3;
			shotsfired++;
		} else if (gameBoard[x][y][0] == 1) {
			document.getElementById("c" + x + y).style.background = "red";
			gameBoard[x][y][0] = 2;
			shipFound++;
			shotsfired++;
		} else if (
			gameBoard[x][y][0] == 2 ||
			gameBoard[x][y][0] == 3 ||
			gameBoard[x][y][0] == 4
		) {
			searchingShot();
		}
	};

	const compMove = function () {
		if (
			document.getElementById("wintext").style.display == "block" ||
			gameOver == true
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
			alertModalControl("Place all ships!", 1400);
			return;
		}
		shipSunkChecker();
		gaveOverChecker();
	};

	compMoveWindow = compMove;

	const shipHitButNotSunkReassign = function () {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (gameBoard[i][j][0] == 2) {
					lastShotX = i;
					lastShotY = j;
					return;
				}
			}
		}
	};

	const sunkColorChange = function (shipName) {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (gameBoard[i][j][1] == shipName && gameBoard[i][j][0] == 2) {
					document.getElementById("c" + i + j).style.background = "darkred";
				}
			}
		}
	};

	const probabilityCalculator = function () {
		const lengthsLeft = [];
		let counter = 0;
		if (!carrierSunk) {
			lengthsLeft.push(5);
		}
		if (!battleshipSunk) {
			lengthsLeft.push(4);
		}
		if (!submarineSunk) {
			lengthsLeft.push(3);
		}
		if (!cruiserSunk) {
			lengthsLeft.push(3);
		}
		if (!destroyerSunk) {
			lengthsLeft.push(2);
		}
		for (let n = 0; n < lengthsLeft.length; n++) {
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < rows - lengthsLeft[n] + 1; j++) {
					for (let k = 0; k < lengthsLeft[n]; k++) {
						if (gameBoard[i][j + k][0] !== 2 && gameBoard[i][j + k][0] !== 3 && gameBoard[i][j + k][0] !== 4) {
							counter++;
						}
					}
					if (counter === lengthsLeft[n]) {
						for (let k = 0; k < lengthsLeft[n]; k++) {
							probabilityChart[i][j + k]++;
						}
					}
					counter = 0;
				}
			}
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < cols - lengthsLeft[n] + 1; j++) {
					for (let k = 0; k < lengthsLeft[n]; k++) {
						if (gameBoard[j + k][i][0] !== 2 && gameBoard[j + k][i][0] !== 3 && gameBoard[j + k][i][0] !== 4) {
							counter++;
						}
					}
					if (counter === lengthsLeft[n]) {
						for (let k = 0; k < lengthsLeft[n]; k++) {
							probabilityChart[j + k][i]++;
						}
					}
					counter = 0;
				}
			}
		}
		let currentMax = 0;
		let x;
		let y;
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (probabilityChart[i][j] > currentMax) {
					currentMax = probabilityChart[i][j];
					x = i;
					y = j;
				}
			}
		}
		return [x, y];
	};

	const resetProbabilityChart = function () {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				probabilityChart[i][j] = 0;
			}
		}
	};

	for (let i = 0; i < cols; i++) {
		probabilityChart.push([]);
		for (let j = 0; j < rows; j++) {
			probabilityChart[i].push(0);
		}
	}

	let currentElement = null;

	document.addEventListener("mouseover", function (e) {
		currentElement = e.target;
	});


	const gameOverColorChange = function () {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (window.exportedGameBoard[i][j][0] === 1) {
					document.getElementById("s" + i + j).style.background = "black";
				}
			}
		}
		if (currentElement.style.background == "black") {
			window.currentColor = "black";
		}
	};

	document.addEventListener("keydown", function (event) {
		if (event.keyCode == 192) {
			console.log(gameBoard);
		}
	});
})();
