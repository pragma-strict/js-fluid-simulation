
/*
Notes on coordinate spaces:
Everything is calculated and handled in "World space".
World space is a coordinate plane of the same size as screen space (1:1 pixels) but translated by some x offset and y offset.
World space coordinates are translated back into screen space only when everything is drawn.

*/

var cnv;

var X = 0;  // X and Y are used in place of 0 and 1 when accessing the indexes of coordinate pair arrays for clarity.
var Y = 1;

var mouseIsPressed = false;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  repositionCanvas();
  
  angleMode(RADIANS);

  setupGrid();
}

function repositionCanvas()
{
	var x = windowWidth - width;
	var y = windowHeight - height;
	cnv.position(x, y);
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	repositionCanvas();
	drawFrame();
}

function drawFrame()
{
  background(BG_COL);
  drawGridPixelFromWorldCoordinates(convertScreenToWorldCoordinates([mouseX, mouseY]), BG_COL_SHADE_1); // draw hovered pixel
  drawGridLines();

  strokeWeight(0);
  fill(0);
  text(((mouseX - GRID_X_OFFSET) + ", " + (mouseY - GRID_Y_OFFSET)), mouseX, mouseY);
}

function draw()
{
  drawFrame();

  // Mouse dragging logic
  if(mouseIsPressed)
  {
    var dx = mouseX - pmouseX; // change in x
    var dy = mouseY - pmouseY; // change in y
    GRID_X_OFFSET += dx;
    GRID_Y_OFFSET += dy;
  }
}


function mousePressed()
{
  mouseIsPressed = true;  // log mouse press
}


function mouseReleased()
{
  mouseIsPressed = false;
}


function keyPressed()
{
  if(key == 'd')
  {
    console.log(GRID_X_OFFSET);
    console.log(mouseX - previousMouseX);
  }
}