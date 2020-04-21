"use strict";
/*eslint-disable no-implicit-globals */
/*eslint-disable no-console */
//eslint-disable-next-line no-unused-vars
var exportedGameBoard;
var currentColor;
(function () {
	const rows = 10;
	const cols = 10;
	const squareSize = 50;
	const winningHitCount = 17;
	const gameBoard = [];
	const gameBoardContainer = document.getElementById("gameboard");
	const strtOvrBtn = document.getElementById("strtOvrBtn");
	const hitSound = new Audio("Hit Ship Sound.mp3");
	const missSound = new Audio("Miss Fire Sound.mp3");
	const sunkSound = new Audio("Ship Sunk Sound.mp3");
	let hitCount = 0;
	const ships = [];
	const searchngPhrases = [
		"Thinking...", "Hmm...", "Finding...", "Pinging...", "Tracking...", "Spotting...", "Hunting...", "Looking...",
		"Probing...", "Scanning..."
	];
	const firingPhrases = ["Fire!", "Launch!", "Blast!", "Go!", "Torpedo!", "BOOM!", "BANG!", "There!", "Found!"];
	const compSunkPhrases = ["Aww Man!", "SOS!", "Nice Shot!", "I'm Going Down!", "Capsized!", "I'm Sinking!", "Cheater!", "Shipwreck!"];

	gameBoardContainer.addEventListener("click", fireTorpedo, false);
	strtOvrBtn.addEventListener("click", () => location.reload());

	//inclusive
	const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

	const hoverColor = function (e) {
		currentColor = e.target.style.background;
		if (e.target.style.background === "rgb(128, 170, 255)") {
			e.target.style.background = "#87CEFA";
		}
	};

	const resetHoverColor = function (e) {
		e.target.style.background = currentColor;
	};

	const alertModalControl = (message, duration) => {
		document.getElementById("alertshader").style.display = "block";
		document.getElementById("alertmessage").innerText = message;
		sleep(duration).then(() => {
			document.getElementById("alertshader").style.display = "none";
		});
	};

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	const innerModalControl = () => {
		document.getElementById("thinking").style.display = "flex";
		document.getElementById("shader").style.display = "block";
		sleep(1400).then(() => {
			document.getElementById("message").innerText = firingPhrases[randomIntFromInterval(0, firingPhrases.length - 1)];
		});
		sleep(2000).then(() => {
			document.getElementById("thinking").style.display = "none";
			document.getElementById("shader").style.display = "none";
			sleep(300).then(() => {
				window.compMoveWindow();
				gameBoardContainer.addEventListener("click", fireTorpedo, false);
			});
		});
		document.getElementById("message").innerText = searchngPhrases[randomIntFromInterval(0, searchngPhrases.length - 1)];
	};

	const modalControl = (shipSunkThisShot) => {
		gameBoardContainer.removeEventListener("click", fireTorpedo, false);
		if (shipSunkThisShot) {
			const delay = 1500;
			alertModalControl(compSunkPhrases[randomIntFromInterval(0, compSunkPhrases.length - 1)], delay);
			sleep(delay).then(() => innerModalControl());
		} else {
			innerModalControl();
		}
	};

	function fireTorpedo(e) {
		let shipSunkThisShot = false;
		if (!window.gameStarted || window.gameOver) {
			return;
		}

		if (e.target !== e.currentTarget) {
			const row = e.target.id.substring(1, 2);
			const col = e.target.id.substring(2, 3);

			if (gameBoard[row][col][0] == 0) {
				e.target.style.background = "#4d88ff";
				gameBoard[row][col][0] = 3;
				document.getElementById("s" + row + col).classList.add("miss");
				currentColor = "#4d88ff";
				missSound.play();
			} else if (gameBoard[row][col][0] == 1) {
				e.target.style.background = "red";
				gameBoard[row][col][0] = 2;
				document.getElementById("s" + row + col).classList.add("hit");
				currentColor = "red";
				hitSound.play();
				hitCount++;
				let shipSunkCounter = 0;
				for (const ship of ships) {
					for (const coor of ship) {
						if (coor[0] == row && coor[1] == col) {
							for (const coor of ship) {
								if (gameBoard[coor[0]][coor[1]][0] == 2) {
									shipSunkCounter++;
								}
								if (shipSunkCounter == ship.length) {
									currentColor = "darkred";
									for (const coor of ship) {
										document.getElementById(
											"s" + coor[0] + coor[1]
										).style.background = "darkred";
									}
									document.getElementById(
										gameBoard[coor[0]][coor[1]][1] + "Sunk"
									).style.display = "inline";
									shipSunkThisShot = true;
									sunkSound.play();
								}
							}
						}
					}
				}

				if (hitCount == winningHitCount) {
					document.getElementById("wintext").style.display = "block";
					gameBoardContainer.removeEventListener("click", fireTorpedo);
					window.gameOver = true;
					return;
				}
			} else if (gameBoard[row][col][0] > 1) {
				alertModalControl("Can't Fire Here!", 1400);
				return;
			}
		}
		sleep(200).then(() => modalControl(shipSunkThisShot));
		e.stopPropagation();
	}

	let nameIndex = 0;
	const names = ["Carrier", "Battleship", "Cruiser", "Submarine", "Destroyer"];

	function placeShip(len) {
		const ship = [];
		const name = names[nameIndex];
		const dir = randomIntFromInterval(1, 2);
		const row = randomIntFromInterval(0, 9);
		const col = randomIntFromInterval(0, 9);
		let shipPlaceCounter = 0;
		if (dir == 1) {
			if (col >= len - 1) {
				for (let i = 0; i < len; i++) {
					if (gameBoard[row][col - i][0] == 0) {
						shipPlaceCounter++;
					}
				}
				if (shipPlaceCounter == len) {
					for (let i = 0; i < len; i++) {
						gameBoard[row][col - i][0] = 1;
						gameBoard[row][col - i][1] = name;
						ship.push([row, col - i]);
					}
				} else {
					placeShip(len);
				}
			} else {
				for (let i = 0; i < len; i++) {
					if (gameBoard[row][col + i][0] == 0) {
						shipPlaceCounter++;
					}
				}
				if (shipPlaceCounter == len) {
					for (let i = 0; i < len; i++) {
						gameBoard[row][col + i][0] = 1;
						gameBoard[row][col + i][1] = name;
						ship.push([row, col + i]);
					}
				} else {
					placeShip(len);
				}
			}
		} else {
			if (row >= len - 1) {
				for (let i = 0; i < len; i++) {
					if (gameBoard[row - i][col][0] == 0) {
						shipPlaceCounter++;
					}
				}
				if (shipPlaceCounter == len) {
					for (let i = 0; i < len; i++) {
						gameBoard[row - i][col][0] = 1;
						gameBoard[row - i][col][1] = name;
						ship.push([row - i, col]);
					}
				} else {
					placeShip(len);
				}
			} else {
				for (let i = 0; i < len; i++) {
					if (gameBoard[row + i][col][0] == 0) {
						shipPlaceCounter++;
					}
				}
				if (shipPlaceCounter == len) {
					for (let i = 0; i < len; i++) {
						gameBoard[row + i][col][0] = 1;
						gameBoard[row + i][col][1] = name;
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

	for (let i = 0; i < cols; i++) {
		gameBoard.push([]);
		for (let j = 0; j < rows; j++) {
			gameBoard[i].push([0, ""]);
			const square = document.createElement("div");
			gameBoardContainer.appendChild(square);
			square.id = "s" + j + i;
			const topPosition = j * squareSize + 5;
			const leftPosition = i * squareSize + 5;
			square.style.top = topPosition + "px";
			square.style.left = leftPosition + "px";
		}
	}

	placeShip(5);
	placeShip(4);
	placeShip(3);
	placeShip(3);
	placeShip(2);
	exportedGameBoard = gameBoard;

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			document.getElementById("s" + i + j).style.background = "rgb(128, 170, 255)";
			document.getElementById("s" + i + j).addEventListener("mouseover", hoverColor);
			document.getElementById("s" + i + j).addEventListener("mouseleave", resetHoverColor);
		}
	}

	document.addEventListener("keydown", function (event) {
		if (event.keyCode == 192) {
			console.log(gameBoard);
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					if (gameBoard[i][j][0] == 1) {
						document.getElementById("s" + i + j).style.background = "white";
					}
				}
			}
		}
	});
})();
