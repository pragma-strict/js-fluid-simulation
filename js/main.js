/*
  TODO:
  - There's some kind of memory leak or something that's causing this thing to lag the browser
  - I added a second array to store previous values - not sure if this was done correctly
  - Make a better averaging function that allows for viscosity values > 1
  - Add advection so that velocity actually transfers based on its direction
*/


/* DOM Element IDs */
let ID_PARENT = 'p5-canvas-container';
let ID_FPS = 'interface-fps';
let ID_CELL_COUNT = 'interface-cell-count'
let ID_VISCOSITY = 'interface-viscosity';
let canvas;

/* Interface DOM Elements */
let INTERFACE_FPS;
let INTERFACE_CELL_COUNT;
let INTERFACE_VISCOSITY;

/* Constants */
let WORLD_SIZE = 64;
let CELL_SIZE = 8;
let HALF_CELL_SIZE = 8/2;
let CELL_COUNT = 16;

/* Cell data (simulation state) */
let cells;
let cellsPrev;  // Cell states at previous time step

/* Settings */
let viscosity = 1;
let timeStep = 0.1;




function setup() {
  let parentStyle = window.getComputedStyle(document.getElementById(ID_PARENT));
  canvas = createCanvas(parseInt(parentStyle.width), parseInt(parentStyle.height));
  canvas.parent(ID_PARENT);

  // Initialize interface stuff
  INTERFACE_FPS = document.getElementById(ID_FPS);
  INTERFACE_CELL_COUNT = document.getElementById(ID_CELL_COUNT);
  INTERFACE_CELL_COUNT.onchange = initializeCells;
  INTERFACE_VISCOSITY = document.getElementById(ID_VISCOSITY);
  INTERFACE_VISCOSITY.onchange = getInterfaceUpdates;

  // Set up some other stuff
  getInterfaceUpdates();
  initializeCells();
  noStroke();
  render();
}


// Clear cells and reinitialize them
function initializeCells(){
  WORLD_SIZE = sqrt(INTERFACE_CELL_COUNT.value);  // This line probably shouldn't be here
  cells = [];
  cellsPrev = [];
  for(let i = 0; i < WORLD_SIZE * WORLD_SIZE; i++){
    let value = {
      velocity: createVector(0, 0), 
      density: 0
    };
    cells.push(value);
    cellsPrev.push(value);
  }
  updateCellSize();
}


function clearCellArray(arrayToClear){
  arrayToClear = [];
  for(let i = 0; i < WORLD_SIZE * WORLD_SIZE; i++){
    let value = {
      velocity: createVector(0, 0), 
      density: 0
    };
    arrayToClear.push(value);
  }
}


function windowResized() {
  let parentStyle = window.getComputedStyle(document.getElementById(ID_PARENT));
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
    cells[cellUnderMouse].velocity = mouseVelocity.mult(3);
  }

  // Apply density to cells
  if(cellUnderMouse != -1 && mouseIsPressed){
    cells[cellUnderMouse].density = 1;
  }

  // diffuseVelocity();
  diffuseDensity();

  // Dump the cell states into the "prev" array to get ready for next tick
  cellsPrev = cells;
}


function diffuseAll(){
  for(let i = 0; i < cells.length; i++){
    let kernel = getKernelAdjacent(i);
    let densitySum = 0;
    let velocitySum = createVector(0, 0);
    let originalVelocity = cells[i].velocity;

    for(let v = 0; v < kernel.length; v++){
      densitySum += (cells[kernel[v]].density);
      velocitySum.add(cells[kernel[v]].velocity);
    }

    cells[i].density = densitySum / kernel.length;
    let velocityAverage = velocitySum.div(kernel.length);
    let newVelocity = originalVelocity.add((velocityAverage.sub(originalVelocity)).mult(viscosity));
    cells[i].velocity = newVelocity;
  }
}


function diffuseVelocity(){
  for(let i = 0; i < cells.length; i++){
    let kernel = getKernelAdjacent(i);
    let velocitySum = createVector(0, 0);
    let originalVelocity = cells[i].velocity;

    for(let v = 0; v < kernel.length; v++){
      velocitySum.add(cells[kernel[v]].velocity);
    }

    let velocityAverage = velocitySum.div(kernel.length);
    let newVelocity = originalVelocity.add((velocityAverage.sub(originalVelocity)).mult(viscosity));
    cells[i].velocity = newVelocity;
  }
}


function diffuseDensity(){
  for(let i = 0; i < cells.length; i++){
    let kernel = getKernelAdjacent(i);
    let densitySum = 0;
    let originalDensity = cells[i].density;

    for(let v = 0; v < kernel.length; v++){
      densitySum += (cells[kernel[v]].density);
    }

    let densityAverage = densitySum / kernel.length;
    let newDensity = originalDensity += (densityAverage - originalDensity) * viscosity;
    cells[i].density = newDensity;
  }
}


function diffuseDensityNew(iterations)
{
  let a = viscosity * WORLD_SIZE * WORLD_SIZE; // * deltaTime
  console.log("a: " + a);
  for (let k = 0; k < iterations; k++) {
    for (let i = 0; i < WORLD_SIZE; i++) {
      console.log("test")
      let kernel = getKernelAdjacent(i);
      let densitySum = -1 * (cells[i].density);

      for(let d = 0; d < kernel.length; d++){
        densitySum += (cells[kernel[d]].density);
      }
      //console.log("density sum: " + densitySum);

      let newValue = (cellsPrev[i] + a * densitySum) / (1 + 4 * a);
      cells[i].density = newValue;
      // x[IX(i,j)] = (x0[IX(i,j)] + a*(x[IX(i-1,j)]+x[IX(i+1,j)]+
      // x[IX(i,j-1)]+x[IX(i,j+1)]))/(1+4*a);
    }
  }
}



function draw(){
  if(frameCount % 15 == 0){
    console.log("rendering")
    updateDataOutput();
    tick();
    render();
  }
}


function render()
{
  background(BG_COL);

  // Render cell densities
  noStroke();
  for(let i = 0; i < cells.length; i++){
    let cellScreenPos = cellToScreenSpace(i);
    fill(color(0, 0, 0, cells[i].density * 255));
    rect(cellScreenPos.x, cellScreenPos.y, CELL_SIZE, CELL_SIZE);
  }

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
  viscosity = parseFloat(INTERFACE_VISCOSITY.value);
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