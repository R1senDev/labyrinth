// Настройка холста и других объектов
const score = document.getElementById('score');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const up = document.getElementById('up');
const right = document.getElementById('right');
const down = document.getElementById('down');
const left = document.getElementById('left');
const sounds = document.getElementById('sounds');
// Массив с монетами
let coins = [];
// Массив с парами порталов
let portalPairs = [];
// Массив с катапультами
let catapult = [];
// Массив с бомбами
let bombs = [];
// Кол-во игровых объектов
let coinsCount = 10;
let portalPairsCount = 1;
let catapultCount = 2;
let bombsCount = 10;
// Прочие настройки. Балуйся.
let debug = false;
let bugInfo = false;
let gameMode = 'classic';
let box = 5;
let mapWidth = 69;
let mapHeight = 69;
canvas.width = mapWidth * box;
canvas.height = mapHeight * box;
// Другое, ни на что не влияет
let highlighting = false;

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

// Коллекция с картой
let map = new Map();

function isFree(x, y) {
	for (let i of coins) {
		if ((i.x == x) && (i.y == y)) {
			return false;
		}
	}
	for (let i of portalPairs) {
		if (((i.x1 == x) && (i.y1 == y)) || ((i.x2 == x) && (i.y2 == y))) {
			return false;
		}
	}
	for (let i of catapult) {
		if ((i.x == x) && (i.y == y)) {
			return false;
		}
	}
	return true;
}

function disableAllButtons() {
	up.disabled = true;
	right.disabled = true;
	down.disabled = true;
	left.disabled = true;
}

// Функция-конструктор пары порталов
function PortalPair() {
	let x = 0;
	let y = 0;
	while ((map.get(`${x}:${y}`).isWall) || (!isFree(x, y))) {
		x = Math.floor(Math.random() * mapWidth);
		y = Math.floor(Math.random() * mapHeight);		
	}
	this.x1 = x;
	this.y1 = y;
	map.set(`${x}:${y - 1}`, {isWall: false, isGenerated: true});
	map.set(`${x + 1}:${y}`, {isWall: false, isGenerated: true});
	map.set(`${x}:${y + 1}`, {isWall: false, isGenerated: true});
	map.set(`${x - 1}:${y}`, {isWall: false, isGenerated: true});

	x = 0;
	y = 0;
	while ((map.get(`${x}:${y}`).isWall) || (!isFree(x, y))) {
		x = Math.floor(Math.random() * mapWidth);
		y = Math.floor(Math.random() * mapHeight);		
	}
	this.x2 = x;
	this.y2 = y;
	map.set(`${x}:${y - 1}`, {isWall: false, isGenerated: true});
	map.set(`${x + 1}:${y}`, {isWall: false, isGenerated: true});
	map.set(`${x}:${y + 1}`, {isWall: false, isGenerated: true});
	map.set(`${x - 1}:${y}`, {isWall: false, isGenerated: true});
}

// Функция-конструктор катапульты
function Catapult_() {
	let x = 0;
	let y = 0;
	while ((map.get(`${x}:${y}`).isWall) || (!isFree(x, y))) {
		x = Math.floor(Math.random() * mapWidth);
		y = Math.floor(Math.random() * mapHeight);
	}
	this.x = x;
	this.y = y;
	x = Math.floor(Math.random() * 4);
	switch (x) {
		case 0:
			this.activate = function() {
				disableAllButtons();
				player.y--;
				map.set(`${player.x}:${player.y}`, {isWall: false, isGenerated: true});
				let catapultInterval = setInterval(function() {
					if (!map.get(`${player.x}:${player.y - 1}`).isWall) {
						player.go('up');
						disableAllButtons();
					} else {
						clearInterval(catapultInterval);
						changeButtonsAvaliablity();
					}
					redraw();
				}, 100);
			}
			break;
		case 1:
			this.activate = function() {
				disableAllButtons();
				player.x++;
				map.set(`${player.x}:${player.y}`, {isWall: false, isGenerated: true});
				let catapultInterval = setInterval(function() {
					if (!map.get(`${player.x + 1}:${player.y}`).isWall) {
						player.go('right');
						disableAllButtons();
					} else {
						clearInterval(catapultInterval);
						changeButtonsAvaliablity();
					}
					redraw();
				}, 100);
			}
			break;
		case 2:
			this.activate = function() {
				disableAllButtons();
				player.x--;
				let catapultInterval = setInterval(function() {
					if (!map.get(`${player.x}:${player.y + 1}`).isWall) {
						player.go('down');
						disableAllButtons();
					} else {
						clearInterval(catapultInterval);
						changeButtonsAvaliablity();
					}
					redraw();
				}, 100);
			}
			break;
		case 3:
			this.activate = function() {
				disableAllButtons();
				player.x--;
				map.set(`${player.x}:${player.y}`, {isWall: false, isGenerated: true});
				let catapultInterval = setInterval(function() {
					if (!map.get(`${player.x - 1}:${player.y}`).isWall) {
						player.go('left');
						disableAllButtons();
					} else {
						clearInterval(catapultInterval);
						changeButtonsAvaliablity();
					}
					redraw();
				}, 100);
			}
			break;
	}
}

// Не поверишь... функция-конструктор бомбы
function Bomb() {
	let x = 0;
	let y = 0;
	while ((map.get(`${x}:${y}`).isWall) || (!isFree(x, y))) {
		x = Math.floor(Math.random() * mapWidth);
		y = Math.floor(Math.random() * mapHeight);
	}
	this.x = x;
	this.y = y;
	delete x;
	delete y;

	this.activate = function() {
		for (let y = this.y - 5; y <= this.y + 5; y++) {
			map.set(`${this.x}:${y}`, {isWall: false, isGenerated: true});
		}
		for (let y = this.y - 4; y <= this.y + 4; y++) {
			for (let x = this.x - 2; x <= this.x + 2; x++) {
				map.set(`${x}:${y}`, {isWall: false, isGenerated: true});
			}
		}
		for (let y = this.y - 3; y <= this.y + 3; y++) {
			for (let x = this.x - 3; x <= this.x + 3; x++) {
				map.set(`${x}:${y}`, {isWall: false, isGenerated: true});
			}
		}
		for (let y = this.y - 2; y <= this.y + 2; y++) {
			for (let x = this.x - 4; x <= this.x + 4; x++) {
				map.set(`${x}:${y}`, {isWall: false, isGenerated: true});
			}
		}
		for (let x = this.x - 5; x <= this.x + 5; x++) {
			map.set(`${x}:${this.y}`, {isWall: false, isGenerated: true});
		}
		this.x = -1;
		this.y = -1;
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
	}
}

// Определение содержимого карты
function defineMapContent() {
	for (let y = -2; y <= mapHeight + 2; y++) {
		for (let x = -2; x <= mapWidth + 2; x++) {
			map.set(`${x}:${y}`, {isWall: false, isGenerated: false});
		}
	}
}

// Воспроизведение SFX
function playSound(path) {
	if (sounds.checked) {
		var sound = new Audio();
		sound.src = path;
		sound.autoplay = true;
	}
}

// Игрок
let player = {
	x: 1,
	y: 1,
	points: 0,
	timePoints: 100,
	level: 0,
	// Для отладки
	get pos() {
		return `${player.x}:${player.y}`;
	},
	go: function(dir) {
		switch (dir) {
			case 'up':
				if (!map.get(`${player.x}:${player.y - 1}`).isWall) {
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
		for (let i of portalPairs) {
			if ((player.x == i.x1) && (player.y == i.y1)) {
				player.x = i.x2;
				player.y = i.y2;
				player.go(dir);
				playSound('portal.mp3');
			} else {
				if ((player.x == i.x2) && (player.y == i.y2)) {
					player.x = i.x1;
					player.y = i.y1;
					player.go(dir);
					playSound('portal.mp3');
				}
			}
		}
		for (let i of catapult) {
			if ((player.x == i.x) && (player.y == i.y)) {
				i.activate();
				playSound('catapult.mp3');
			}
		}
		for (let i of bombs) {
			if ((player.x == i.x) && (player.y == i.y)) {
				i.activate();
				playSound('bomb.mp3');
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

// Генерирует области карты
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

// Генерирует карту. Версия генератора: v2.4
function generateMap() {
	player.level++;
	if (player.level > 1) {
		playSound(`win.mp3`);
	}
	player.timePoints = 100;
	player.x = 1;
	player.y = 1;
	defineMapContent();
	let mask;
	for (let y = 1; y < mapHeight; y += 3) {
		for (let x = 1; x < mapWidth; x += 3) {
			mask = 'XXXX';
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
			// них всё работает, но я не знаю, по-
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

	if (gameMode != 'zen') {
		finish.x = mapWidth - 2;
		finish.y = mapHeight - 2;
		map.set(`${finish.x}:${finish.y}`, {isGenerated: true, isWall: false});
		map.set(`${finish.x - 1}:${finish.y}`, {isGenerated: true, isWall: false});
		map.set(`${finish.x - 1}:${finish.y - 1}`, {isGenerated: true, isWall: false});
		map.set(`${finish.x}:${finish.y - 1}`, {isGenerated: true, isWall: false});
	} else {
		finish.x = -1;
		finish.y = -1;
	}

	map.set(`${player.x}:${player.y}`, {isGenerated: true, isWall: false});
	map.set(`${player.x}:${player.y + 1}`, {isGenerated: true, isWall: false});
	map.set(`${player.x + 1}:${player.y + 1}`, {isGenerated: true, isWall: false});
	map.set(`${player.x + 1}:${player.y}`, {isGenerated: true, isWall: false});
	map.set(`${mapWidth - 4}:${mapHeight - 6}`, {isGenerated: true, isWall: false});
	map.set(`${mapWidth - 4}:${mapHeight - 4}`, {isGenerated: true, isWall: false});

	for (let i = 0; i < coinsCount; i++) {
		let rx, ry;
		rx = Math.floor(Math.random() * mapWidth);
		ry = Math.floor(Math.random() * mapHeight);
		if ((!map.get(`${rx}:${ry}`).isWall) && (isFree(rx, ry))) {
			coins[i] = {
				x: rx,
				y: ry,
			};
		} else {
			i--;
		}
	}

	for (let i = 0; i <= portalPairsCount; i++) {
		portalPairs[i] = new PortalPair();
	}
	for (let i = 0; i <= catapultCount; i++) {
		catapult[i] = new Catapult_();
	}
	for (let i = 0; i <= bombsCount; i++) {
		bombs[i] = new Bomb();
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

// Рендерит
// .
function redraw() {
	switch (gameMode) {
		case 'classic':
			score.value = `Score: ${player.points} (+${player.timePoints}), completed ${player.level - 1} level(s)`;
			break;
		case '':
			score.value = `Score: ${player.points} (${player?.timer}s left), completed ${player.level - 1} level(s)`;
			break;
		case 'zen':
			score.value = `Collected ${player.points / 10} coin(s)`;
			break;
	}

	clearScreen();
	for (let y = 0; y < mapHeight; y++) {
		for (let x = 0; x < mapWidth; x++) {
			if (map.get(`${x}:${y}`).isWall) {
				drawing.putPixel(x, y, 'black');
			}
		}
	}
	drawing.putPixel(finish.x, finish.y, 'cyan');
	for (let i of coins) {
		drawing.putPixel(i.x, i.y, 'gold');
	}
	for (let i of portalPairs) {
		drawing.putPixel(i.x1, i.y1, 'purple');
		drawing.putPixel(i.x2, i.y2, 'purple');
	}
	for (let i of catapult) {
		drawing.putPixel(i.x, i.y, 'blue');
	}
	for (let i of bombs) {
		drawing.putPixel(i.x, i.y, 'red');
	}
	if (highlighting) {
		for (let y = player.y - 4; y <= player.y + 4; y++) {
			for (let x = player.x - 4; x <= player.x + 4; x++) {
				drawing.putPixel(x, y, 'green');
			}
		}
	} else {
		drawing.putPixel(player.x, player.y, 'green');
	}
}

// Очищает экран
function clearScreen() {
	context.fillStyle = 'white';
	context.fillRect(0, 0, mapWidth * box, mapHeight* box);
}

// Обработчик нажатий на кнопки
function onClick(id) {
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
	if ((levelConstructorIsOpened) && (!bugInfo)) {
		alert('The developer found this bug almost immediately after it appeared, but he is too lazy to fix it, so you just have to accept it as a feature.\nOr just close the unfinished level creation section and forget about this dialog window.')
		bugInfo = true;
	}
	changeButtonsAvaliablity();
}

// Обработчик нажатий на клавиши
function onKeyPress(key) {
	if (document.getElementById('keyboard').checked) {
		switch (key) {
			case 87:
				if (!up.disabled) {
					onClick('up');
				}
				break;
			case 68:
				if (!right.disabled) {
					onClick('right');
				}
				break;
			case 83:
				if (!down.disabled) {
					onClick('down');
				}
				break;
			case 65:
				if (!left.disabled) {
					onClick('left');
				}
				break;
			case 82:
				highlighting = true;
				redraw();
				break;
		}
	}

	if (document.getElementById('gamepad').checked) {
		if (document.getElementById('dpad').checked) {
			switch (key) {
				case 12:
					if (!up.disabled) {
						onClick('up');
					}
					break;
				case 15:
					if (!right.disabled) {
						onClick('right');
					}
					break;
				case 13:
					if (!down.disabled) {
						onClick('down');
					}
					break;
				case 14:
					if (!left.disabled) {
						onClick('left');
					}
					break;
				case 5:
					highlighting = true;
					redraw();
					break;
			}
		}

		if (document.getElementById('facebuttons').checked) {
			switch (key) {
				case 3:
					if (!up.disabled) {
						onClick('up');
					}
					break;
				case 1:
					if (!right.disabled) {
						onClick('right');
					}
					break;
				case 0:
					if (!down.disabled) {
						onClick('down');
					}
					break;
				case 2:
					if (!left.disabled) {
						onClick('left');
					}
					break;
				case 4:
					highlighting = true;
					redraw();
					break;
			}
		}
	}
}

document.addEventListener('keydown', function(event) {
	onKeyPress(event.keyCode);
});
document.addEventListener('keyup', function(event) {
	if (event.keyCode == 82) {
		highlighting = false;
		redraw();
	}
});

let timePointsDescreaser = setInterval(function() {
	if (player.timePoints > 10) {
		player.timePoints--;
		redraw();
	}
}, 1000);

function onload() {

}

document.addEventListener('DOMContentLoaded', onload);

function changeGameMode(to) {
	if ((player.points == 0) || (confirm('Are you sure you want to change the game mode? The score will be reset and the map will be regenerated.'))) {
		player.level = 0;
		switch (to) {
			case 'classic':
				gameMode = 'classic';
				player.points = 0;
				generateMap();
				break;
			case 'gravity':
				gameMode = 'gravity';
				player.points = 0;
				generateMap();
				break;
			case 'zen':
				gameMode = 'zen';
				player.points = 0;
				generateMap();
				break;
		}
	} else {
		switch (gameMode) {
			case 'classic':
				document.getElementById('classic').checked = true;
				break;
			case 'timer':
				document.getElementById('timer').checked = true;
				break;
			case 'zen':
				document.getElementById('zen').checked = true;
				break;
		}
	}
}

function controlsHelp() {
	if (document.getElementById('keyboard').checked) {
		alert('The keyboard control type is selected\nControls:\n[W]/[A]/[S]/[D] - walking up/left/down/right;\n[R] (hold) - contrast lighting of the character');
	}
	if (document.getElementById('gamepad').checked) {
		if (document.getElementById('dpad').checked) {
			alert('The control type is selected using the directional pad of the gamepad\nControls:\n D-pad (directional pad) - walking;\n[RB] (hold) - contrast lighting of the character');
		}
		if (document.getElementById('facebuttons').checked) {
			alert('The control type is selected using the face buttons of the gamepad\nControls:\n[Y]/[B]/[A]/[X] - walking up/left/down/right;\n[LB] (hold) - contrast lighting of the character');
		}
	}
}

let levelConstructorIsOpened = false;
function openLevelConstructor() {
	if (!levelConstructorIsOpened) {
		disableAllButtons();
		document.getElementById('levelconstructor').hidden = false;
		levelConstructorIsOpened = true;
	} else {
		changeButtonsAvaliablity();
		document.getElementById('levelconstructor').hidden = true;
		levelConstructorIsOpened = false;
	}
}

function switchTheme() {
	if (document.getElementById('darktheme').checked) {
		theme = 'dark';
	}
}

generateMap();
setInterval(function() {
	if (gameMode == 'gravity') {
		player.go('down');
		changeButtonsAvaliablity();
		redraw();
	}
}, 500);
redraw();
