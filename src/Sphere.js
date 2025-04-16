class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2;
    this.res = 8;
    this.shiny = 0.5;
  }

  render() { // for different colors on adjacent sides
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
    
    // init storage
    var allVerts = [];
    var allUV = [];

    // main loop
    var d = Math.PI / this.res;
    for (var y = 0; y < this.res; ++y) {
        for (var x = 0; x < 2 * this.res; ++x) {
            var t = Math.PI * y / this.res;
            var r = Math.PI * x / this.res;
            var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
            var p2 = [Math.sin(t+d)*Math.cos(r), Math.sin(t+d)*Math.sin(r), Math.cos(t+d)];
            var p3 = [Math.sin(t)*Math.cos(r+d), Math.sin(t)*Math.sin(r+d), Math.cos(t)];
            var p4 = [Math.sin(t+d)*Math.cos(r+d), Math.sin(t+d)*Math.sin(r+d), Math.cos(t+d)];
            var uv1 = [(y+0) / this.res, (x+0) / (2*this.res)];
            var uv2 = [(y+1) / this.res, (x+0) / (2*this.res)];
            var uv3 = [(y+0) / this.res, (x+1) / (2*this.res)];
            var uv4 = [(y+1) / this.res, (x+1) / (2*this.res)];

            // triangle 1
            allVerts = allVerts.concat(p1); allUV = allUV.concat(uv1);
            allVerts = allVerts.concat(p2); allUV = allUV.concat(uv2);
            allVerts = allVerts.concat(p4); allUV = allUV.concat(uv4);
            
            // triangle 2
            allVerts = allVerts.concat(p1); allUV = allUV.concat(uv1);
            allVerts = allVerts.concat(p4); allUV = allUV.concat(uv4);
            allVerts = allVerts.concat(p3); allUV = allUV.concat(uv3);
        }
    }

    // draw
    drawTriangle3DUVNormal(allVerts, allUV, allVerts);
  }
}




