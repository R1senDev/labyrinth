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
let timeoutError = new Error();
timeoutError.name = 'TimeoutError';
timeoutError.message = 'The map has been generated for too long';
let box = 5;
let mapWidth = 70;
let mapHeight = 70;
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
// Массив штуковин-бегающих-по-карте-и-генерирующих
// лабиринт
let generators = [new Generator(7, 7)];

// Определение содержимого карты и резервация места
// на нее
function defineMapContent() {
	for (let y = -2; y <= mapHeight + 2; y++) {
		for (let x = -2; x <= mapWidth + 2; x++) {
			map.set(`${x}:${y}`, {isWall: false, isGenerated: false});
		}
	}
	// Костыль. Выдёргивать пока что нельзя.
	map.set('NaN:0', {isWall: true, isGenerated: true});
	map.set('0:NaN', {isWall: true, isGenerated: true});
	map.set('NaN:NaN', {isWall: true, isGenerated: true});
}

// Функция-конструктор штуковин-бегающих-по-карте-и-
// генерирующих-лабиринт (далее ШБпКиГЛ), создающих-
// ся от другой ШБпКиГЛ
function Generator(parentGeneratorId) {
	// Не осуждайте
	if ((!map.get(`${parentGeneratorId.x}:${parentGeneratorId.y - 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x}:${parentGeneratorId.y - 1}`).isWall)) {
		this.x = parentGeneratorId.x;
		this.y = parentGeneratorId.y - 1;
	} else {
		if ((!map.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y - 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y - 1}`).isWall)) {
			this.x = parentGeneratorId.x + 1;
			this.y = parentGeneratorId.y - 1;
		} else {
			if ((!map.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y}`).isGenerated) && (!map.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y}`).isWall)) {
				this.x = parentGeneratorId.x + 1;
				this.y = parentGeneratorId.y;
			} else {
				if ((!map.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y + 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y + 1}`).isWall)) {
					this.x = parentGeneratorId.x + 1;
					this.y = parentGeneratorId.y + 1;
				} else {
					if ((!map.get(`${parentGeneratorId.x}:${parentGeneratorId.y + 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x}:${parentGeneratorId.y + 1}`).isWall)) {
						this.x = parentGeneratorId.x;
						this.y = parentGeneratorId.y + 1;
					} else {
						if ((!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isWall)) {
							this.x = parentGeneratorId.x - 1;
							this.y = parentGeneratorId.y + 1;
						} else {
							if ((!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isWall)) {
								this.x = parentGeneratorId.x - 1;
								this.y = parentGeneratorId.y + 1;
							} else {
								if ((!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y}`).isGenerated) && (!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y}`).isWall)) {
									this.x = parentGeneratorId.x - 1;
									this.y = parentGeneratorId.y;
								} else {
									if ((!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y - 1}`).isGenerated) && (!map.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y - 1}`).isWall)) {
										this.x = parentGeneratorId.x - 1;
										this.y = parentGeneratorId.y - 1;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	this.cameFrom = '';
}

// Функция-конструктор ШБпКиГЛ, создающихся в коор-
// динатах (x, y)
function Generator(x, y) {
	this.x = x;
	this.y = y;
	this.cameFrom = '';
}

// Перемещает ШБпКиГЛ
function generatorGo(dir, id) {
	switch (dir) {
		case 'up':
			generators[id].y -= 2;
			generators[id].cameFrom = 'down';
			break;
		case 'right':
			generators[id].x += 2;
			generators[id].cameFrom = 'down';
			break;
		case 'down':
			generators[id].y += 2;
			generators[id].cameFrom = 'down';
			break;
		case 'left':
			generators[id].x -= 2;
			generators[id].cameFrom = 'down';
			break;
	}

	for (let x = generators[id].x - 1; x <= generators[id].x + 1; x++) {
		for (let y = generators[id].y - 1; y <= generators[id].y + 1; y++) {
			map.set(`${x}:${y}`, {isGenerated: true, isWall: true});
		}
	}

	map.get(`${generators[id].x}:${generators[id].y}`).isWall = false;
	
	switch (generators[id].cameFrom) {
		case 'up':
			map.get(`${generators[id].x}:${generators[id].y + 1}`).isWall = false;
			break;
		case 'right':
			map.get(`${generators[id].x + 1}:${generators[id].y}`).isWall = false;
			break;
		case 'down':
			map.get(`${generators[id].x}:${generators[id].y - 1}`).isWall = false;
			break;
		case 'left':
			map.get(`${generators[id].x - 1}:${generators[id].y}`).isWall = false;
			break;
	}
}

// Делит ШБпКиГЛ
function splitGenerator(id) {
	if (Math.random() <= 1) {
		generators.push(new Generator(id));
	}
}

// Убивает ШБпКиГЛ
function killGenerator(id) {
	for (let i = id; i < generators.length; i++) { // generators.length - 1?
		generators[i] = generators[i + 1];
	}

	generators.pop();
}

// Обрабатывает ШБпКиГЛ 
function executeGenerator(id) {
	// Такая конструкция, использованная вместо or, не
	// замедляет работу
	writeToLog(`Reading ${generators[id].x}:${generators[id].y - 2}...`);
	if ((!map.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
		let ok = false;
		let random;
		while (!ok) {
			random = Math.floor(Math.random() * 4);
			switch (random) {
				case 0:
					if ((!map.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
						generatorGo('up', id);
						ok = true;
					}
					break;
				case 1:
					if ((!map.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('right', id);
						ok = true;
					}
					break;
				case 2:
					if ((!map.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
						generatorGo('down', id);
						ok = true;
					}
					break;
				case 3:
					if ((!map.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('left', id);
						ok = true;
					}
					break;
			}
		}
	}

	try {
		if ((!map.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
			let ok = false;
			let random;
			while (!ok) {
				random = Math.floor(Math.random() * 4);
				switch (random) {
					case 0:
						if ((!map.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
							generatorGo('up', id);
							ok = true;
						}
						break;
					case 1:
						if ((!map.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
							generatorGo('right', id);
							ok = true;
						}
						break;
					case 2:
						if ((!map.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
							generatorGo('down', id);
							ok = true;
						}
						break;
					case 3:
						if ((!map.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
							generatorGo('left', id);
							ok = true;
						}
						break;
				}
			}
		}

		if ((!map.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
			let ok = false;
			let random;
			while (!ok) {
				random = Math.floor(Math.random() * 4);
				switch (random) {
					case 0:
						if ((!map.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
							generatorGo('up', id);
							ok = true;
						}
						break;
					case 1:
						if ((!map.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
							generatorGo('right', id);
							ok = true;
						}
						break;
					case 2:
						if ((!map.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
							generatorGo('down', id);
							ok = true;
						}
						break;
					case 3:
						if ((!map.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
							generatorGo('left', id);
							ok = true;
						}
						break;
				}
			}
		}

		if ((!map.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
			let ok = false;
			let random;
			while (!ok) {
				random = Math.floor(Math.random() * 4);
				switch (random) {
					case 0:
						if ((!map.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
							generatorGo('up', id);
							ok = true;
						}
						break;
					case 1:
						if ((!map.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
							generatorGo('right', id);
							ok = true;
						}
						break;
					case 2:
						if ((!map.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!map.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
							generatorGo('down', id);
							ok = true;
						}
						break;
					case 3:
						if ((!map.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!map.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
							generatorGo('left', id);
							ok = true;
						}
						break;
				}
			}
			splitGenerator(id);
		} else {
			killGenerator(id);
		}
	} catch {}
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
		if ((finish.x == player.x) && (finish.y == player.y)) {
			return true;
		} else {
			return false;
		}
	},
	go: function(dir) {
		writeToLog(`In progress: player.go(${dir})`);
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

// Генерирует карту. Версия генератора: v1
function generateMap() {
	let generationTimer = setTimeout(function() {
		throw timeoutError;
	}, 5000);
	for (let i of map.keys()) {
		map.get(i).isGenerated = false;
	}

	for (let y = -1; y < mapHeight + 1; y++) {
		map.get(`-1:${y}`).isWall = true;
		map.get(`0:${y}`).isWall = true;
		map.get(`${mapWidth - 1}:${y}`).isWall = true;
		map.get(`${mapWidth}:${y}`).isWall = true;
	}
	for (let x = -1; x < mapWidth + 1; x++) {
		map.get(`${x}:-1`).isWall = true;
		map.get(`${x}:0`).isWall = true;
		map.get(`${x}:${mapHeight - 1}`).isWall = true;
		map.get(`${x}:${mapHeight}`).isWall = true;
	}

	while (generators.length > 0) {
		for (let i = 0; i < generators.length; i++) {
			if (debug) {
				alert('...');
			}
			executeGenerator(i);
		}
		writeToLog(`Generators have been updated, ${generators.length} are alive`);
	}

	finish.setFinish();
	player.timePoints = 100;
	clearTimeout(generationTimer);
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

function fastRedraw() {
	for (let y = player.y - 1; y <= player.y + 1; y++) {
		for (let x = player.x - 1; x <= player.x + 1; x++) {
			if (map.get(`${x}:${y}`).isWall) {
				drawing.putPixel(x, y, 'black');
			} else {
				drawing.putPixel(x, y, 'white');
			}
		}
	}
	drawing.putPixel(player.x, player.y, 'green');
	drawing.putPixel(finish.x, finish.y, 'yellow');
}

function clearScreen() {
	drawing.fillRectByAngle(0, 0, mapWidth, mapHeight);
}

// Обработчик нажатий на кнопки
function onClick(id) {
	writeToLog(`Clicked on ${id}`);
	switch (id) {
		case 'up':
			writeToLog('player.go(\'up\')');
			player.go('up');
			break;
		case 'right':
			writeToLog('player.go(\'right\')');
			player.go('right');
			break;
		case 'down':
			writeToLog('player.go(\'down\')');
			player.go('down');
			break;
		case 'left':
			writeToLog('player.go(\'left\')');
			player.go('left');
			break;
	}
	if (player.isFinished) {
		player.points += player.timePoints;
		//generateMap();
		//player.x = 1;
		//player.y = 1;
		redraw();
	} else {
		fastRedraw();
	}
}

defineMapContent();
//generateMap();
redraw();
