"use strict";
//eslint-disable-next-line no-unused-vars
var compMoveWindow;
var gameOver = false;
var gameStarted = false;
(function () {
	const rows = 10;
	const cols = 10;
	const cellSize = 50;
	const gameBoard = [];
	const gameBoardContainer = document.getElementById("gameboard_cpu");
	const carrier = document.getElementById("carrier");
	const battleship = document.getElementById("battleship");
	const cruiser = document.getElementById("cruiser");
	const submarine = document.getElementById("submarine");
	const destroyer = document.getElementById("destroyer");
	const sunkSound = new Audio("Ship Sunk Sound.mp3");
	const placedShips = [];
	const ships = [carrier, battleship, cruiser, submarine, destroyer];
	const probabilityChart = [];
	let shipFound = 0;
	let shipsPlaced = 0;
	let currentElement, lastShotX, lastShotY, placed, size;
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
	let shipDirection = "";
	let scanCounter = 0;
	let direction = "hor";
	let shotsfired = 0;
	const sunkPhrases = [
		"I am winning!", "Found You!", "You're Sunk!", "Down she goes!", "Gotcha!", "Ha Ha!", "I'm the best!", "Woo Hoo!",
		"I'm Better!", "I'm gonna win!", "Easy!", "Sink that ship!", "Try Harder!", "Yawn..", "Sunk!", "Oh Yeah!"
	];

	const getCId = (x, y) => "c" + x + y;

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

	const shipSunkHelper = (num, sunkShipName) => {
		sunkSound.play();
		document.getElementById(sunkShipName + "Sunk_cpu").classList.add("inline");
		sunkColorChange(sunkShipName);
		shipFound = shipFound - num;
		shipDirection = "";
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (isShip(i, j, sunkShipName)) {
					gameBoard[i][j][0] = 4;
				}
			}
		}
		if (randomIntFromInterval(0, 10) === 0) {
			alertModalControl(capitalizeFirst(sunkShipName) + " Sunk!", 1500);
		} else {
			alertModalControl(sunkPhrases[randomIntFromInterval(0, sunkPhrases.length - 1)], 1500);
		}
		if (shipFound > 0) {
			shipHitButNotSunkReassign();
		}
	};

	const rotateShip = () => {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (direction == "hor") {
					document.getElementById(getCId(i, j)).removeEventListener("mouseover", highlight);
					document.getElementById(getCId(i, j)).addEventListener("mouseover", rotatedHighlight);
				} else {
					document.getElementById(getCId(i, j)).removeEventListener("mouseover", rotatedHighlight);
					document.getElementById(getCId(i, j)).addEventListener("mouseover", highlight);
				}
			}
		}
		if (direction == "hor") {
			direction = "ver";
		} else {
			direction = "hor";
		}
	};

	const rotatedHighlight = (e) => {
		const elemId = e.target.id;
		if (Number(elemId[1]) < rows + 1 - size) {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document.getElementById(getCId(i, j)).addEventListener("click", placeShip);
				}
			}
			for (let i = 0; i < size; i++) {
				document.getElementById(elemId[0] + (Number(elemId[1]) + i) + elemId[2]).style.background = "black";
			}
		} else {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document.getElementById(getCId(i, j)).removeEventListener("click", placeShip);
				}
			}
		}
	};

	const highlight = (e) => {
		const elemId = e.target.id;
		if (Number(elemId[2]) < cols + 1 - size) {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document.getElementById(getCId(i, j)).addEventListener("click", placeShip);
				}
			}
			for (let i = 0; i < size; i++) {
				document.getElementById(elemId[0] + elemId[1] + (Number(elemId[2]) + i)).style.background = "black";
			}
		} else {
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document.getElementById(getCId(i, j)).removeEventListener("click", placeShip);
				}
			}
		}
	};

	const resetColor = () => {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (isMiss(i, j)) {
					document.getElementById(getCId(i, j)).style.background = "#80aaff";
				}
			}
		}
	};

	const placeShip = (e) => {
		if (allShipsPlaced) {
			return;
		}
		const ship = [];
		let canPlace = true;
		const x = Number(e.target.id[1]);
		const y = Number(e.target.id[2]);

		for (const placedShip of placedShips) {
			for (const coor of placedShip) {
				if (direction === "hor") {
					for (let i = 0; i < size; i++) {
						if (x === coor[0] && y + i === coor[1]) {
							canPlace = false;
						}
					}
				} else {
					for (let i = 0; i < size; i++) {
						if (x + i === coor[0] && y === coor[1]) {
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
						document.getElementById(getCId(i, j)).style.background == "black" &&
						gameBoard[i][j][1] == ""
					) {
						if (size === 5) {
							gameBoard[i][j][1] = "carrier";
						} else if (size === 4) {
							gameBoard[i][j][1] = "battleship";
						} else if (size === 3 && placed === "cruiser") {
							gameBoard[i][j][1] = "cruiser";
						} else if (size === 3 && placed === "submarine") {
							gameBoard[i][j][1] = "submarine";
						} else if (size === 2) {
							gameBoard[i][j][1] = "destroyer";
						}
						document.getElementById(getCId(i, j)).removeEventListener("mouseover", highlight);
						gameBoard[i][j][0] = 1;
						ship.push([i, j]);
					}
				}
			}
			if (size === 5) {
				placedCarrier = true;
				shipsPlaced++;
				document.getElementById("carrier").classList.add("notDisplayed");
			} else if (size === 4) {
				placedBattleship = true;
				shipsPlaced++;
				document.getElementById("battleship").classList.add("notDisplayed");
			} else if (size === 3) {
				if (placed === "cruiser") {
					placedCruiser = true;
					shipsPlaced++;
					document.getElementById("cruiser").classList.add("notDisplayed");
				} else if (placed === "submarine") {
					placedSubmarine = true;
					shipsPlaced++;
					document.getElementById("submarine").classList.add("notDisplayed");
				}
			} else if (size === 2) {
				placedDetroyer = true;
				shipsPlaced++;
				document.getElementById("destroyer").classList.add("notDisplayed");
			}
			if (shipsPlaced === 5) {
				document.getElementById("instructions").classList.add("notDisplayed");
				alertModalControl("All ships Placed!", 1400);
				document.getElementById("ready").style.display = "block";
				allShipsPlaced = true;
				gameStarted = true;
				for (let i = 0; i < cols; i++) {
					for (let j = 0; j < rows; j++) {
						document.getElementById(getCId(i, j)).removeEventListener("mouseleave", resetColor);
					}
				}
			}
			size = 0;
			placedShips.push(ship);
		}
	};

	const isShip = (x, y, shipName) => gameBoard[x][y][1] === shipName;

	const shipSunkChecker = () => {
		let carrierCounter = 0;
		let battleshipCounter = 0;
		let cruiserCounter = 0;
		let submarineCounter = 0;
		let destroyerCounter = 0;
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (isShip(i, j, "carrier") && isAlreadyHit(i, j) && !carrierSunk) {
					carrierCounter++;
				} else if (isShip(i, j, "battleship") && isAlreadyHit(i, j) && !battleshipSunk) {
					battleshipCounter++;
				} else if (isShip(i, j, "cruiser") && isAlreadyHit(i, j) && !cruiserSunk) {
					cruiserCounter++;
				} else if (isShip(i, j, "submarine") && isAlreadyHit(i, j) && !submarineSunk) {
					submarineCounter++;
				} else if (isShip(i, j, "destroyer") && isAlreadyHit(i, j) && !destroyerSunk) {
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

	const allShips = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
	const placeShipSetup = (e) => {
		const elemId = e.target.parentElement.id;
		if (document.getElementById(elemId).classList.contains("clicked")) {
			document.getElementById(elemId).classList.remove("clicked");
			size = 0;
			return;
		}
		allShips.forEach(s => document.getElementById(s).classList.remove("clicked"));
		if (elemId === "carrier" && !placedCarrier) {
			size = 5;
			e.target.parentElement.classList.add("clicked");
		} else if (elemId === "battleship" && !placedBattleship) {
			size = 4;
			e.target.parentElement.classList.add("clicked");
		} else if (elemId === "cruiser" && !placedCruiser) {
			size = 3;
			e.target.parentElement.classList.add("clicked");
			placed = "cruiser";
		} else if (elemId === "submarine" && !placedSubmarine) {
			size = 3;
			e.target.parentElement.classList.add("clicked");
			placed = "submarine";
		} else if (elemId === "destroyer" && !placedDetroyer) {
			size = 2;
			e.target.parentElement.classList.add("clicked");
		}
	};

	const gaveOverChecker = () => {
		if (carrierSunk && battleshipSunk && cruiserSunk && submarineSunk && destroyerSunk) {
			document.getElementById("losstext").style.display = "block";
			gameOver = true;
			gameOverColorChange();
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					document.getElementById("s" + i + j).removeEventListener("click", compMove);
				}
			}
		}
	};

	const shipFoundAttack = () => {
		const x = lastShotX;
		const y = lastShotY;
		if (shipDirection == "ver") {
			if (x + 1 <= 9) {
				if (isMiss(x + 1, y)) {
					missHelper(x + 1, y);
					return;
				} else if (isHit(x + 1, y)) {
					hitHelper(x + 1, y);
					lastShotX++;
					return;
				}
			}
			if (x + 1 > 9 || alreadyFiredAt(x + 1, y)) {
				for (let i = 1; i < 10; i++) {
					if (x - i < 0 || gameBoard[x - i][y][0] == 3 || gameBoard[x - i][y][0] == 4) {
						break;
					} else if (isMiss(x - i, y)) {
						missHelper(x - i, y);
						return;
					} else if (isHit(x - i, y)) {
						hitHelper(x - i, y);
						return;
					}
				}
				scanCounter = 0;
				shipDirection = "";
			}
		}
		if (shipDirection == "hor") {
			if (y + 1 <= 9) {
				if (isMiss(x, y + 1)) {
					missHelper(x, y + 1);
					return;
				} else if (isHit(x, y + 1)) {
					hitHelper(x, y + 1);
					lastShotY++;
					return;
				}
			}
			if (y + 1 > 9 || alreadyFiredAt(x, y + 1)) {
				for (let i = 1; i < 10; i++) {
					if (y - i < 0 || gameBoard[x][y - i][0] === 3 || gameBoard[x][y - i][0] === 4) {
						break;
					} else if (isMiss(x, y - i)) {
						missHelper(x, y - i);
						return;
					} else if (isHit(x, y - i)) {
						hitHelper(x, y - i);
						return;
					}
				}
				scanCounter = 0;
				shipDirection = "";
			}
		}
		if (scanCounter === 0 && shipDirection === "") {
			if (x + 1 > 9) {
				scanCounter++;
			} else {
				if (isMiss(x + 1, y)) {
					missHelper(x + 1, y);
					scanCounter++;
					return;
				} else if (isHit(x + 1, y)) {
					hitHelper(x + 1, y);
					shipDirection = "ver";
					scanCounter = 0;
					lastShotX++;
					return;
				} else {
					scanCounter++;
				}
			}
		}
		if (scanCounter === 1 && shipDirection === "") {
			if (y + 1 > 9) {
				scanCounter++;
			} else {
				if (isMiss(x, y + 1)) {
					missHelper(x, y + 1);
					scanCounter++;
					return;
				} else if (isHit(x, y + 1)) {
					hitHelper(x, y + 1);
					shipDirection = "hor";
					scanCounter = 0;
					lastShotY++;
					return;
				} else {
					scanCounter++;
				}
			}
		}
		if (scanCounter === 2 && shipDirection === "") {
			if (x - 1 < 0) {
				scanCounter++;
			} else {
				if (isMiss(x - 1, y)) {
					missHelper(x - 1, y);
					scanCounter++;
					return;
				} else if (isHit(x - 1, y)) {
					hitHelper(x - 1, y);
					shipDirection = "ver";
					scanCounter = 0;
					lastShotX--;
					return;
				} else {
					scanCounter++;
				}
			}
		}
		if (scanCounter === 3 && shipDirection === "") {
			if (isMiss(x, y - 1)) {
				missHelper(x, y - 1);
				scanCounter++;
				return;
			} else if (isHit(x, y - 1)) {
				hitHelper(x, y - 1);
				shipDirection = "hor";
				scanCounter = 0;
				lastShotY--;
				return;
			}
		}
	};

	const isMiss = (x, y) => gameBoard[x][y][0] === 0;

	const isHit = (x, y) => gameBoard[x][y][0] === 1;

	const isAlreadyHit = (x, y) => gameBoard[x][y][0] === 2;

	const alreadyFiredAt = (x, y) => gameBoard[x][y][0] > 1;

	const hitHelper = (x, y) => {
		document.getElementById(getCId(x, y)).style.background = "red";
		gameBoard[x][y][0] = 2;
		shipFound++;
		shotsfired++;
	};

	const missHelper = (x, y) => {
		document.getElementById(getCId(x, y)).style.background = "#4d88ff";
		gameBoard[x][y][0] = 3;
		shotsfired++;
	};

	const searchingShot = () => {
		let x, y;
		if (shotsfired < 5 || randomIntFromInterval(0, 5) === 0) {
			do {
				x = randomIntFromInterval(0, 8);
				y = randomIntFromInterval(0, 8);
			} while ((x % 2 != 0 && y % 2 == 0) || (x % 2 == 0 && y % 2 != 0));
		} else {
			[x, y] = probabilityCalculator();
			resetProbabilityChart();
		}
		lastShotX = x;
		lastShotY = y;
		if (isMiss(x, y)) {
			missHelper(x, y);
		} else if (isHit(x, y)) {
			hitHelper(x, y);
		} else if (alreadyFiredAt(x, y)) {
			searchingShot();
		}
	};

	const compMove = () => {
		if (gameOver || !gameStarted) {
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

	const shipHitButNotSunkReassign = () => {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (isAlreadyHit(i, j)) {
					lastShotX = i;
					lastShotY = j;
					return;
				}
			}
		}
	};

	const sunkColorChange = (shipName) => {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (isShip(i, j, shipName) && isAlreadyHit(i, j)) {
					document.getElementById(getCId(i, j)).style.background = "darkred";
				}
			}
		}
	};

	const probabilityCalculator = () => {
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
						if (!alreadyFiredAt(i, j + k)) {
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
						if (!alreadyFiredAt(j + k, i)) {
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
		let x, y;
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

	const resetProbabilityChart = () => {
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

	document.addEventListener("mouseover", (e) => {
		currentElement = e.target.target;
	});


	const gameOverColorChange = () => {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (window.exportedGameBoard[i][j][0] === 1) {
					document.getElementById("s" + i + j).classList.add("blackBackground");
				}
			}
		}
		if (currentElement.style.background == "black") {
			window.currentColor = "black";
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
			document.getElementById(getCId(i, j)).style.background = "#80aaff";
			document.getElementById(getCId(i, j)).addEventListener("mouseover", highlight);
			document.getElementById(getCId(i, j)).addEventListener("mouseleave", resetColor);
		}
	}

	ships.forEach(s => s.addEventListener("click", placeShipSetup));

	document.getElementById("rotate").addEventListener("click", rotateShip);

	document.getElementById("strtOvrBtn").addEventListener("click", () => location.reload());

	document.addEventListener("keydown", function (event) {
		if (event.keyCode == 192) {
			console.log(gameBoard);
		}
	});
})();
