/*
Project: Prey Vs Predator
v1.008

Fixes:
- buttons
- timer placement
- soundtrack not playing
- nerfed prey movement speed
- predators behaviours updated
- predators multiplying
- added an info text

Documentation GitHub: https://github.com/px6/prey-vs-predator


How to Interact:
- Click anywhere to spawn a Prey
- Hold X and Click anyywhere to spawn a Predator
- Press the Spacebar to kill a random agent
- Maintain Balance for as long as you can
*/ 

let state = 1; // 1: title, 2: sim, 3: end
let prey = [];
let predators = [];
let preyCount = 10;
let predatorCount = 5;
let soundtrack, despawnSound, spawnSound, tapSound, nomnomSounds;
let pauseButton, resetButton;
let isPaused = false;
let timer = 0;

function preload() {
  soundtrack = loadSound("assets/sound/soundtrack.mp3");
  despawnSound = loadSound("assets/sound/despawn.mp3");
  spawnSound = loadSound("assets/sound/spawn.mp3");
  tapSound = loadSound("assets/sound/tap.mp3");
  nomnomSounds = [
    loadSound("assets/sound/nomnom/nomnom1.mp3"),
    loadSound("assets/sound/nomnom/nomnom2.mp3"),
    loadSound("assets/sound/nomnom/nomnom3.mp3"),
    loadSound("assets/sound/nomnom/nomnom4.mp3"),
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Play soundtrack in loop
  soundtrack.loop();

  // Initialize buttons
  pauseButton = createImg("assets/img/pause.png", "Pause");
  pauseButton.position(width - 60, 10);
  pauseButton.size(32, 32);
  pauseButton.mousePressed(togglePause);

  resetButton = createImg("assets/img/reset.png", "Reset");
  resetButton.position(width - 100, 10);
  resetButton.size(32, 32);
  resetButton.mousePressed(resetSimulation);
}

function draw() {
  if (state === 1) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("PREY VS PREDATOR", width / 2, height / 2 - 20);
    textSize(16);
    text("click anywhere to start the simulation", width / 2, height / 2 + 20);
  } else if (state === 2) {
    background(0);

    timer += deltaTime / 1000; // Update timer

    updateEntities();
    displayEntities();
    displayUI();

    if (prey.length === 0 && predators.length === 0) {
      state = 3;
      despawnSound.play();
    }
  } else if (state === 3) {
    background("#3D0000");
    displayEndScreen();
  }
}

function mousePressed() {
  if (state === 1) {
    state = 2;
    initSimulation();
    tapSound.play();
  } else if (state === 3) {
    state = 2;
    resetSimulation();
    tapSound.play();
  } else if (state === 2) {
    if (keyIsDown(88)) {
      predators.push(new Predator(mouseX, mouseY));
    } else {
      prey.push(new Prey(mouseX, mouseY));
    }
    spawnSound.play();
  }
}

function keyPressed() {
  if (key === ' ') {
    despawnRandomEntity();
  }
}

function initSimulation() {
  for (let i = 0; i < preyCount; i++) {
    prey.push(new Prey(random(width), random(height)));
  }
  for (let i = 0; i < predatorCount; i++) {
    predators.push(new Predator(random(width), random(height)));
  }
}

function resetSimulation() {
  prey = [];
  predators = [];
  timer = 0;
  initSimulation();
}

function updateEntities() {
  if (!isPaused) {
    for (let p of prey) p.update(prey, predators);
    for (let pr of predators) pr.update(prey);
  }
}

function displayEntities() {
  for (let p of prey) p.display();
  for (let pr of predators) pr.display();
}

function displayUI() {
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text(`Prey: ${prey.length}`, 10, 30);
  text(`Predators: ${predators.length}`, 10, 60);
  textAlign(RIGHT);
  text(`${nf(floor(timer / 60), 2)}:${nf(floor(timer % 60), 2)}`, width - 120, 9);

  fill(150);
  textSize(14);
  textAlign(CENTER, TOP);
  text("click to spawn PREY | hold X + click to spawn PREDATOR", width / 2, 10);
}

function displayEndScreen() {
  fill(255);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("Not Bad!", width / 2, height / 2 - 50);
  textSize(32);
  text(`You maintained balance for: ${nf(floor(timer / 60), 2)}:${nf(floor(timer % 60), 2)}`, width / 2, height / 2 + 50);
  textSize(16);
  text("click anywhere to restart", width / 2, height - 50);
}

function despawnRandomEntity() {
  if (prey.length + predators.length === 0) return;

  let totalEntities = prey.length + predators.length;
  let randomIndex = floor(random(totalEntities));

  if (randomIndex < prey.length) {
    prey.splice(randomIndex, 1);
  } else {
    predators.splice(randomIndex - prey.length, 1);
  }
  despawnSound.play();
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    noLoop();
    pauseButton.attribute("src", "assets/img/play.png");
  } else {
    loop();
    pauseButton.attribute("src", "assets/img/pause.png");
  }
}

class Prey {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.size = random(5, 10);
    this.birthTime = millis();
    this.lifespan = random(100000, 180000);
  }

  update(preyArray, predators) {
    this.position.add(this.velocity);
    this.checkEdges();
    this.flee(predators);
    if (millis() - this.birthTime > this.lifespan) {
      this.die(preyArray);
    }
    if (millis() - this.birthTime > 60000 && random() < 0.01) {
      this.reproduce(preyArray);
    }
  }

  display() {
    fill("#00FF99");
    ellipse(this.position.x, this.position.y, this.size);
  }

  checkEdges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  flee(predators) {
    let fleeVector = createVector();
    for (let predator of predators) {
      let distance = this.position.dist(predator.position);
      if (distance < 50) {
        let away = p5.Vector.sub(this.position, predator.position);
        away.setMag(0.5);
        fleeVector.add(away);
      }
    }
    fleeVector.limit(1);
    this.velocity.add(fleeVector);
  }

  reproduce(preyArray) {
    preyArray.push(new Prey(this.position.x, this.position.y));
  }

  die(preyArray) {
    let index = preyArray.indexOf(this);
    if (index > -1) {
      preyArray.splice(index, 1);
      despawnSound.play();
    }
  }
}

class Predator {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.size = random(10, 15);
    this.lastMealTime = millis();
    this.huntInterval = random(60000, 90000);
    this.huntCount = 0;
  }

  update(preyArray) {
    this.position.add(this.velocity);
    this.checkEdges();
    this.hunt(preyArray);
    if (millis() - this.lastMealTime > this.huntInterval) {
      this.die();
    }
  }

  display() {
    fill("#FF0000");
    ellipse(this.position.x, this.position.y, this.size);
  }

  checkEdges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  hunt(preyArray) {
    let closestPrey = null;
    let closestDistance = Infinity;
    for (let i = preyArray.length - 1; i >= 0; i--) {
      let distance = this.position.dist(preyArray[i].position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPrey = preyArray[i];
      }
      if (distance < this.size) {
        nomnomSounds[int(random(nomnomSounds.length))].play();
        preyArray.splice(i, 1);
        this.lastMealTime = millis();
        this.huntCount++;
        if (this.huntCount >= 5 && random() < 0.2) {
          this.reproduce();
        }
      }
    }
    if (closestPrey) {
      let desired = p5.Vector.sub(closestPrey.position, this.position);
      desired.setMag(1);
      this.velocity.add(desired);
      this.velocity.limit(2);
    }
  }

  reproduce() {
    predators.push(new Predator(this.position.x, this.position.y));
    this.huntCount = 0;
  }

  die() {
    let index = predators.indexOf(this);
    if (index > -1) {
      predators.splice(index, 1);
      despawnSound.play();
    }
  }
}