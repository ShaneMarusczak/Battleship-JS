/*eslint-disable prefer-const */
/*eslint-disable no-unused-vars */
"use strict";

function resetWinLoss() {
  window.setCookie("compwinsBattleship", 0, 0.25);
  document.getElementById("compWins").textContent = "Computer Wins: " + 0;
  window.setCookie("playerwinsBattleship", 0, 0.25);
  document.getElementById("playerWins").textContent = "Player Wins: " + 0;
}

function playerWinsOnLoad() {
  return Number(window.getCookie("playerwinsBattleship"));
}

function compWinsOnLoad() {
  return Number(window.getCookie("compwinsBattleship"));
}

var exportedGameBoard;
var currentColor;

var compMoveWindow;
var gameOver = false;
var gameStarted = false;

(() => {
  document
    .getElementById("resetWinLoss")
    .addEventListener("click", window.resetWinLoss);
  document.getElementById("homeIcon").addEventListener("mouseover", () => {
    document.getElementById("homeIcon").classList.add("upBounce");
    document.getElementById("homeIcon").classList.remove("downBounce");
  });
  document.getElementById("homeIcon").addEventListener("mouseleave", () => {
    document.getElementById("homeIcon").classList.add("downBounce");
    document.getElementById("homeIcon").classList.remove("upBounce");
    window
      .sleep(1000)
      .then(() =>
        document.getElementById("homeIcon").classList.remove("downBounce")
      );
  });

  document.getElementById("githubicon").addEventListener("mouseover", () => {
    document.getElementById("githubicon").classList.add("upBounce");
    document.getElementById("githubicon").classList.remove("downBounce");
  });
  document.getElementById("githubicon").addEventListener("mouseleave", () => {
    document.getElementById("githubicon").classList.add("downBounce");
    document.getElementById("githubicon").classList.remove("upBounce");
    window
      .sleep(1000)
      .then(() =>
        document.getElementById("githubicon").classList.remove("downBounce")
      );
  });
})();