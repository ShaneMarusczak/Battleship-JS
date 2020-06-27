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

function setDarkMode() {
	Array.from(document.getElementsByTagName("p")).forEach(p => p.classList.add("lightText"));
	document.getElementsByTagName("html")[0].classList.add("darkBackground");
	document.getElementById("alert").classList.add("darkGrayBackground");
	document.getElementById("thinking").classList.add("darkGrayBackground");
	document.getElementById("githubicon").classList.add("lightBackground");
	document.getElementById("homeIcon").classList.add("lightBackground");
	document.getElementById("downArrow").classList.add("lightBackground");
	document.getElementById("rotateArrow").classList.add("lightBackground");
	document.getElementById("leftList").classList.add("darkGrayBackground");
	document.getElementById("rightList").classList.add("darkGrayBackground");
	document.getElementById("ships").classList.add("darkGrayBackground");
	document.getElementById("gameboard").classList.add("darkGrayBackground");
	document.getElementById("gameboard_cpu").classList.add("darkGrayBackground");
	document.getElementsByClassName("animation")[0].classList.add("darkGrayBackground");
	setCookie("darkMode", "Y", 1);
}

function removeDarkMode() {
	Array.from(document.getElementsByTagName("p")).forEach(p => p.classList.remove("lightText"));
	document.getElementsByTagName("html")[0].classList.remove("darkBackground");
	document.getElementById("alert").classList.remove("darkGrayBackground");
	document.getElementById("thinking").classList.remove("darkGrayBackground");
	document.getElementById("githubicon").classList.remove("lightBackground");
	document.getElementById("homeIcon").classList.remove("lightBackground");
	document.getElementById("downArrow").classList.remove("lightBackground");
	document.getElementById("rotateArrow").classList.remove("lightBackground");
	document.getElementById("leftList").classList.remove("darkGrayBackground");
	document.getElementById("rightList").classList.remove("darkGrayBackground");
	document.getElementById("ships").classList.remove("darkGrayBackground");
	document.getElementById("gameboard").classList.remove("darkGrayBackground");
	document.getElementById("gameboard_cpu").classList.remove("darkGrayBackground");
	document.getElementsByClassName("animation")[0].classList.remove("darkGrayBackground");
	setCookie("darkMode", "N", 1);
}

(() => {
	document.getElementById("darkMode").addEventListener("click", () => {
		if (window.getCookie("darkMode") === "N") {
			window.setDarkMode();
		} else {
			window.removeDarkMode();
		}
	});
	document.getElementById("strtOvrBtn").addEventListener("click", () => location.reload());
	document.getElementById("resetWinLoss").addEventListener("click", window.resetWinLoss);
	document.getElementById("homeIcon").addEventListener("mouseover", () => {
		document.getElementById("homeIcon").classList.add("upBounce");
		document.getElementById("homeIcon").classList.remove("downBounce");
	});
	document.getElementById("homeIcon").addEventListener("mouseleave", () => {
		document.getElementById("homeIcon").classList.add("downBounce");
		document.getElementById("homeIcon").classList.remove("upBounce");
		sleep(1000).then(() => document.getElementById("homeIcon").classList.remove("downBounce"));
	});

	document.getElementById("githubicon").addEventListener("mouseover", () => {
		document.getElementById("githubicon").classList.add("upBounce");
		document.getElementById("githubicon").classList.remove("downBounce");
	});
	document.getElementById("githubicon").addEventListener("mouseleave", () => {
		document.getElementById("githubicon").classList.add("downBounce");
		document.getElementById("githubicon").classList.remove("upBounce");
		sleep(1000).then(() => document.getElementById("githubicon").classList.remove("downBounce"));
	});
})();

