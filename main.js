// Настраиваем холст
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Коллекция с картой
let map = new Map();
// Массив штуковин-бегающих-по-карте-и-генерирующих
// лабиринт
let generators = [new Generator(1, 1)];

// Функция-конструктор штуковин-бегающих-по-карте-и-
// генерирующих-лабиринт (далее ШБпКиГЛ)
function Generator(parentGeneratorId) {
	// Не осуждайте
	if ((!world.get(`${parentGeneratorId.x}:${parentGeneratorId.y - 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x}:${parentGeneratorId.y - 1}`).isWall)) {
		this.x = parentGeneratorId.x;
		this.y = parentGeneratorId.y - 1;
	} else {
		if ((!world.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y - 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y - 1}`).isWall)) {
			this.x = parentGeneratorId.x + 1;
			this.y = parentGeneratorId.y - 1;
		} else {
			if ((!world.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y}`).isGenerated) && (!world.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y}`).isWall)) {
				this.x = parentGeneratorId.x + 1;
				this.y = parentGeneratorId.y;
			} else {
				if ((!world.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y + 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x + 1}:${parentGeneratorId.y + 1}`).isWall)) {
					this.x = parentGeneratorId.x + 1;
					this.y = parentGeneratorId.y + 1;
				} else {
					if ((!world.get(`${parentGeneratorId.x}:${parentGeneratorId.y + 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x}:${parentGeneratorId.y + 1}`).isWall)) {
						this.x = parentGeneratorId.x;
						this.y = parentGeneratorId.y + 1;
					} else {
						if ((!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isWall)) {
							this.x = parentGeneratorId.x - 1;
							this.y = parentGeneratorId.y + 1;
						} else {
							if ((!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y + 1}`).isWall)) {
								this.x = parentGeneratorId.x - 1;
								this.y = parentGeneratorId.y + 1;
							} else {
								if ((!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y}`).isGenerated) && (!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y}`).isWall)) {
									this.x = parentGeneratorId.x - 1;
									this.y = parentGeneratorId.y;
								} else {
									if ((!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y - 1}`).isGenerated) && (!world.get(`${parentGeneratorId.x - 1}:${parentGeneratorId.y - 1}`).isWall)) {
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

function Generator(x, y) {
	this.x = x;
	this.y = y;
	this.cameFrom = '';
}

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
	world.get(`${generators[id].x}:${generators[id].y}`).isWall = false;
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

function splitGenerator(id) {
	if (Math.random() <= 0.3) {
		generators.push(new Generator(id));
	}
}

function killGenerator(id) {
	for (let i = id; i < generators.length; i++) { // generators.length - 1?
		generators[i] = generators[i + 1];
	}
	generators.pop();
}

function executeGenerator(id) {
	// Такая конструкция, использованная вместо or, не
	// замедляет работу
	if ((!world.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
		let ok = false;
		let random;
		while (!ok) {
			random = Math.floor(Math.random() * 4);
			switch (random) {
				case 0:
					if ((!world.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
						generatorGo('up');
						ok = true;
					}
					break;
				case 1:
					if ((!world.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('right');
						ok = true;
					}
					break;
				case 2:
					if ((!world.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
						generatorGo('down');
						ok = true;
					}
					break;
				case 3:
					if ((!world.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('left');
						ok = true;
					}
					break;
			}
		}
	}
	if ((!world.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
		let ok = false;
		let random;
		while (!ok) {
			random = Math.floor(Math.random() * 4);
			switch (random) {
				case 0:
					if ((!world.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
						generatorGo('up');
						ok = true;
					}
					break;
				case 1:
					if ((!world.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('right');
						ok = true;
					}
					break;
				case 2:
					if ((!world.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
						generatorGo('down');
						ok = true;
					}
					break;
				case 3:
					if ((!world.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('left');
						ok = true;
					}
					break;
			}
		}
	}
	if ((!world.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
		let ok = false;
		let random;
		while (!ok) {
			random = Math.floor(Math.random() * 4);
			switch (random) {
				case 0:
					if ((!world.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
						generatorGo('up');
						ok = true;
					}
					break;
				case 1:
					if ((!world.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('right');
						ok = true;
					}
					break;
				case 2:
					if ((!world.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
						generatorGo('down');
						ok = true;
					}
					break;
				case 3:
					if ((!world.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('left');
						ok = true;
					}
					break;
			}
		}
	}
	if ((!world.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
		let ok = false;
		let random;
		while (!ok) {
			random = Math.floor(Math.random() * 4);
			switch (random) {
				case 0:
					if ((!world.get(`${generators[id].x}:${generators[id].y - 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y - 2}`).isGenerated)) {
						generatorGo('up');
						ok = true;
					}
					break;
				case 1:
					if ((!world.get(`${generators[id].x + 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x + 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('right');
						ok = true;
					}
					break;
				case 2:
					if ((!world.get(`${generators[id].x}:${generators[id].y + 2}`).isWall) && (!world.get(`${generators[id].x}:${generators[id].y + 2}`).isGenerated)) {
						generatorGo('down');
						ok = true;
					}
					break;
				case 3:
					if ((!world.get(`${generators[id].x - 2}:${generators[id].y}`).isWall) && (!world.get(`${generators[id].x - 2}:${generators[id].y}`).isGenerated)) {
						generatorGo('left');
						ok = true;
					}
					break;
			}
		}
		splitGenerator(id);
	} else {
		killGenerator(id);
	}
}