
let canvas;
let mouseIsPressed = false;
let cells = [];
let world_size = 64;
let cell_size = 10;


function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  repositionCanvas();
  for(let i = 0; i < world_size * world_size; i++){
    cells.push(createVector(random(0, cell_size), random(0, cell_size)));
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
  stroke(0);
  line(position.x, position.y, position.x + vector.x, position.y + vector.y);
}


function cellToScreenSpace(index){
  x = index % world_size;
  y = floor(index / world_size);
  x *= cell_size;
  y *= cell_size;
  return createVector(x, y);
}


function screenToCellSpace(point){
  index = point.y * world_size;
  index += point.x;
  return index;
}


function keyPressed(){
  if(key == ' '){
    drawFrame();
  }
}