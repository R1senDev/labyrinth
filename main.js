// Настройка холста и других объектов
const score = document.getElementById('score');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const up = document.getElementById('up');
const right = document.getElementById('right');
const down = document.getElementById('down');
const left = document.getElementById('left');
const music = document.getElementById('music');
const sounds = document.getElementById('sounds');
// Массив с монетами
let coins = [];
// Прочие настройки. Балуйся.
let debug = false;
// Поддерживаемые режимы игры:
// - classic
// - timer
let gameMode = 'classic';
let box = 5;
let mapWidth = 69;  // Молчите, пожалуйста. Это оп-
let mapHeight = 69; // тимальное значение ._.
canvas.width = mapWidth * box;
canvas.height = mapHeight * box;

let drawing = {
	putPixel: function(x, y, color) {
		context.fillStyle = color;
		context.fillRect(x * box, y * box, box, box);
	},
	fillRectByAngle: function(x1, y1, x2, y2, color) {
		context.fillStyle = color;
		context.fillRect(x1, y2, x2 - x1, y2 - y1);
	},
};
Object.freeze(drawing);

function writeToLog(str) {
	if (debug) {
		console.log(str);
	}
}

// Коллекция с картой
let map = new Map();

// Определение содержимого карты
function defineMapContent() {
	for (let y = -2; y <= mapHeight + 2; y++) {
		for (let x = -2; x <= mapWidth + 2; x++) {
			map.set(`${x}:${y}`, {isWall: false, isGenerated: false});
		}
	}
}

function playSound(path) {
	var sound = new Audio();
	sound.src = path;
	sound.autoplay = true;
}

// Игрок
let player = {
	x: 1,
	y: 1,
	points: 0,
	timePoints: 100,
	level: 0,
	isFinished: function() {
		//writeToLog(`(finish.x == player.x) && (finish.y == player.y) == ${(finish.x == player.x) && (finish.y == player.y)}`)
		if ((finish.x == player.x) && (finish.y == player.y)) {
			return true;
		} else {
			return false;
		}
	},
	go: function(dir) {
		//writeToLog(`In progress: player.go(${dir})`);
		switch (dir) {
			case 'up':
				if (!map.get(`${player.x}:${player.y - 1}`).isWall) {
					writeToLog('player.y--');
					player.y--;
				}
				break;
			case 'right':
				if (!map.get(`${player.x + 1}:${player.y}`).isWall) {
					player.x++;
				}
				break;
			case 'down':
				if (!map.get(`${player.x}:${player.y + 1}`).isWall) {
					player.y++;
				}
				break;
			case 'left':
				if (!map.get(`${player.x - 1}:${player.y}`).isWall) {
					player.x--;
				}
				break;
		}
		for (let i = 0; i < coins.length; i++) {
			if ((player.x == coins[i].x) && (player.y == coins[i].y)) {
				coins[i].x = -1;
				coins[i].y = -1;
				player.points += 10;
				playSound('coin.mp3');
			}
		}
	},
};

// Финиш
let finish = {
	x: -1,
	y: -1,
	setFinish: function() {
		for (let x = mapWidth - 1; x >= 0; x--) {
			for (let y = mapHeight - 1; y >= 0; y--) {
				if (!map.get(`${x}:${y}`).isWall) {
					finish.x = x;
					finish.y = y;
					break;
				}
			}
		}
	},
};

// Генерирует специальные области карты
function placeBlock(x, y, type) {
	switch (type) {
		case 'start00': 
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
		case 'start01':
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 1}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
		case 'start01':
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y + 1}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
		case 'finish00':
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
		case 'finish01':
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 1}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
		case 'finish10':
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y + 1}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
	}
}

// Генерирует карту. Версия генератора: v2.3
function generateMap() {
	player.level++;
	if (player.level > 1) {
		playSound(`win${Math.floor(Math.random() * 2)}.mp3`);
	}
	player.timePoints = 100;
	player.x = 1;
	player.y = 1;
	defineMapContent();
	let mask;
	for (let y = 1; y < mapHeight; y += 3) {
		for (let x = 1; x < mapWidth; x += 3) {
			writeToLog(`x == ${x}\ny == ${y}`);
			mask = 'XXXX';
			writeToLog(`mask == ${mask}`);
			if (map.get(`${x + 1}:${y - 1}`).isGenerated) {
				if (map.get(`${x + 1}:${y - 1}`).isWall) {
					mask = '1' + mask.slice(1);
				} else {
					mask = '0' + mask.slice(1);
				}
			}
			if (map.get(`${x + 3}:${y + 1}`).isGenerated) {
				if (map.get(`${x + 3}:${y + 1}`).isWall) {
					mask = mask[0] + '1' + mask.slice(2);
				} else {
					mask = mask[0] + '0' + mask.slice(2);
				}
			}
			if (map.get(`${x + 1}:${y + 3}`).isGenerated) {
				if (map.get(`${x + 1}:${y + 3}`).isWall) {
					mask = mask.slice(0, 3) + '1' + mask[3];
				} else {
					mask = mask.slice(0, 3) + '0' + mask[3];
				}
			}
			if (map.get(`${x - 1}:${y + 1}`).isGenerated) {
				if (map.get(`${x - 1}:${y + 1}`).isWall) {
					mask = mask.slice(0, 4) + '1';
				} else {
					mask = mask.slice(0, 4) + '0';
				}
			}
			let blockId = '';
			for (let i = 0; i < 4; i++) {
				if (mask[i] == 'X') {
					blockId += Math.floor(Math.random() * 2);
				} else {
					blockId += mask[i];
				}
			}
			if (debug) {
				writeToLog(`blockId == ${blockId}`);
			}
			for (let y1 = y; y1 <= y + 2; y1++) {
				for (let x1 = x; x1 <= x + 2; x1++) {
					map.get(`${x}:${y}`).isGenerated = true;
				}
			}
			map.get(`${x}:${y}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			if (blockId == '1111') {
				map.get(`${x + 1}:${y + 1}`).isWall = true;
			}
			// Комменты - костыли, не дергать. Без
			// этого - работает, но я не знаю, по-
			// чему
			if (blockId[0] == '1') {
				//map.get(`${x + 1}:${y}`).isWall = true;
			}
			if (blockId[1] == '1') {
				//map.get(`${x + 2}:${y + 1}`).isWall = true;
			}
			if (blockId[2] == '1') {
				map.get(`${x + 1}:${y + 2}`).isWall = true;
			}
			if (blockId[3] == '1') {
				//map.get(`${x}:${y + 1}`).isWall = true;
			}
		}
	}
	for (let y = -1; y <= mapHeight + 1; y++) {
		map.get(`-1:${y}`).isWall = true;
		map.get(`0:${y}`).isWall = true;
		map.get(`${mapWidth - 1}:${y}`).isWall = true;
		map.get(`${mapWidth}:${y}`).isWall = true;
	}
	for (let x = -1; x <= mapWidth + 1; x++) {
		map.get(`${x}:-1`).isWall = true;
		map.get(`${x}:0`).isWall = true;
		map.get(`${x}:${mapHeight - 1}`).isWall = true;
		map.get(`${x}:${mapHeight}`).isWall = true;
	}
	let random = Math.floor(Math.random() * 3);
	switch (random) {
		case 0:
			placeBlock(0, 0, 'start00');
			break;
		case 1:
			placeBlock(0, 0, 'start01');
			break;
		case 2:
			placeBlock(0, 0, 'start10');
			break;
	}
	random = Math.floor(Math.random() * 3);
	switch (random) {
		case 0:
			placeBlock(mapWidth - 3, mapHeight - 3, 'finish00');
			break;
		case 0:
			placeBlock(mapWidth - 3, mapHeight - 3, 'finish01');
			break;
		case 0:
			placeBlock(mapWidth - 3, mapHeight - 3, 'finish10');
			break;
	}

	for (let x = 1; x < mapWidth; x++) {
		map.set(`${x}:2`, {isGenerated: true, isWall: false});
		map.set(`${x}:${mapHeight - 3}`, {isGenerated: true, isWall: false});
	}
	for (let y = 0; y <= mapHeight; y++) {
		map.set(`${mapWidth - 1}:${y}`, {isGenerated: true, isWall: true});
	}
	for (let x = 1; x < mapWidth; x++) {
		if (x % 3 == 0) {
			map.set(`${x - 1}:${mapWidth - 3}`, {isGenerated: true, isWall: false});
		} else {
			map.set(`${x - 1}:${mapWidth - 3}`, {isGenerated: true, isWall: true});
		}
	}
	finish.x = mapWidth - 2;
	finish.y = mapHeight - 2;
	map.set(`${finish.x}:${finish.y}`, {isGenerated: true, isWall: false});
	map.set(`${finish.x - 1}:${finish.y}`, {isGenerated: true, isWall: false});
	map.set(`${finish.x - 1}:${finish.y - 1}`, {isGenerated: true, isWall: false});
	map.set(`${finish.x}:${finish.y - 1}`, {isGenerated: true, isWall: false});
	map.set(`${player.x}:${player.y}`, {isGenerated: true, isWall: false});
	map.set(`${player.x}:${player.y + 1}`, {isGenerated: true, isWall: false});
	map.set(`${player.x + 1}:${player.y + 1}`, {isGenerated: true, isWall: false});
	map.set(`${player.x + 1}:${player.y}`, {isGenerated: true, isWall: false});
	map.set(`${mapWidth - 4}:${mapHeight - 6}`, {isGenerated: true, isWall: false});
	map.set(`${mapWidth - 4}:${mapHeight - 4}`, {isGenerated: true, isWall: false});

	for (let i = 0; i < 10; i++) {
		let rx, ry;
		rx = Math.floor(Math.random() * mapWidth);
		ry = Math.floor(Math.random() * mapHeight);
		if (!map.get(`${rx}:${ry}`).isWall) {
			coins[i] = {
				x: rx,
				y: ry,
			};
		} else {
			i--;
		}
	}

	redraw();
	changeButtonsAvaliablity();
}

// Включает/выключает кнопки управления в за-
// висимости от возможности их использования
function changeButtonsAvaliablity() {
	if (map.get(`${player.x}:${player.y - 1}`).isWall) {
		up.disabled = true;
	} else {
		up.disabled = false;
	}

	if (map.get(`${player.x + 1}:${player.y}`).isWall) {
		right.disabled = true;
	} else {
		right.disabled = false;
	}

	if (map.get(`${player.x}:${player.y + 1}`).isWall) {
		down.disabled = true;
	} else {
		down.disabled = false;
	}

	if (map.get(`${player.x - 1}:${player.y}`).isWall) {
		left.disabled = true;
	} else {
		left.disabled = false;
	}
}

function redraw() {
	score.value = `Score: ${player.points} (+${player.timePoints}), completed ${player.level - 1} levels`;

	clearScreen();
	for (let y = 0; y < mapHeight; y++) {
		for (let x = 0; x < mapWidth; x++) {
			if (map.get(`${x}:${y}`).isWall) {
				drawing.putPixel(x, y, 'black');
			}
		}
	}
	drawing.putPixel(player.x, player.y, 'green');
	drawing.putPixel(finish.x, finish.y, 'yellow');
	for (let i = 0; i < coins.length; i++) {
		drawing.putPixel(coins[i].x, coins[i].y, 'gold');
	}
}

function clearScreen() {
	context.fillStyle = 'white';
	context.fillRect(0, 0, mapWidth * box, mapHeight* box);
}

// Обработчик нажатий на кнопки
function onClick(id) {
	writeToLog(`Clicked on ${id}`);
	switch (id) {
		case 'up':
			player.go('up');
			break;
		case 'right':
			player.go('right');
			break;
		case 'down':
			player.go('down');
			break;
		case 'left':
			player.go('left');
			break;
	}
	if ((player.y == finish.y) && (player.x == finish.x)) {
		player.points += player.timePoints;
		generateMap();
		redraw();
	} else {
		redraw();
	}
	changeButtonsAvaliablity();
}

function onKeyPress(key) {
	switch (key) {
		case 87:
			onClick('up');
			break;
		case 65:
			onClick('left');
			break;
		case 83:
			onClick('down');
			break;
		case 68:
			onClick('right');
			break;
	}
}

document.addEventListener('keydown', function(event) {
	onKeyPress(event.keyCode);
});

function switchMusic() {
	sound('bg.mp3', 'play');
}

let timePointsDescreaser = setInterval(function() {
	if (player.timePoints > 10) {
		player.timePoints--;
		redraw();
	}
}, 1000);

function onload() {

}

document.addEventListener('DOMContentLoaded', onload);

generateMap();
redraw();
