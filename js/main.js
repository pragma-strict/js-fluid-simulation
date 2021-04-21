
let canvas;

let WORLD_SIZE = 64;
let CELL_SIZE = 8;
let HALF_CELL_SIZE = 8/2;

let cells;
let cellPositionOffset;


function setup() {
  // Initialize some variables
  canvas = createCanvas(windowWidth, windowHeight);
  cellPositionOffset = createVector(round(width/2 - (WORLD_SIZE * CELL_SIZE) /2), round(height/2 - (WORLD_SIZE * CELL_SIZE) /2));
  cells = [];

  // Set up some other stuff
  repositionCanvas();
  initializeCells();
  noStroke();
  render();
}


function initializeCells(){
  for(let i = 0; i < WORLD_SIZE * WORLD_SIZE; i++){
    let value = {
      velocity: createVector(0, 0), 
      density: 0
    };
    cells.push(value);
  }
}


function repositionCanvas()
{
	var x = windowWidth - width;
	var y = windowHeight - height;
	canvas.position(x, y);
  cellPositionOffset = createVector(round(width/2 - (WORLD_SIZE * CELL_SIZE) /2), round(height/2 - (WORLD_SIZE * CELL_SIZE) /2));
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	repositionCanvas();
  cellPositionOffset = createVector(round(width/2 - (WORLD_SIZE * CELL_SIZE) /2), round(height/2 - (WORLD_SIZE * CELL_SIZE) /2));
	render();
}


// A single simulation step
function tick(){
  // Apply mouse velocity to cells
  let cellUnderMouse = screenToCellSpace(createVector(mouseX, mouseY));
  let mouseVelocity = createVector(mouseX - pmouseX, mouseY - pmouseY);
  if(cellUnderMouse != -1 && mouseIsPressed){
    cells[cellUnderMouse].velocity = mouseVelocity.mult(10);
  }

  // Apply density to cells
  if(cellUnderMouse != -1 && mouseIsPressed){
    cells[cellUnderMouse].density = 1;
  }

  diffuseVelocity();
  diffuseDensity();
}


function diffuseVelocity(){
  for(let i = 0; i < cells.length; i++){
    let kernel = getKernelAdjacent(i);
    let velocitySum = createVector(0, 0);
    for(let v = 0; v < kernel.length; v++){
      velocitySum.add(cells[kernel[v]].velocity);
    }
    cells[i].velocity = velocitySum.div(kernel.length);
  }
}


function diffuseDensity(){
  for(let i = 0; i < cells.length; i++){
    let kernel = getKernelAdjacent(i);
    let densitySum = 0;
    for(let v = 0; v < kernel.length; v++){
      densitySum += (cells[kernel[v]].density);
    }
    cells[i].density = densitySum / kernel.length;
  }
}


function draw(){
  tick();
  render();
}


function render()
{
  background(BG_COL);

  // Draw outline around simulation bounds
  stroke(0);
  strokeWeight(1);
  fill(color(0, 0, 0, 0));
  rectMode(CORNER);
  rect(cellPositionOffset.x - HALF_CELL_SIZE, cellPositionOffset.y - HALF_CELL_SIZE, CELL_SIZE * WORLD_SIZE, CELL_SIZE * WORLD_SIZE);

  // Render cell velocities
  for(let i = 0; i < cells.length; i++){
    let cellScreenPos = cellToScreenSpace(i);
    drawVector(cells[i].velocity, cellScreenPos);
  }

  // Render cell densities
  noStroke();
  rectMode(CENTER);
  for(let i = 0; i < cells.length; i++){
    let cellScreenPos = cellToScreenSpace(i);
    fill(color(0, 0, 0, cells[i].density * 255));
    rect(cellScreenPos.x, cellScreenPos.y, CELL_SIZE, CELL_SIZE);
  }

  // Render text
  fill(0);
  noStroke();
  textSize(24);
  text("Vector Field Test", cellPositionOffset.x, cellPositionOffset.y - 15);
  textSize(16);
  text("FPS: " + floor(frameRate()), 
    cellPositionOffset.x + (CELL_SIZE * WORLD_SIZE) - textWidth("FPS: 600"), 
    cellPositionOffset.y + (CELL_SIZE * WORLD_SIZE) - 10);
}


// Return list of immediate neighbors to given cell
function getKernelFull(index){
  let kernel = [
    index,
    getCellUp(index),
    getCellDown(index),
    getCellLeft(index),
    getCellRight(index),
    getCellLeft(getCellUp(index)),
    getCellRight(getCellUp(index)),
    getCellLeft(getCellDown(index)),
    getCellRight(getCellDown(index))
  ];
  return kernel;
}

function getKernelAdjacent(index){
  let kernel = [
    index,
    getCellUp(index),
    getCellDown(index),
    getCellLeft(index),
    getCellRight(index)
  ];
  return kernel;
}

function getCellUp(index){
  return (index - WORLD_SIZE) >= 0 ? (index - WORLD_SIZE) : (index + WORLD_SIZE * (WORLD_SIZE -1) );
}

function getCellDown(index){
  return (index + WORLD_SIZE) < (WORLD_SIZE * WORLD_SIZE) ? (index + WORLD_SIZE) : index % WORLD_SIZE;
}

function getCellRight(index){
  return (index % WORLD_SIZE) != (WORLD_SIZE -1) ? (index + 1) : (index - (WORLD_SIZE -1) );
}

function getCellLeft(index){
  return (index % WORLD_SIZE) != 0 ? (index - 1) : (index + (WORLD_SIZE -1) );
}


function drawVector(vector, position){
  strokeWeight(1);
  stroke(256 - vector.mag()*256 / CELL_SIZE);
  line(position.x, position.y, position.x + vector.x, position.y + vector.y);
}


function colorCell(index, color){
  fill(color);
  let cellCoordinate = cellToScreenSpace(index);
  rect(cellCoordinate.x, cellCoordinate.y, CELL_SIZE, CELL_SIZE);
}


function colorCells(indexes, color){
  for(let i = 0; i < indexes.length; i++){
    colorCell(indexes[i], color);
  }
}


function cellToScreenSpace(index){
  x = index % WORLD_SIZE;
  y = floor(index / WORLD_SIZE);
  x *= CELL_SIZE;
  y *= CELL_SIZE;
  return createVector(x + cellPositionOffset.x, y + cellPositionOffset.y);
}


function screenToCellSpace(point){
  let x = floor((point.x - cellPositionOffset.x) / CELL_SIZE);
  let y = floor((point.y - cellPositionOffset.y) / CELL_SIZE);
  if(x >= WORLD_SIZE || x < 0 || y >= WORLD_SIZE || y < 0){
    return -1;
  }
  index = y * WORLD_SIZE;
  index += x;
  return index;
}


function keyPressed(){
  if(key == ' '){
    tick();
  }
}