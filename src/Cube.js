class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2;
    this.shiny = 0.5;
  }

  render() {
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
    var allVerts = [];
    var allUV = [];
    var allNormal = [];
    // Front face
    allVerts = allVerts.concat( [0,0,0,  1,1,0,  1,0,0 ] );
    allVerts = allVerts.concat( [0,0,0,  0,1,0,  1,1,0 ] );
    allUV = allUV.concat( [1,0, 0,1, 0,0] );
    allUV = allUV.concat( [1,0, 1,1, 0,1] );
    allNormal = allNormal.concat( [0,0,-1, 0,0,-1, 0,0,-1] );
    allNormal = allNormal.concat( [0,0,-1, 0,0,-1, 0,0,-1] );
    // Back face
    allVerts = allVerts.concat( [0,0,1,  1,1,1,  1,0,1 ] );
    allVerts = allVerts.concat( [0,0,1,  0,1,1,  1,1,1 ] );
    allUV = allUV.concat( [0,0, 1,1, 1,0] );
    allUV = allUV.concat( [0,0, 0,1, 1,1] );
    allNormal = allNormal.concat( [0,0,1,  0,0,1,  0,0,1 ] );
    allNormal = allNormal.concat( [0,0,1,  0,0,1,  0,0,1 ] );
    // Top Face
    allVerts = allVerts.concat( [0,1,0,  0,1,1,  1,1,1 ] );
    allVerts = allVerts.concat( [0,1,0,  1,1,1,  1,1,0 ] );
    allUV = allUV.concat( [1,0, 1,1, 0,1] );
    allUV = allUV.concat( [1,0, 0,1, 0,0] );
    allNormal = allNormal.concat( [0,1,0,  0,1,0,  0,1,0 ] );
    allNormal = allNormal.concat( [0,1,0,  0,1,0,  0,1,0 ] );
    // Bottom Face
    allVerts = allVerts.concat( [0,0,0,  0,0,1,  1,0,1 ] );
    allVerts = allVerts.concat( [0,0,0,  1,0,1,  1,0,0 ] );
    allUV = allUV.concat( [0,0, 0,1, 1,1] );
    allUV = allUV.concat( [0,0, 1,1, 1,0] );
    allNormal = allNormal.concat( [0,-1,0, 0,-1,0, 0,-1,0] );
    allNormal = allNormal.concat( [0,-1,0, 0,-1,0, 0,-1,0] );
    // Left Face
    allVerts = allVerts.concat( [0,0,0,  0,0,1,  0,1,1 ] );
    allVerts = allVerts.concat( [0,0,0,  0,1,1,  0,1,0 ] );
    allUV = allUV.concat( [0,0, 1,0, 1,1] );
    allUV = allUV.concat( [0,0, 1,1, 0,1] );
    allNormal = allNormal.concat( [-1,0,0, -1,0,0, -1,0,0] );
    allNormal = allNormal.concat( [-1,0,0, -1,0,0, -1,0,0] );
    // Right Face
    allVerts = allVerts.concat( [1,0,0,  1,0,1,  1,1,1 ] );
    allVerts = allVerts.concat( [1,0,0,  1,1,1,  1,1,0 ] );
    allUV = allUV.concat( [1,0, 0,0, 0,1] );
    allUV = allUV.concat( [1,0, 0,1, 1,1] );
    allNormal = allNormal.concat( [1,0,0,  1,0,0,  1,0,0 ] );
    allNormal = allNormal.concat( [1,0,0,  1,0,0,  1,0,0 ] );

    drawTriangle3DUVNormal(allVerts, allUV, allNormal);
  }
}
