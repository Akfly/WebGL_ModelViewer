/* ---------------------------------------------------------------------------
** ball.js
** Represents a Mesh in the world
**
** Author: Fly - Ruben Negredo
** -------------------------------------------------------------------------*/

function Ball()
{	
	//TEXTURES
	this.diffTexture;
	
	//TRANSFORMS
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	
	this.rotX = 0;
	this.rotY = 0;
	this.rotZ = 0;
	
	this.scaleX = 1;
	this.scaleY = 1;
	this.scaleZ = 1;
		
	this.shaderProgram;
	
	this.fullLoaded = false;
	
	this.randomizedBuffer = [];
	
	this.totalOffsetTime = 0;
	this.offsetTime = 0;
	
	this.vertexValues;
	this.indexValues;
	
	//Max and min offset of the movement. The wider, the more it will move
	this.maxOffset = 1.5;
	this.minOffset = 0.5;
}

//Load the mesh
Ball.prototype.initBuffers = function(mesh_path)
{
	OBJ.downloadMeshes({'meshdata': mesh_path}, this.loadMesh, {'caller':this});
}

//Load the different textures of the mesh
Ball.prototype.setTextures = function(diffuse_path)
{
	var _this = this;
	
	//DIFFUSE
	this.diffTexture              = gl.createTexture();
	this.diffTexture.image        = new Image       ();
	this.diffTexture.image.src    = diffuse_path;
	this.diffTexture.image.onload = function ()
	{
		_this.handleLoadedTexture(_this.diffTexture);
	}
}

//Set the different shaders for the mesh and their values
Ball.prototype.initShaderProgram = function(vertex_name, fragment_name)
{
	var fragmentShader = this.getShader(gl, fragment_name);
	var vertexShader   = this.getShader(gl, vertex_name  );

	this.shaderProgram = gl.createProgram();
	gl.attachShader(this.shaderProgram, vertexShader  );
	gl.attachShader(this.shaderProgram, fragmentShader);
	gl.linkProgram (this.shaderProgram                );

	if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) 
	{
		alert("Could not initialise shaders:\n" + gl.getProgramInfoLog(this.shaderProgram));
	}

	gl.useProgram(this.shaderProgram);
	this.shaderProgram.attribList  = [];
	this.shaderProgram.bufferList  = [];
	this.shaderProgram.uniformList = [];
	
	//BASIC UNIFORMS REQUIRED FOR THE MESH TO DRAW
	this.setShaderUniform("uPMatrix"   );			//0
	this.setShaderUniform("uMVMatrix"  );			//1
	this.setShaderUniform("uNMatrix"   );			//2
	this.setShaderUniform("uColorMapSampler"   );	//3
	
	this.setShaderUniform("uAmbientColor"              );	//4
	this.setShaderUniform("uPointLightingLocation"     );	//5
	this.setShaderUniform("uPointLightingIntesity"     );	//6
	this.setShaderUniform("uPointLightingSpecularColor");	//7
	this.setShaderUniform("uPointLightingDiffuseColor" );	//8
	
	this.setShaderUniform("uTime");	//9
}

//This function initialize an attribute and its buffer
Ball.prototype.setShaderAttributeAndBuffer = function(att_name, buffer_data, item_size)
{
	var pos = this.shaderProgram.attribList.length;
	this.shaderProgram.attribList.push(gl.getAttribLocation(this.shaderProgram, att_name));
	gl.enableVertexAttribArray(this.shaderProgram.attribList[pos]);
	
	this.shaderProgram.bufferList.push(gl.createBuffer());
	gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.bufferList[pos]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
	this.shaderProgram.bufferList[pos].itemSize = item_size;
	this.shaderProgram.bufferList[pos].numItems = buffer_data.length / item_size;
}

//This function initialize a uniform
Ball.prototype.setShaderUniform = function(uniform_name)
{
	this.shaderProgram.uniformList.push(gl.getUniformLocation(this.shaderProgram, uniform_name));
}

//Called every frame. Updates the time to move the vertices
Ball.prototype.update = function(deltaTime)
{
	this.totalOffsetTime += deltaTime;
	this.offsetTime = Math.sin(this.totalOffsetTime / 1000); //Total time in seconds, so it is divided by 1000
}

Ball.prototype.draw = function(pMatrix, mvMatrix, light)
{
	gl.useProgram(this.shaderProgram);
	mvPushMatrix();
		
		//UPDATE
		mat4.translate(mvMatrix,            [  this.posX,   this.posY,   this.posZ]);
		mat4.rotate   (mvMatrix, this.rotX, [          1,           0,           0]);
		mat4.rotate   (mvMatrix, this.rotY, [          0,           1,           0]);
		mat4.rotate   (mvMatrix, this.rotZ, [          0,           0,           1]);
		mat4.scale    (mvMatrix,            [this.scaleX, this.scaleY, this.scaleZ]);
		
		//HIT THE LIGHTS!!!
		gl.uniform3f(this.shaderProgram.uniformList[ 4],   0.2,  0.2,   0.2);
		gl.uniform3f(this.shaderProgram.uniformList[ 5],   0.0,  0.0,   0.0);
		gl.uniform1f(this.shaderProgram.uniformList[ 6], 100.0             );
		gl.uniform3f(this.shaderProgram.uniformList[ 7],   0.8,  0.8,   0.8);
		gl.uniform3f(this.shaderProgram.uniformList[ 8],   0.8,  0.8,   0.8);
		
		gl.uniform1f(this.shaderProgram.uniformList[ 9], this.offsetTime);
		
		for(var i = 0; i < this.shaderProgram.attribList.length; i++)
		{
			gl.bindBuffer         (gl.ARRAY_BUFFER, this.shaderProgram.bufferList[i]);
			gl.vertexAttribPointer(this.shaderProgram.attribList[i], this.shaderProgram.bufferList[i].itemSize, gl.FLOAT, false, 0, 0);
		}

		//INDEX BUFFER
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		
		//SET MATRIX UNIFORMS
		var normalMatrix = mat3.create();
		mat4.toInverseMat3 (mvMatrix, normalMatrix);
		mat3.transpose     (normalMatrix          );
		
		gl.uniformMatrix4fv(this.shaderProgram.uniformList[0], false, pMatrix             );
		gl.uniformMatrix4fv(this.shaderProgram.uniformList[1], false, mvMatrix            );
		gl.uniformMatrix3fv(this.shaderProgram.uniformList[2], false, normalMatrix        );
	
		
		//SET ACTUAL TEXTURES
		gl.activeTexture(gl.TEXTURE0                         );
		gl.bindTexture  (gl.TEXTURE_2D, this.diffTexture     );
		gl.uniform1i    (this.shaderProgram.uniformList[3], 0);

		//DRAW
		gl.drawElements  (gl.TRIANGLE_STRIP, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	mvPopMatrix();
}

//////////////////////////
// CLASS FUNCS
//////////////////////////

//Tell GL about the texture when it is loaded
Ball.prototype.handleLoadedTexture = function(texture) 
{
	gl.useProgram(this.shaderProgram);
	console.log(texture.image.src);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true   );
	gl.bindTexture(gl.TEXTURE_2D,          texture);
	
	gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,   gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR                      );
	gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST       );
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);
}

//Once the mesh is fully loaded, set the attributes and its buffers
Ball.prototype.loadMesh = function(rmesh)
{
	gl.useProgram(this.shaderProgram);
    var omesh = rmesh.meshdata;
	var caller = rmesh.caller;
	console.log(rmesh);
	//NORMALS
	caller.setShaderAttributeAndBuffer("aVertexNormal", omesh.vertexNormals, 3);
	
	//TEXTURE UVs
	caller.setShaderAttributeAndBuffer("aTextureCoord", omesh.textures, 2);
	
	//VERTICES
	caller.setShaderAttributeAndBuffer("aVertexPosition", omesh.vertices, 3);
	
	caller.vertexValues = omesh.vertices;
	caller.indexValues  = omesh.indices;
	
	caller.setShaderAttributeAndBuffer("aRandomOffset", caller.randomizedBuffer, 1);
	
	for(var i = 0; i < omesh.indices.length; i++)
	{
		caller.randomizedBuffer.push(0.0);
	}
	
	caller.randomizeOffset();
	
	//INDICES
	caller.vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, caller.vertexIndexBuffer                        );
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(omesh.indices), gl.STATIC_DRAW);
	caller.vertexIndexBuffer.itemSize = 1;
	caller.vertexIndexBuffer.numItems = omesh.indices.length;
	
	console.log("MESH LOADED");
	caller.fullLoaded = true;
}

//Gives a random offset for each vertex
Ball.prototype.randomizeOffset = function()
{
	//Initialize all values to 0
	for(var i = 0; i < this.randomizedBuffer.length; i++)
	{
		this.randomizedBuffer[i] = 0.0;
	}
	
	for(var i = 0; i < this.indexValues.length; i++)
	{
		var found = false;
			
		for(var j = 0; j < this.indexValues.length && !found; j++)
		{
			//Compares each veretx to see if it is repeated (on another face), if that repeated
			//vertex has a value, then we take it (the value has to be the same)
			if(
				  (
					this.vertexValues[i*3+0] == this.vertexValues[j*3+0] &&
					this.vertexValues[i*3+1] == this.vertexValues[j*3+1] &&
					this.vertexValues[i*3+2] == this.vertexValues[j*3+2] 
				  ) &&
				  ((
					this.randomizedBuffer[j+0] != 0.0 
				  ))
			  )
			{
				this.randomizedBuffer[i+0] = this.randomizedBuffer[j+0];
				found = true;
			}
		}
		
		//If no repeated vertex was found with a value set, we initialize a value
		if(!found)
		{
			this.randomizedBuffer[i] = (Math.random() * this.maxOffset) + this.minOffset;
		}
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.bufferList[3]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.randomizedBuffer), gl.STATIC_DRAW);
}

//Gets a shader depending on the given ID
Ball.prototype.getShader = function(gl, id) 
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) 
	{
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	
	while (k) 
	{
		if (k.nodeType == 3) 
		{
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	
	if (shaderScript.type == "x-shader/x-fragment") 
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} 
	else if (shaderScript.type == "x-shader/x-vertex") 
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	} 
	else 
	{
		return null;
	}

	gl.shaderSource (shader, str);
	gl.compileShader(shader     );

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

//////////////////////////
// UTILS
//////////////////////////

Ball.prototype.setPosition = function(x, y, z)
{
	this.posX = x;
	this.posY = y;
	this.posZ = z;
}

Ball.prototype.setRotation = function(x, y, z)
{
	this.rotX = x;
	this.rotY = y;
	this.rotZ = z;
}

Ball.prototype.setScale = function(x, y, z)
{
	this.scaleX = x;
	this.scaleY = y;
	this.scaleZ = z;
}

Ball.prototype.move = function(x, y, z)
{
	this.posX += x;
	this.posY += y;
	this.posZ += z;
}

Ball.prototype.rotate = function(x, y, z)
{
	this.rotX += x;
	this.rotY += y;
	this.rotZ += z;
}

Ball.prototype.scale = function(x, y, z)
{
	this.scaleX += x;
	this.scaleY += y;
	this.scaleZ += z;
}

Ball.prototype.isReady = function()
{
	return (this.fullLoaded);
}