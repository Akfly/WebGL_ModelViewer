/* ---------------------------------------------------------------------------
** troll.js
** Represents a Mesh in the world
**
** Author: Fly - Ruben Negredo
** -------------------------------------------------------------------------*/

function Troll()
{
	//BUFFERS
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.vertexTextureCoordBuffer;
	this.vertexIndexBuffer;
	
	//TEXTURES
	this.diffTexture;
	this.specTexture;
	this.normTexture;
	this.skinTexture;
	
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
	
	//NORMAL MAP NECCESSARY
	this.tangentsBuffer;
	this.bitangensBuffer;
	
	this.shaderProgram;
}

//Load the mesh
Troll.prototype.initBuffers = function(mesh_path)
{
	OBJ.downloadMeshes({'meshdata': mesh_path}, this.loadMesh, {'caller':this});
}

//Load the different textures of the mesh
Troll.prototype.setTextures = function(diffuse_path, specular_path, normal_path, skin_path)
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
	//SPECULAR
	this.specTexture              = gl.createTexture();
	this.specTexture.image        = new Image       ();
	this.specTexture.image.src    = specular_path;
	this.specTexture.image.onload = function ()
	{
		_this.handleLoadedTexture(_this.specTexture);
	}
	//NORMAL
	this.normTexture              = gl.createTexture();
	this.normTexture.image        = new Image       ();
	this.normTexture.image.src    = normal_path;
	this.normTexture.image.onload = function ()
	{
		_this.handleLoadedTexture(_this.normTexture);
	}
	//SKIN
	this.skinTexture              = gl.createTexture();
	this.skinTexture.image        = new Image       ();
	this.skinTexture.image.src    = skin_path;
	this.skinTexture.image.onload = function ()
	{
		_this.handleLoadedTexture(_this.skinTexture);
	}
}

//Set the different shaders for the mesh and their values
Troll.prototype.initShaderProgram = function(vertex_name, fragment_name)
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
	this.setShaderUniform("uSpecularMapSampler");	//4
	this.setShaderUniform("uNormalMapSampler"  );	//5
	this.setShaderUniform("uSkinMapSampler"    );	//6
	
	this.setShaderUniform("uAmbientColor"              );	//7
	this.setShaderUniform("uPointLightingLocation"     );	//8
	this.setShaderUniform("uPointLightingIntesity"     );	//9
	this.setShaderUniform("uPointLightingSpecularColor");	//10
	this.setShaderUniform("uPointLightingDiffuseColor" );	//11
}

//This function initialize an attribute and its buffer
Troll.prototype.setShaderAttributeAndBuffer = function(att_name, buffer_data, item_size)
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
Troll.prototype.setShaderUniform = function(uniform_name)
{
	this.shaderProgram.uniformList.push(gl.getUniformLocation(this.shaderProgram, uniform_name));
}

Troll.prototype.update = function(deltaTime)
{
}

Troll.prototype.draw = function(pMatrix, mvMatrix, light)
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
		gl.uniform3f(this.shaderProgram.uniformList[ 7],   0.2,  0.2,   0.2);
		gl.uniform3f(this.shaderProgram.uniformList[ 8],   0.0,  0.0,   0.0);
		gl.uniform1f(this.shaderProgram.uniformList[ 9], 100.0             );
		gl.uniform3f(this.shaderProgram.uniformList[10],   0.8,  0.8,   0.8);
		gl.uniform3f(this.shaderProgram.uniformList[11],   0.8,  0.8,   0.8);
		
		//SET SHADER ATTRIBUTES
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
		gl.activeTexture(gl.TEXTURE1                         );
		gl.bindTexture  (gl.TEXTURE_2D, this.specTexture     );
		gl.uniform1i    (this.shaderProgram.uniformList[4], 1);
		gl.activeTexture(gl.TEXTURE2                         );
		gl.bindTexture  (gl.TEXTURE_2D, this.normTexture     );
		gl.uniform1i    (this.shaderProgram.uniformList[5], 2);
		gl.activeTexture(gl.TEXTURE3                         );
		gl.bindTexture  (gl.TEXTURE_2D, this.skinTexture     );
		gl.uniform1i    (this.shaderProgram.uniformList[6], 3);

		//DRAW
		gl.drawElements  (gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	mvPopMatrix();
}

//////////////////////////
// CLASS FUNCS
//////////////////////////

//Tell GL about the texture when it is loaded
Troll.prototype.handleLoadedTexture = function(texture) 
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
Troll.prototype.loadMesh = function(rmesh)
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
	
	//INDICES
	caller.vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, caller.vertexIndexBuffer                        );
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(omesh.indices), gl.STATIC_DRAW);
	caller.vertexIndexBuffer.itemSize = 1;
	caller.vertexIndexBuffer.numItems = omesh.indices.length;
	
	caller.fullLoaded = true;
	console.log("MESH LOADED");
}

//Gets a shader depending on the given ID
Troll.prototype.getShader = function(gl, id) 
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

Troll.prototype.setPosition = function(x, y, z)
{
	this.posX = x;
	this.posY = y;
	this.posZ = z;
}

Troll.prototype.setRotation = function(x, y, z)
{
	this.rotX = x;
	this.rotY = y;
	this.rotZ = z;
}

Troll.prototype.setScale = function(x, y, z)
{
	this.scaleX = x;
	this.scaleY = y;
	this.scaleZ = z;
}

Troll.prototype.move = function(x, y, z)
{
	this.posX += x;
	this.posY += y;
	this.posZ += z;
}

Troll.prototype.rotate = function(x, y, z)
{
	this.rotX += x;
	this.rotY += y;
	this.rotZ += z;
}

Troll.prototype.scale = function(x, y, z)
{
	this.scaleX += x;
	this.scaleY += y;
	this.scaleZ += z;
}

Troll.prototype.isReady = function()
{
	return (this.fullLoaded);
}