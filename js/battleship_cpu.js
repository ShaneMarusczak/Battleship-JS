"use strict";
(() => {
  // determines the the second shot on a ship after its inital hit (below or to the right first?)
  let checkOrder = window.randomIntFromInterval(0, 1);

  // keeps track of which of the four spots around a found ship the comp is firing at
  // resets after after the second hit on each ship (getting ready for next ship)
  let scanCounter = 0;

  // coor of last shot
  let lastShotX;
  let lastShotY;

  // used to hold data about the ship currently being placed by the player
  let shipCurrentlyBeingPlaced;
  // if size of ship is 0, no ship is currently being placed
  let sizeOfShipCurrentlyBeingPlaced;
  let directionToPlaceShip = "hor";

  let shotsfired = 0;

  // a count of all cells on the board that are hits but not part of a sunk ship
  // if you hit two different ships and then sink one, we still have a hit on the board
  // when a ship is sunk, its length is subracted from this value
  // if this value is still above 0, there is an additional ship to attack
  let hitsNotPartOfSunkShip = 0;

  // computer can attack vertically or horizontally, valid values are "hor" or "ver"
  let directionToAttackFoundShip = "";

  let shipsPlaced = 0;

  let canStart = false;

  let carrierPlaced = false;
  let battleshipPlaced = false;
  let cruiserPlaced = false;
  let submarinePlaced = false;
  let destroyerPlaced = false;

  let allShipsPlaced = false;

  let carrierSunk = false;
  let battleshipSunk = false;
  let cruiserSunk = false;
  let submarineSunk = false;
  let destroyerSunk = false;

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
  const sunkSound = new Audio("sounds/Ship Sunk Sound.mp3");
  const placedShips = [];
  const ships = [carrier, battleship, cruiser, submarine, destroyer];

  const shipLengths = {
    battleship: 4,
    carrier: 5,
    cruiser: 3,
    destroyer: 2,
    submarine: 3,
  };

  const sunkPhrases = [
    "Found You!",
    "You're Sunk!",
    "Down she goes!",
    "Gotcha!",
    "Ha Ha!",
    "I'm the best!",
    "Woo Hoo!",
    "I'm Better!",
    "I'm gonna win!",
    "Easy!",
    "Sink that ship!",
    "Try Harder!",
    "Yawn...",
    "Sunk!",
    "Oh Yeah!",
    "You're Gonna Lose!",
    "Really? Easy..",
    "Yes!!",
    "So Easy!",
    "Child's Play!",
    ":)",
  ];

  const isValidXY = (x, y) => x >= 0 && x < rows && y >= 0 && y < cols;

  const getCId = (x, y) => "c" + x + y;

  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const shipSunkHelper = (num, sunkShipName) => {
    sunkSound.play();
    document
      .getElementById(sunkShipName + "Sunk_cpu")
      .classList.remove("hitText");
    document
      .getElementById(sunkShipName + "Sunk_cpu")
      .classList.add("sunkText");
    sunkColorChange(sunkShipName);
    hitsNotPartOfSunkShip = hitsNotPartOfSunkShip - num;
    directionToAttackFoundShip = "";
    checkOrder = window.randomIntFromInterval(0, 1);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (isShip(i, j, sunkShipName)) {
          gameBoard[i][j][0] = 4;
        }
      }
    }
    if (window.randomIntFromInterval(0, 10) === 0) {
      window.modal(capitalizeFirst(sunkShipName) + " Sunk!", 1500);
    } else {
      window.modal(
        sunkPhrases[window.randomIntFromInterval(0, sunkPhrases.length - 1)],
        1500
      );
    }
    if (hitsNotPartOfSunkShip > 0) {
      shipHitButNotSunkReassign();
    }
  };

  const rotateShip = () => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (directionToPlaceShip === "hor") {
          document
            .getElementById(getCId(i, j))
            .removeEventListener("mouseover", highlight);
          document
            .getElementById(getCId(i, j))
            .addEventListener("mouseover", rotatedHighlight);
        } else {
          document
            .getElementById(getCId(i, j))
            .removeEventListener("mouseover", rotatedHighlight);
          document
            .getElementById(getCId(i, j))
            .addEventListener("mouseover", highlight);
        }
      }
    }
    if (directionToPlaceShip === "hor") {
      directionToPlaceShip = "ver";
    } else {
      directionToPlaceShip = "hor";
    }
  };

  const rotatedHighlight = (e) => {
    const elemId = e.target.id;
    let canPlace = true;
    for (let i = 0; i < sizeOfShipCurrentlyBeingPlaced; i++) {
      if (!isMiss(Number(elemId[1]) + i, Number(elemId[2]))) {
        canPlace = false;
        break;
      }
    }
    if (
      Number(elemId[1]) < rows + 1 - sizeOfShipCurrentlyBeingPlaced &&
      canPlace
    ) {
      e.target.addEventListener("click", placeShip);
      for (let i = 0; i < sizeOfShipCurrentlyBeingPlaced; i++) {
        document
          .getElementById(elemId[0] + (Number(elemId[1]) + i) + elemId[2])
          .classList.add("blackBackground");
      }
    } else {
      e.target.removeEventListener("click", placeShip);
    }
  };

  const highlight = (e) => {
    const elemId = e.target.id;
    let canPlace = true;
    for (let i = 0; i < sizeOfShipCurrentlyBeingPlaced; i++) {
      if (!isMiss(Number(elemId[1]), Number(elemId[2]) + i)) {
        canPlace = false;
        break;
      }
    }
    if (
      Number(elemId[2]) < cols + 1 - sizeOfShipCurrentlyBeingPlaced &&
      canPlace
    ) {
      e.target.addEventListener("click", placeShip);
      for (let i = 0; i < sizeOfShipCurrentlyBeingPlaced; i++) {
        document
          .getElementById(elemId[0] + elemId[1] + (Number(elemId[2]) + i))
          .classList.add("blackBackground");
      }
    } else {
      e.target.removeEventListener("click", placeShip);
    }
  };

  const resetColor = () => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (isMiss(i, j)) {
          document
            .getElementById(getCId(i, j))
            .classList.remove("blackBackground");
          document
            .getElementById(getCId(i, j))
            .classList.remove("greyBackground");
        }
      }
    }
  };

  const moveShip = (e) => {
    if (sizeOfShipCurrentlyBeingPlaced === 0 && !window.gameStarted) {
      let thisShip;
      const x = Number(e.target.id[1]);
      const y = Number(e.target.id[2]);
      const [, shipName] = gameBoard[x][y];
      resetShipPlayed(shipName);
      sizeOfShipCurrentlyBeingPlaced = shipLengths[shipName];
      shipCurrentlyBeingPlaced = shipName;
      document.getElementById(shipName).classList.remove("hidden");
      allShips.forEach((s) =>
        document.getElementById(s).classList.remove("clicked")
      );
      document.getElementById(shipName).classList.add("clicked");
      shipsPlaced--;
      for (const ship of placedShips) {
        for (const coor of ship) {
          if (coor[0] === x && coor[1] === y) {
            // set to opposite direction, then call roateShip() below to sync
            directionToPlaceShip =
              gameBoard[coor[0]][coor[1]][2] === "hor" ? "ver" : "hor";
            thisShip = ship;
            break;
          }
        }
      }
      thisShip.forEach((s) => {
        const elem = document.getElementById(getCId(s[0], s[1]));
        elem.removeEventListener("mouseover", canMoveShipHighlight);
        elem.removeEventListener("mouseleave", canMoveShipHighlightRevert);
        elem.removeEventListener("click", moveShip);
        elem.classList.remove("curserPointer");
        gameBoard[s[0]][s[1]][0] = 0;
        gameBoard[s[0]][s[1]][1] = "";
      });
      placedShips.splice(placedShips.indexOf(thisShip), 1);
      fixBackgroundToMove();
      allShipsPlaced = false;
      canStart = false;
      if (
        !document.getElementById("startGame").classList.contains("notDisplayed")
      ) {
        document.getElementById("startGame").classList.add("notDisplayed");
      }
      // call here
      rotateShip();
    }
    e.stopImmediatePropagation();
  };

  const resetShipPlayed = (shipName) => {
    switch (shipName) {
      case "carrier":
        carrierPlaced = false;
        break;
      case "battleship":
        battleshipPlaced = false;
        break;
      case "cruiser":
        cruiserPlaced = false;
        break;
      case "submarine":
        submarinePlaced = false;
        break;
      case "destroyer":
        destroyerPlaced = false;
        break;
      default:
    }
  };

  const allShips = [
    "carrier",
    "battleship",
    "cruiser",
    "submarine",
    "destroyer",
  ];
  const placeShipSetup = (e) => {
    if (!allShipsPlaced) {
      const elemId = e.target.parentElement.id;
      if (document.getElementById(elemId).classList.contains("clicked")) {
        document.getElementById(elemId).classList.remove("clicked");
        sizeOfShipCurrentlyBeingPlaced = 0;
        return;
      }
      allShips.forEach((s) =>
        document.getElementById(s).classList.remove("clicked")
      );
      if (elemId === "carrier" && !carrierPlaced) {
        sizeOfShipCurrentlyBeingPlaced = shipLengths[elemId];
        e.target.parentElement.classList.add("clicked");
      } else if (elemId === "battleship" && !battleshipPlaced) {
        sizeOfShipCurrentlyBeingPlaced = shipLengths[elemId];
        e.target.parentElement.classList.add("clicked");
      } else if (elemId === "cruiser" && !cruiserPlaced) {
        sizeOfShipCurrentlyBeingPlaced = shipLengths[elemId];
        e.target.parentElement.classList.add("clicked");
        shipCurrentlyBeingPlaced = "cruiser";
      } else if (elemId === "submarine" && !submarinePlaced) {
        sizeOfShipCurrentlyBeingPlaced = shipLengths[elemId];
        e.target.parentElement.classList.add("clicked");
        shipCurrentlyBeingPlaced = "submarine";
      } else if (elemId === "destroyer" && !destroyerPlaced) {
        sizeOfShipCurrentlyBeingPlaced = shipLengths[elemId];
        e.target.parentElement.classList.add("clicked");
      }
    }
  };

  const canMoveShipHighlight = (e) => {
    if (sizeOfShipCurrentlyBeingPlaced === 0) {
      const x = Number(e.target.id[1]);
      const y = Number(e.target.id[2]);
      const [, shipName] = gameBoard[x][y];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (isShip(i, j, shipName)) {
            document
              .getElementById(getCId(i, j))
              .classList.remove("blackBackground");
            document
              .getElementById(getCId(i, j))
              .classList.add("greyBackground");
          }
        }
      }
    }
  };

  const canMoveShipHighlightRevert = (e) => {
    const x = Number(e.target.id[1]);
    const y = Number(e.target.id[2]);
    const [, shipName] = gameBoard[x][y];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (isShip(i, j, shipName)) {
          document
            .getElementById(getCId(i, j))
            .classList.add("blackBackground");
          document
            .getElementById(getCId(i, j))
            .classList.remove("greyBackground");
        }
      }
    }
  };

  const fixBackgroundToMove = () => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (
          document
            .getElementById(getCId(i, j))
            .classList.contains("greyBackground")
        ) {
          document
            .getElementById(getCId(i, j))
            .classList.add("blackBackground");
          document
            .getElementById(getCId(i, j))
            .classList.remove("greyBackground");
        }
      }
    }
  };

  const placeShipHelper = (i, j, name) => {
    gameBoard[i][j][1] = name;
    gameBoard[i][j][2] = directionToPlaceShip;
  };

  const placeShip = () => {
    if (!canStart && !allShipsPlaced) {
      const ship = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (
            document
              .getElementById(getCId(i, j))
              .classList.contains("blackBackground") &&
            gameBoard[i][j][1] === ""
          ) {
            if (sizeOfShipCurrentlyBeingPlaced === shipLengths.carrier) {
              placeShipHelper(i, j, "carrier");
            } else if (
              sizeOfShipCurrentlyBeingPlaced === shipLengths.battleship
            ) {
              placeShipHelper(i, j, "battleship");
            } else if (
              sizeOfShipCurrentlyBeingPlaced === shipLengths.cruiser &&
              shipCurrentlyBeingPlaced === "cruiser"
            ) {
              placeShipHelper(i, j, "cruiser");
            } else if (
              sizeOfShipCurrentlyBeingPlaced === shipLengths.submarine &&
              shipCurrentlyBeingPlaced === "submarine"
            ) {
              placeShipHelper(i, j, "submarine");
            } else if (
              sizeOfShipCurrentlyBeingPlaced === shipLengths.destroyer
            ) {
              placeShipHelper(i, j, "destroyer");
            }
            const elem = document.getElementById(getCId(i, j));
            elem.addEventListener("click", moveShip);
            elem.addEventListener("mouseover", canMoveShipHighlight);
            elem.addEventListener("mouseleave", canMoveShipHighlightRevert);
            elem.removeEventListener("click", placeShip);
            elem.classList.add("curserPointer");
            gameBoard[i][j][0] = 1;
            ship.push([i, j]);
          }
        }
      }
      if (sizeOfShipCurrentlyBeingPlaced === shipLengths.carrier) {
        carrierPlaced = true;
        shipsPlaced++;
        document.getElementById("carrier").classList.add("hidden");
      } else if (sizeOfShipCurrentlyBeingPlaced === shipLengths.battleship) {
        battleshipPlaced = true;
        shipsPlaced++;
        document.getElementById("battleship").classList.add("hidden");
      } else if (sizeOfShipCurrentlyBeingPlaced === shipLengths.cruiser) {
        if (shipCurrentlyBeingPlaced === "cruiser") {
          cruiserPlaced = true;
          shipsPlaced++;
          document.getElementById("cruiser").classList.add("hidden");
        } else if (shipCurrentlyBeingPlaced === "submarine") {
          submarinePlaced = true;
          shipsPlaced++;
          document.getElementById("submarine").classList.add("hidden");
        }
      } else if (sizeOfShipCurrentlyBeingPlaced === shipLengths.destroyer) {
        destroyerPlaced = true;
        shipsPlaced++;
        document.getElementById("destroyer").classList.add("hidden");
      }
      if (shipsPlaced === 5) {
        canStart = true;
        allShipsPlaced = true;
        document.getElementById("startGame").classList.remove("notDisplayed");
        document.getElementById("instructions").innerHTML =
          "<b>Placed ships can be moved before starting!</b>";
      }
      sizeOfShipCurrentlyBeingPlaced = 0;
      placedShips.push(ship);
    }
  };

  function startGame() {
    if (canStart && allShipsPlaced) {
      document.getElementById("downArrow").classList.add("notDisplayed");
      document.getElementById("leftList").classList.remove("notDisplayed");
      document.getElementById("ships").classList.add("notDisplayed");
      document.getElementById("startGame").classList.add("notDisplayed");
      document.getElementById("strtOvrBtn").classList.remove("notDisplayed");
      window.modal("Game on!", 1500);
      window.gameStarted = true;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const elem = document.getElementById(getCId(i, j));
          elem.removeEventListener("mouseleave", resetColor);
          elem.removeEventListener("click", moveShip);
          elem.removeEventListener("mouseover", canMoveShipHighlight);
          elem.removeEventListener("mouseleave", canMoveShipHighlightRevert);
          elem.classList.remove("curserPointer");
        }
      }
    }
  }

  const isShip = (x, y, shipName) =>
    isValidXY(x, y) && gameBoard[x][y][1] === shipName;

  const shipSunkChecker = () => {
    let carrierCounter = 0;
    let battleshipCounter = 0;
    let cruiserCounter = 0;
    let submarineCounter = 0;
    let destroyerCounter = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (!carrierSunk && isShip(i, j, "carrier") && isAlreadyHit(i, j)) {
          carrierCounter++;
        } else if (
          !battleshipSunk &&
          isShip(i, j, "battleship") &&
          isAlreadyHit(i, j)
        ) {
          battleshipCounter++;
        } else if (
          !cruiserSunk &&
          isShip(i, j, "cruiser") &&
          isAlreadyHit(i, j)
        ) {
          cruiserCounter++;
        } else if (
          !submarineSunk &&
          isShip(i, j, "submarine") &&
          isAlreadyHit(i, j)
        ) {
          submarineCounter++;
        } else if (
          !destroyerSunk &&
          isShip(i, j, "destroyer") &&
          isAlreadyHit(i, j)
        ) {
          destroyerCounter++;
        }
      }
    }
    if (carrierCounter === shipLengths.carrier) {
      carrierSunk = true;
      shipSunkHelper(5, "carrier");
    }
    if (battleshipCounter === shipLengths.battleship) {
      battleshipSunk = true;
      shipSunkHelper(4, "battleship");
    }
    if (cruiserCounter === shipLengths.cruiser) {
      cruiserSunk = true;
      shipSunkHelper(3, "cruiser");
    }
    if (submarineCounter === shipLengths.submarine) {
      submarineSunk = true;
      shipSunkHelper(3, "submarine");
    }
    if (destroyerCounter === shipLengths.destroyer) {
      destroyerSunk = true;
      shipSunkHelper(2, "destroyer");
    }
  };

  const shipHitChecker = () => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (isAlreadyHit(i, j)) {
          document
            .getElementById(gameBoard[i][j][1] + "Sunk_cpu")
            .classList.add("hitText");
        }
      }
    }
  };

  const gaveOverChecker = () => {
    if (
      carrierSunk &&
      battleshipSunk &&
      cruiserSunk &&
      submarineSunk &&
      destroyerSunk
    ) {
      document.getElementById("losstext").style.display = "block";
      window.gameOver = true;
      gameOverColorChange();
      window.sleep(1500).then(() => window.modal("HA HA! I WIN!", 2000));
      const valueToPass = window.compWinsOnLoad() + 1;
      window.setCookie("compwinsBattleship", valueToPass, 0.25);
      document.getElementById("compWins").textContent =
        "Computer Wins: " + valueToPass;
    }
  };

  const shipFoundAttack = () => {
    const x = lastShotX;
    const y = lastShotY;
    if (directionToAttackFoundShip === "ver") {
      if (x + 1 <= 9 && shipFoundAttackHelper(x + 1, y, true)) {
        return;
      }
      if (x + 1 > 9 || alreadyFiredAt(x + 1, y)) {
        for (let i = 1; i < 10; i++) {
          if (
            x - i < 0 ||
            gameBoard[x - i][y][0] === 3 ||
            gameBoard[x - i][y][0] === 4
          ) {
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
        directionToAttackFoundShip = "";
      }
    }
    if (directionToAttackFoundShip === "hor") {
      if (y + 1 <= 9 && shipFoundAttackHelper(x, y + 1, false)) {
        return;
      }
      if (y + 1 > 9 || alreadyFiredAt(x, y + 1)) {
        for (let i = 1; i < 10; i++) {
          if (
            y - i < 0 ||
            gameBoard[x][y - i][0] === 3 ||
            gameBoard[x][y - i][0] === 4
          ) {
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
        directionToAttackFoundShip = "";
      }
    }
    if (checkOrder === 0) {
      if (scanCounter === 0 && directionToAttackFoundShip === "") {
        if (x + 1 > 9) {
          scanCounter++;
        } else if (shipFoundAttackScanHelper(x + 1, y, "ver", 1)) {
          return;
        }
      }
      if (scanCounter === 1 && directionToAttackFoundShip === "") {
        if (y + 1 > 9) {
          scanCounter++;
        } else if (shipFoundAttackScanHelper(x, y + 1, "hor", 1)) {
          return;
        }
      }
      if (scanCounter === 2 && directionToAttackFoundShip === "") {
        if (x - 1 < 0) {
          scanCounter++;
        } else if (shipFoundAttackScanHelper(x - 1, y, "ver", -1)) {
          return;
        }
      }
      if (scanCounter >= 3 && directionToAttackFoundShip === "") {
        if (shipFoundAttackScanHelper(x, y - 1, "hor", -1)) {
          return;
        }
      }
    } else {
      if (scanCounter === 0 && directionToAttackFoundShip === "") {
        if (y + 1 > 9) {
          scanCounter++;
        } else if (shipFoundAttackScanHelper(x, y + 1, "hor", 1)) {
          return;
        }
      }
      if (scanCounter === 1 && directionToAttackFoundShip === "") {
        if (x + 1 > 9) {
          scanCounter++;
        } else if (shipFoundAttackScanHelper(x + 1, y, "ver", 1)) {
          return;
        }
      }
      if (scanCounter === 2 && directionToAttackFoundShip === "") {
        if (x - 1 < 0) {
          scanCounter++;
        } else if (shipFoundAttackScanHelper(x - 1, y, "ver", -1)) {
          return;
        }
      }
      if (scanCounter >= 3 && directionToAttackFoundShip === "") {
        if (shipFoundAttackScanHelper(x, y - 1, "hor", -1)) {
          return;
        }
      }
    }
  };

  const shipFoundAttackHelper = (x, y, isLastShotX) => {
    if (isMiss(x, y)) {
      missHelper(x, y);
      return true;
    } else if (isHit(x, y)) {
      hitHelper(x, y);
      if (isLastShotX) {
        lastShotX++;
      } else {
        lastShotY++;
      }
      return true;
    }
    return false;
  };

  const shipFoundAttackScanHelper = (x, y, direc, add) => {
    if (isMiss(x, y)) {
      missHelper(x, y);
      scanCounter++;
      return true;
    } else if (isHit(x, y)) {
      hitHelper(x, y);
      directionToAttackFoundShip = direc;
      scanCounter = 0;
      if (direc === "ver") {
        lastShotX = lastShotX + add;
      } else {
        lastShotY = lastShotY + add;
      }
      return true;
    } else {
      scanCounter++;
    }
    return false;
  };

  const isMiss = (x, y) => isValidXY(x, y) && gameBoard[x][y][0] === 0;

  const isHit = (x, y) => isValidXY(x, y) && gameBoard[x][y][0] === 1;

  const isAlreadyHit = (x, y) => isValidXY(x, y) && gameBoard[x][y][0] === 2;

  const alreadyFiredAt = (x, y) => isValidXY(x, y) && gameBoard[x][y][0] > 1;

  const hitHelper = (x, y) => {
    document.getElementById(getCId(x, y)).classList.remove("blackBackground");
    document.getElementById(getCId(x, y)).classList.add("redBackground");
    gameBoard[x][y][0] = 2;
    hitsNotPartOfSunkShip++;
    shotsfired++;
  };

  const missHelper = (x, y) => {
    document.getElementById(getCId(x, y)).classList.remove("blackBackground");
    document.getElementById(getCId(x, y)).classList.add("missBackground");
    gameBoard[x][y][0] = 3;
    shotsfired++;
  };

  const searchingShot = () => {
    let x, y;
    if (shotsfired < 5 || window.randomIntFromInterval(0, 12) === 0) {
      do {
        x = window.randomIntFromInterval(0, 9);
        y = window.randomIntFromInterval(0, 9);
      } while (
        (x % 2 != 0 && y % 2 === 0) ||
        (x % 2 === 0 && y % 2 != 0) ||
        [3, 4, 5, 6].includes(x) ||
        [3, 4, 5, 6].includes(y)
      );
    } else {
      [x, y] = probabilityCalculator();
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
    if (window.gameOver || !window.gameStarted) {
      return;
    }
    if (allShipsPlaced) {
      if (hitsNotPartOfSunkShip > 0) {
        shipFoundAttack();
      } else {
        searchingShot();
      }
    } else {
      window.modal("Place all ships!", 1400);
      return;
    }
    shipHitChecker();
    shipSunkChecker();
    gaveOverChecker();
  };

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
          window.addClassFromElementById(getCId(i, j), "darkRedBackground");
          window.removeClassFromElementById(getCId(i, j), "redBackground");
        }
      }
    }
  };

  const probabilityCalculator = () => {
    const lengthsLeft = [];
    const probabilityChart = build2dArray(10, 10);
    let counter = 0;
    if (!carrierSunk) {
      lengthsLeft.push(shipLengths.carrier);
    }
    if (!battleshipSunk) {
      lengthsLeft.push(shipLengths.battleship);
    }
    if (!submarineSunk) {
      lengthsLeft.push(shipLengths.submarine);
    }
    if (!cruiserSunk) {
      lengthsLeft.push(shipLengths.cruiser);
    }
    if (!destroyerSunk) {
      lengthsLeft.push(shipLengths.destroyer);
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
    let currentMaxes = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (probabilityChart[i][j] === currentMax) {
          currentMaxes.push([i, j]);
        } else if (probabilityChart[i][j] > currentMax) {
          currentMax = probabilityChart[i][j];
          currentMaxes = [];
          currentMaxes.push([i, j]);
        }
      }
    }
    return currentMaxes[
      window.randomIntFromInterval(0, currentMaxes.length - 1)
    ];
  };

  const gameOverColorChange = () => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (window.exportedGameBoard[i][j][0] === 1) {
          window.addClassFromElementById("s" + i + j, "blackBackground");
        }
      }
    }
  };

  const rotateIcon = () => {
    window.addClassFromElementById("rotateArrow", "rotateAnimation");
    window.removeClassFromElementById("rotateArrow", "rotateBackAnimation");
  };

  const rotateIconBack = () => {
    window.removeClassFromElementById("rotateArrow", "rotateAnimation");
    window.addClassFromElementById("rotateArrow", "rotateBackAnimation");
  };

  const build2dArray = (rowLength, numberOfRows) => {
    const arr = [];
    for (let i = 0; i < numberOfRows; i++) {
      arr.push([]);
      for (let j = 0; j < rowLength; j++) {
        arr[i].push(0);
      }
    }
    return arr;
  };

  (() => {
    window.compMoveWindow = compMove;

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
        cell.style.backgroundColor = "#80aaff";
        cell.addEventListener("mouseover", highlight);
        cell.addEventListener("mouseleave", resetColor);
      }
    }

    ships.forEach((s) => s.addEventListener("click", placeShipSetup));
    window.addEventListenerById("rotate", "mouseover", rotateIcon);
    window.addEventListenerById("rotate", "mouseleave", rotateIconBack);
    window.addEventListenerById("rotate", "click", rotateShip);
    window.addEventListenerById("startGame", "click", startGame);
    document.getElementById("compWins").textContent =
      "Computer Wins: " + window.compWinsOnLoad();

    document.addEventListener("keydown", function (event) {
      if (event.keyCode === 192) {
        console.log(gameBoard);
      }
    });
    if (window.getCookie("darkMode") === "Y") {
      window.setDarkMode();
    } else {
      window.removeDarkMode();
    }
  })();
})();
