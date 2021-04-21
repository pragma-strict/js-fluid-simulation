let PARENT_ID = 'p5-canvas-container';
let FPS_ID = 'interface-fps';
let CELL_COUNT_ID = 'interface-cell-count'

let canvas;
let INTERFACE_FPS;
let INTERFACE_CELL_COUNT;

let WORLD_SIZE = 64;
let CELL_SIZE = 8;
let HALF_CELL_SIZE = 8/2;
let CELL_COUNT = 16;

let cells;

function setup() {
  let parentStyle = window.getComputedStyle(document.getElementById(PARENT_ID));
  canvas = createCanvas(parseInt(parentStyle.width), parseInt(parentStyle.height));
  canvas.parent(PARENT_ID);

  // Initialize interface stuff
  INTERFACE_FPS = document.getElementById(FPS_ID);
  INTERFACE_CELL_COUNT = document.getElementById(CELL_COUNT_ID);
  INTERFACE_CELL_COUNT.onchange = getInterfaceUpdates;

  // Set up some other stuff
  getInterfaceUpdates();
  initializeCells();
  updateCellSize();
  noStroke();
  render();
}


function initializeCells(){
  cells = [];
  for(let i = 0; i < WORLD_SIZE * WORLD_SIZE; i++){
    let value = {
      velocity: createVector(0, 0), 
      density: 0
    };
    cells.push(value);
  }
}


function windowResized() {
  let parentStyle = window.getComputedStyle(document.getElementById(PARENT_ID));
	resizeCanvas(parseInt(parentStyle.width), parseInt(parentStyle.height));
  updateCellSize();
	render();
}


function updateCellSize(){
  CELL_SIZE = width / WORLD_SIZE;
  HALF_CELL_SIZE = CELL_SIZE /2;
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
    cells[cellUnderMouse].density = 255;
  }

  diffuseAll();
}


function diffuseAll(){
  for(let i = 0; i < cells.length; i++){
    let kernel = getKernelAdjacent(i);

    let densitySum = 0;
    let velocitySum = createVector(0, 0);
    for(let v = 0; v < kernel.length; v++){
      densitySum += (cells[kernel[v]].density);
      velocitySum.add(cells[kernel[v]].velocity);
    }
    cells[i].density = densitySum / kernel.length;
    cells[i].velocity = velocitySum.div(kernel.length);
  }
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
  if(frameCount % 10 == 0){
    updateDataOutput();
  }
}


function render()
{
  background(BG_COL);

  // Render cell densities
  // noStroke();
  // for(let i = 0; i < cells.length; i++){
  //   let cellScreenPos = cellToScreenSpace(i);
  //   fill(color(0, 0, 0, 255));
  //   let size = cells[i].velocity.mag();
  //   rect(cellScreenPos.x, cellScreenPos.y, size, size);
  //   //rect(cellScreenPos.x, cellScreenPos.y, CELL_SIZE, CELL_SIZE);
  // }

  // Render cell velocities
  for(let i = 0; i < cells.length; i++){
    let cellScreenPos = cellToScreenSpace(i);
    fill(0);
    drawVector(cells[i].velocity, cellScreenPos);
  }
}


function updateDataOutput(){
  INTERFACE_FPS.innerHTML = round(frameRate(), 1);
}


function getInterfaceUpdates(){
  WORLD_SIZE = sqrt(INTERFACE_CELL_COUNT.value);
  initializeCells();
  updateCellSize();
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
  return createVector(x, y);
}


function screenToCellSpace(point){
  let x = floor(point.x / CELL_SIZE);
  let y = floor(point.y / CELL_SIZE);
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