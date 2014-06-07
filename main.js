/* ---------------------------------------------------------------------------
** main.js
** The basic world
**
** Author: Fly - Ruben Negredo
** -------------------------------------------------------------------------*/

var gl;	//WebGL

//MESHES
var troll = new Troll();
var ball  = new Ball();

//MATRICES
var mvMatrix      = mat4.create();
var pMatrix       = mat4.create();
var mvMatrixStack = [];

var lastTime = 0; //DeltaTime

var camX = 0;
var camY = 0;
var camZ = 0;

var camrX = 0;
var camrY = 0;
var camrZ = 0;

//To handle key events
var currentlyPressedKeys = {};			
var speedMovement = 0.5;

var canvas;

//Function called at the start of the code
function webGLStart() 
{
	canvas = document.getElementById("mycanvas");
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	
	initGL();
	
	initShaders ();
	initMeshes  ();
	
	document.onkeydown = handleKeyDown;
	document.onkeyup   = handleKeyUp;

	gl.clearColor(0.696, 0.597, 0.398, 1.0);
	gl.enable(gl.DEPTH_TEST);

	loop();
}

//Initialize the gl context given a canvas
function initGL() 
{
	try 
	{
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} 
	catch (e) 
	{
		alert(e);
	}
	if (!gl) 
	{
		alert("Could not initialise WebGL, sorry :-(");
	}
	
	//SET THE VIEWPORT
	gl.viewport     (0, 0, gl.viewportWidth, gl.viewportHeight                      );
	gl.clear        (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT                      );
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 10000.0, pMatrix);
}

//Gives different shaders to each mesh
function initShaders() 
{
	troll.initShaderProgram("shader-vs", "shader-fs");
	 ball.initShaderProgram("ball-shader-vs", "ball-shader-fs");
}

//Set the path of the model and its textures for each mesh.
//Then give them an initial position, rotation, scale, etc...
function initMeshes() 
{
	troll.initBuffers("assets/meshes/troll.obj");
	troll.setTextures("assets/textures/colors.jpg", "assets/textures/specular.jpg", "assets/textures/normals.jpg", "assets/textures/skin_mask.jpg");
	troll.move  (0.0, -60.0, -200.0);
	
	ball.initBuffers("assets/meshes/ball.obj");
	ball.setTextures("assets/textures/fireball-red-DIFF.png");
	ball.move  (50.0, 30.0, -150.0);
}

//Core loop
function loop() 
{
	requestAnimFrame(loop);
	update  ();
	draw    ();
}

//Called each frame.
//Do every operation here.
function update() 
{
	var timeNow = new Date().getTime();
	var elapsed = timeNow - lastTime;
	lastTime = timeNow;
	
	ball.update(elapsed);
	
	handleKeys();
}

//Called every frame, draws each mesh
function draw() 
{
	//SET THE VIEWPORT
	checkResize();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	if (!troll.isReady() || !ball.isReady())
	{
		return;
	}
	
	mat4.identity (mvMatrix);
	
	//CAM CONTROLS
	mat4.translate(mvMatrix, [-camX, -camY, -camZ]);
	mat4.rotate   (mvMatrix, -camrX, [          1,           0,           0]);
	mat4.rotate   (mvMatrix, -camrY, [          0,           1,           0]);
	mat4.rotate   (mvMatrix, -camrZ, [          0,           0,           1]);
	
	//MESHES DRAW
	troll.draw(pMatrix, mvMatrix);
	 ball.draw(pMatrix, mvMatrix);
}

function mvPushMatrix() 
{
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() 
{
	if (mvMatrixStack.length == 0) 
	{
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) 
{
	return degrees * Math.PI / 180;
}

//The given key is pressed
function handleKeyDown(e)
{
	currentlyPressedKeys[e.keyCode] = true;
}

//The given key is no longer pressed
function handleKeyUp(e)
{
	currentlyPressedKeys[e.keyCode] = false;
}

//If the window has been resized, we set the new size to the canvas and the gl context
function checkResize()
{
	if(canvas.width != window.innerWidth || canvas.height != window.innerHeight)
	{
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		
		gl.viewportWidth  = canvas.width;
		gl.viewportHeight = canvas.height;
		
		gl.viewport     (0, 0, gl.viewportWidth, gl.viewportHeight                      );
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 10000.0, pMatrix);
	}
}

function handleKeys()
{
	if(currentlyPressedKeys[87])  //W
	{
		camZ -= speedMovement;
	}
	if(currentlyPressedKeys[83])  //S
	{
		camZ += speedMovement;
	}
	if(currentlyPressedKeys[65])  //A
	{
		camX -= speedMovement;
	}
	if(currentlyPressedKeys[68])  //D 
	{
		camX += speedMovement;
	}
	if(currentlyPressedKeys[73])  //I
	{
		camrX += speedMovement /100;
	}
	if(currentlyPressedKeys[75])  //K
	{
		camrX -= speedMovement /100;
	}
	if(currentlyPressedKeys[74])  //J
	{
		camrY += speedMovement /100;
	}
	if(currentlyPressedKeys[76])  //L
	{
		camrY -= speedMovement /100;
	}
	
	if(currentlyPressedKeys[37])  //LEFTARROW
	{
		troll.rotate(0.0, -speedMovement /10, 0.0);
		 ball.rotate(0.0, -speedMovement /10, 0.0);
	}
	if(currentlyPressedKeys[39])  //RIGHTARROW
	{
		troll.rotate(0.0, speedMovement /10, 0.0);
		 ball.rotate(0.0, speedMovement /10, 0.0);
	}
	
	if(currentlyPressedKeys[38])  //UPARROW
	{
		speedMovement += 0.05;
	}
	if(currentlyPressedKeys[40])  //DOWNARROW
	{
		if(speedMovement >= 0.1)
		{
			speedMovement -= 0.05;
		}
	}
}