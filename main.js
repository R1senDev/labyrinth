// Настройка холста
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
// Настройка кнопок управления
const up = document.getElementById('up');
const right = document.getElementById('right');
const down = document.getElementById('down');
const left = document.getElementById('left');
// Прочие настройки. Балуйся.
let debug = true;
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

// Игрок
let player = {
	x: 1,
	y: 1,
	points: 0,
	timePoints: 100,
	// Каждую секунду уменьшает timePoints на 1
	timePointsDescreaser: setInterval(function() {
		if (player.timePoints <= 10) {
			timePoints--;
		}
	}, 1000),
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
		case 'finish01':
			map.get(`${x}:${y + 2}`).isWall = true;
			map.get(`${x + 2}:${y + 1}`).isWall = true;
			map.get(`${x + 2}:${y}`).isWall = true;
			map.get(`${x + 2}:${y + 2}`).isWall = true;
			break;
	}
}

// Генерирует карту. Версия генератора: v2.2
function generateMap() {
	let mask;
	for (let y = 1; y < mapHeight; y += 3) {
		for (let x = 1; x < mapWidth; x += 3) {
			if (debug) {
				writeToLog(`x == ${x}\ny == ${y}`);
			}
			mask = 'XXXX';
			if (debug) {
				writeToLog(`mask == ${mask}`);
			}
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
			// Комменты - костыли, не дергать
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
	redraw();
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
		leteft.disabled = false;
	}
}

function redraw() {
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
	if (player.isFinished) {
		player.points += player.timePoints;
		redraw();
	} else {
		redraw();
	}
}

defineMapContent();
generateMap();
redraw();
