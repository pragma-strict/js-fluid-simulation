
let canvas;
let mouseIsPressed = false;
let cells = [];
let world_size = 64;
let cell_size = 10;


function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  repositionCanvas();
  for(let i = 0; i < world_size * world_size; i++){
    cells.push(createVector(0, 0));
  }
  noStroke();
  drawFrame();
}


function repositionCanvas()
{
	var x = windowWidth - width;
	var y = windowHeight - height;
	canvas.position(x, y);
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	repositionCanvas();
	drawFrame();
}


// A single simulation step
function tick(){

}


// Return list of immediate neighbors to given cell
function getCellKernel(index){
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

function getCellUp(index){
  return (index - world_size) >= 0 ? (index - world_size) : -1;
}

function getCellDown(index){
  return (index + world_size) < (world_size * world_size) ? (index + world_size) : index % world_size;
}

function getCellRight(index){
  return (index % world_size) != (world_size -1) ? (index + 1) : (index - (world_size -1) );
}

function getCellLeft(index){
  return (index % world_size) != 0 ? (index - 1) : (index + (world_size -1) );
}


function draw(){
  drawFrame();
  let cellUnderMouse = screenToCellSpace(createVector(mouseX, mouseY));
  let mouseVelocity = createVector(mouseX - pmouseX, mouseY - pmouseY);
  if(cellUnderMouse != -1){
    cells[cellUnderMouse] = mouseVelocity;
    colorCell(cellUnderMouse, color(0, 0, 0));
    colorCells(getCellKernel(cellUnderMouse), 0);
  }
}


function drawFrame()
{
  background(BG_COL);
  for(let i = 0; i < cells.length; i++){
    let cellScreenPos = cellToScreenSpace(i);
    drawVector(cells[i], cellScreenPos);
  }
}


function drawVector(vector, position){
  strokeWeight(1);
  stroke(256 - vector.mag()*256 / cell_size);
  line(position.x, position.y, position.x + vector.x, position.y + vector.y);
}


function colorCell(index, color){
  fill(color);
  let cellCoordinate = cellToScreenSpace(index);
  rect(cellCoordinate.x, cellCoordinate.y, cell_size, cell_size);
}


function colorCells(indexes, color){
  for(let i = 0; i < indexes.length; i++){
    colorCell(indexes[i], color);
  }
}


function cellToScreenSpace(index){
  x = index % world_size;
  y = floor(index / world_size);
  x *= cell_size;
  y *= cell_size;
  return createVector(x, y);
}


function screenToCellSpace(point){
  let x = floor(point.x / cell_size);
  let y = floor(point.y / cell_size);
  if(x >= world_size || y >= world_size){
    return -1;
  }
  index = y * world_size;
  index += x;
  return index;
}


function keyPressed(){
  if(key == ' '){
    drawFrame();
  }
}