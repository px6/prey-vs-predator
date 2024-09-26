# Prey Vs Predator - Project Documentation

## Simulator Preview

![screenshot](/screenshots/pvp1.gif)
[p5.js Demo](https://editor.p5js.org/alaskiana/sketches/4rdZrbBeP)

## Project Overview

### Goal
The goal of this project is to create a simulation inspired by nature, where autonomous agents (prey and predators) interact and fight for survival. The simulation is gamified to enhance interactivity, providing users with the ability to influence the environment.

### Project Inspiration
Inspired by my previous work on autonomous agents, this project simplifies the concept while introducing gamified elements. The original idea was inspired by AI Predators vs Preys v1.005 alpha.

## Project Structure

### States of Simulation
The simulation consists of three states:

![screenshot](/screenshots/states.png)

1. **Title**
   - A title screen that displays the project name.
   - Plays the soundtrack in a loop.
   - Click anywhere to start the simulation.

2. **Simulation (Sim)**
   - The main simulation where prey and predators interact.
   - Displays the number of prey and predators.
   - Allows user interaction to spawn prey and predators.
   - Plays various sound effects based on interactions.

3. **End**
   - Displayed when no agents are left alive.
   - Shows the total time the simulation ran.
   - Click anywhere to restarts the simulation (sim) 

### Sound and Media Files
- **Soundtrack**: A continuous loop of background music that enhances the immersive experience.
- **Sound Effects**: Various sounds for spawning, despawning, and interactions between agents.

![screenshot](/screenshots/sounds.png)

### Agent Behavior
- **Prey**:
  - Move randomly and flee when a predator is nearby.
  - Have a lifespan and can reproduce after a certain time.
- **Predators**:
  - Hunt prey and increase speed when pursuing.
  - Reproduce after consuming a certain number of prey.
  - Despawn if they do not hunt within a given timeframe.

## Code Structure

### HTML
The HTML file sets up the structure for the simulation, linking to the necessary JavaScript and sound files.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Prey Vs Predator v1.007</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
    <script src="sketch.js"></script>
</head>
<body>
    <audio id="soundtrack" src="assets/sound/soundtrack.mp3" loop></audio>
    <audio id="despawnSound" src="assets/sound/despawn.mp3"></audio>
    <audio id="spawnSound" src="assets/sound/spawn.mp3"></audio>
    <audio id="tapSound" src="assets/sound/tap.mp3"></audio>
    <audio id="nomnom1" src="assets/sound/nomnom/nomnom1.mp3"></audio>
    <audio id="nomnom2" src="assets/sound/nomnom/nomnom2.mp3"></audio>
    <audio id="nomnom3" src="assets/sound/nomnom/nomnom3.mp3"></audio>
    <audio id="nomnom4" src="assets/sound/nomnom/nomnom4.mp3"></audio>
</body>
</html>
````

### JavaScript (sketch.js)
The JavaScript file contains the logic for the simulation, including agent behaviors and user interactions.
#### Initialization and Preloading
```javascript
let state = 1; // 1: title, 2: sim, 3: end
let prey = [];
let predators = [];
let preyCount = 15;
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
````

#### Setup and Drawing
```javascript
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  soundtrack.loop();
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
    displayTitleScreen();
  } else if (state === 2) {
    runSimulation();
  } else if (state === 3) {
    displayEndScreen();
  }
}
````

#### User Interaction
```javascript
function mousePressed() {
  if (state === 1) {
    startSimulation();
  } else if (state === 3) {
    restartSimulation();
  } else if (state === 2) {
    handleUserClick();
  }
}

function keyPressed() {
  if (key === ' ') {
    despawnRandomEntity();
  }
}
````

#### Agent Classes and Behaviors
```javascript
class Prey {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 5));
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
  // Additional methods...
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
  // Additional methods...
}
````

## Work Process

### Initial Concept

The initial concept involved a simulation where autonomous agents (prey and predators) interact in a simple environment. The primary goal was to create a balance between the two types of agents while allowing user interaction.

![screenshot](/screenshots/ui1.png)

![screenshot](/screenshots/ui3.png)
*UI Concepts for the Simulator*


![screenshot](/screenshots/ui2.png)

![screenshot](/screenshots/ui4.png)
*UI Concept for State-3*

### Development Process

1. **Sketching and Conceptualizing**: Initial sketches and concepts were created to visualize the project.
2. **Coding**: The project was developed in phases, starting with the basic structure and gradually adding more features and interactivity.
3. **Testing and Debugging**: Continuous testing and debugging were carried out to ensure smooth functionality and fix any issues. LLM's like gpt-4o and Gemini were used for addressing issues and fixing bugs.
4. **Sound Design**: Custom soundtracks and sound effects were created to enhance the immersive experience.

![screenshot](/screenshots/workspace.png)
*VS Studio Code Workspace*

![screenshot](/screenshots/chords.png)
![screenshot](/screenshots/sfx.png)

*Soundtrack and SFX creation process

### Tools Used
- **p5.js**
- **p5.sound**
- **VS Code**
- **GitHub**
- **Fruity Loops Studio**
- **ChatGpt**
- **Adobe XD**


## Features and Functionality

### Arrays ✔

- Used for managing collections of prey and predators.

### Object Interaction ✔

- Prey and predators interact autonomously based on their behaviors.

### Deletion of Objects from Array ✔

- Agents are removed from arrays when they die or are despawned.

### Media Files (Images, Sound) ✔

- Background music and sound effects are integrated for an immersive experience.

### Pixel Arrays ✖

- Not utilized as it was not necessary for this project.

### Noise Functions (Perlin Noise) ✖

- Not utilized; random functions were sufficient for this project.



## Conclusion

The Prey Vs Predator simulation successfully demonstrates the interaction between autonomous agents in a gamified environment. The project meets the requirements and goals set out initially and provides a foundation for further development and exploration in future projects.
