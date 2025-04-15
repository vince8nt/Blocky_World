class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
  }
}

function drawTriangle3DUVNormal(vertices, uv, normals) {
	var n = vertices.length/3; // num of vertices

	// create buffer obj for positions
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	// bind the buffer obj to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// write data into the buffer obj
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
	// assign the buffer obj to a_Position variable
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	// enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);

	// create buffer obj for UV
	var uvBuffer = gl.createBuffer();
	if (!uvBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	// bind the buffer obj to target
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	// write data into the buffer obj
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
	// assign the buffer obj to a_Position variable
	gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
	// enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_UV);

	// create buffer obj for Normals
	var NormalBuffer = gl.createBuffer();
	if (!NormalBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	// bind the buffer obj to target
	gl.bindBuffer(gl.ARRAY_BUFFER, NormalBuffer);
	// write data into the buffer obj
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
	// assign the buffer obj to a_Position variable
	gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
	// enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Normal);

	// draw the triangle
	gl.drawArrays(gl.TRIANGLES, 0, n);
}






