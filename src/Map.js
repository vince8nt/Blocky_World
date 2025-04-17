class Map {
	constructor(width, length) {
		this.color = [0.3, 0.3, 0.3, 1.0];
		this.matrix = new Matrix4();
		this.normalMatrix = new Matrix4();
		this.length = length;
		this.width = width;
		this.textureNum = -2;
		this.shiny = 0.5;
		this.map = [];
		for (var y = 0; y < this.length; ++y) {
			var row = [];
			for (var x = 0; x < this.width; ++x) {
				row.push(0);
			}
			this.map.push(row);
		}
		this.shellVerts  = [];
		this.shellUV     = [];
		this.shellNormal = [];
	}

  addBlocks(x, y, width, length, height) {
  	for (var i = x; i < x + width; ++i) {
  		for (var j = y; j < y + length; ++j) {
  			if (-1 < i && i < this.width && -1 < j && j < this.length)
  				this.map[j][i] = height;
  		}
  	}
  }

  setSubtexture(x, y, texSize) {
	texSize = 1 / texSize;
	x *= texSize;
	y *= texSize;
	for (var i = 0; i < this.shellUV.length; i += 2) {
		this.shellUV[i] *= texSize;
		this.shellUV[i] += x;
		this.shellUV[i+1] *= texSize;
		this.shellUV[i+1] += y;
	}
  }

  createShell() {
  	for (var y = 0; y < this.length; ++y) {
	    for (var x = 0; x < this.width; ++x) {
	      for (var h = 0; h < this.map[y][x]; ++h) {
	        if (this.map[y][x] - 1 == h) { // top face
	        	this.shellVerts = this.shellVerts.concat( [x  ,h+1,y  ,  x  ,h+1,y+1,  x+1,h+1,y+1] );
    				this.shellVerts = this.shellVerts.concat( [x  ,h+1,y  ,  x+1,h+1,y+1,  x+1,h+1,y  ] );
    				this.shellUV = this.shellUV.concat( [1,0, 1,1, 0,1] );
    				this.shellUV = this.shellUV.concat( [1,0, 0,1, 0,0] );
    				this.shellNormal = this.shellNormal.concat( [0,1,0,  0,1,0,  0,1,0 ] );
    				this.shellNormal = this.shellNormal.concat( [0,1,0,  0,1,0,  0,1,0 ] );
	        }
	        if (y == 0 || this.map[y - 1][x] <= h) { // front face
	        	this.shellVerts = this.shellVerts.concat( [x  ,h  ,y  ,  x+1,h+1,y  ,  x+1,h  ,y  ] );
    				this.shellVerts = this.shellVerts.concat( [x  ,h  ,y  ,  x  ,h+1,y  ,  x+1,h+1,y  ] );
    				this.shellUV = this.shellUV.concat( [1,0, 0,1, 0,0] );
    				this.shellUV = this.shellUV.concat( [1,0, 1,1, 0,1] );
    				this.shellNormal = this.shellNormal.concat( [0,0,-1, 0,0,-1, 0,0,-1] );
    				this.shellNormal = this.shellNormal.concat( [0,0,-1, 0,0,-1, 0,0,-1] );
	        }
	        if (y == this.length - 1 || this.map[y + 1][x] <= h) { // back face
	        	this.shellVerts = this.shellVerts.concat( [x  ,h  ,y+1,  x+1,h+1,y+1,  x+1,h  ,y+1] );
    				this.shellVerts = this.shellVerts.concat( [x  ,h  ,y+1,  x  ,h+1,y+1,  x+1,h+1,y+1] );
    				this.shellUV = this.shellUV.concat( [0,0, 1,1, 1,0] );
    				this.shellUV = this.shellUV.concat( [0,0, 0,1, 1,1] );
    				this.shellNormal = this.shellNormal.concat( [0,0,1,  0,0,1,  0,0,1 ] );
    				this.shellNormal = this.shellNormal.concat( [0,0,1,  0,0,1,  0,0,1 ] );
	        }
	        if (x == 0 || this.map[y][x - 1] <= h) { // left face
	        	this.shellVerts = this.shellVerts.concat( [x  ,h  ,y  ,  x  ,h  ,y+1,  x  ,h+1,y+1] );
				    this.shellVerts = this.shellVerts.concat( [x  ,h  ,y  ,  x  ,h+1,y+1,  x  ,h+1,y  ] );
				    this.shellUV = this.shellUV.concat( [0,0, 1,0, 1,1] );
				    this.shellUV = this.shellUV.concat( [0,0, 1,1, 0,1] );
				    this.shellNormal = this.shellNormal.concat( [-1,0,0, -1,0,0, -1,0,0] );
    				this.shellNormal = this.shellNormal.concat( [-1,0,0, -1,0,0, -1,0,0] );
	        }
	        if (x == this.width - 1 || this.map[y][x + 1] <= h) { // right face
	        	this.shellVerts = this.shellVerts.concat( [x+1,h  ,y  ,  x+1,h,  y+1,  x+1,h+1,y+1] );
				    this.shellVerts = this.shellVerts.concat( [x+1,h  ,y  ,  x+1,h+1,y+1,  x+1,h+1,y  ] );
				    this.shellUV = this.shellUV.concat( [1,0, 0,0, 0,1] );
				    this.shellUV = this.shellUV.concat( [1,0, 0,1, 1,1] );
				    this.shellNormal = this.shellNormal.concat( [1,0,0,  1,0,0,  1,0,0 ] );
    				this.shellNormal = this.shellNormal.concat( [1,0,0,  1,0,0,  1,0,0 ] );
	        }
	        

	      }
	    }
	  }
  }

  drawMap() { // renderFast for each cube
	  var block = new Cube();
	  block.color = this.color;
	  block.textureNum = this.textureNum;
	  for (var y = 0; y < this.width; ++y) {
	    for (var x = 0; x < this.length; ++x) {
	      for (var i = 0; i < this.map[y][x]; ++i) {
	        block.matrix.setTranslate(x - 16, i, y - 16);
	        block.render();
	      }
	    }
	  }
	}

	drawShell() { // much faster
	  var rgba = this.color;
    // pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);
    // pass the shiny
    gl.uniform1f(u_shiny, this.shiny);
    // pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    // Pass the matrix to u_NormalMatrix attribute
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
    // draw shell
    drawTriangle3DUVNormal(this.shellVerts, this.shellUV, this.shellNormal);
	}

}



/*
		this.map = [
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];
*/






