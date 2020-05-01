/*eslint-disable prefer-const */
/*eslint-disable no-unused-vars */
"use strict";

function alertModalControl(message, duration) {
	document.getElementById("alertshader").style.display = "block";
	document.getElementById("alertmessage").innerText = message;
	window.sleep(duration).then(() => {
		document.getElementById("alertshader").style.display = "none";
	});
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function resetWinLoss() {
	window.setCookie("compwins", 0, 0.25);
	document.getElementById("compWins").textContent = "Computer Wins: " + 0;
	window.setCookie("playerwins", 0, 0.25);
	document.getElementById("playerWins").textContent = "Player Wins: " + 0;
}


function playerWinsOnLoad() {
	return Number(window.getCookie("playerwins"));
}

function compWinsOnLoad() {
	return Number(window.getCookie("compwins"));
}

var exportedGameBoard;
var currentColor;

var compMoveWindow;
var gameOver = false;
var gameStarted = false;

document.getElementById("strtOvrBtn").addEventListener("click", () => location.reload());

document.getElementById("resetWinLoss").addEventListener("click", window.resetWinLoss);

