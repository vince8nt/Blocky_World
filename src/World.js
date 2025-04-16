// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform bool u_normalOn;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    if (u_normalOn)
      v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    else
      v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform bool u_lightOn;
  uniform bool u_normVis;
  uniform int u_whichTexture;
  uniform float u_shiny;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightColor;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;

  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightDir;
  uniform float u_spotlightCos;
  uniform float u_spotlightExp;

  void main() {

    // textures
    if (u_whichTexture == -3 || u_normVis) { // use normal
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    }
    else if (u_whichTexture == -2) { // use color
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) { // use UV
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) { // use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) { // use texture1
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else { // Error, red-ish color
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }

    // lighting
    if (u_lightOn) {
      vec3 lightVector = u_lightPos - vec3(v_VertPos);
      float r = length(lightVector);
      // N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, L), 0.0);
      // reflection
      vec3 R = reflect(-L, N);
      // eye
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
      // specular
      float S = max(dot(E, R), 0.0);
      vec3 specular = vec3(gl_FragColor) * S * u_shiny;
      vec3 diffuse = vec3(gl_FragColor) * nDotL;
      vec3 ambient = vec3(gl_FragColor) * 0.3;


      float spotFactor = 0.0;  // multiplier to account for spotlight
      L = normalize(u_spotlightPos - vec3(v_VertPos));
      vec3 D = -normalize(u_spotlightDir);
      float spotCosine = dot(D,L);
      if (spotCosine >= u_spotlightCos) { // point inside spotlight
        spotFactor = pow(spotCosine, u_spotlightExp);
      }
      vec3 spotlight = vec3(gl_FragColor) * spotFactor;


      if (u_spotlightOn)
        gl_FragColor = vec4(ambient + spotlight * u_lightColor, gl_FragColor.a);
      else
        gl_FragColor = vec4(ambient + diffuse * u_lightColor + specular * u_lightColor, gl_FragColor.a);

    }

  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_whichTexture;
let u_shiny;
let u_FragColor;
let u_lightPos;
let u_cameraPos;
let u_lightColor;
let u_lightOn;
let u_normVis;
let u_normalOn;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;

// spotlight
let u_spotlightOn;
let u_spotlightPos;
let u_spotlightDir;
let u_spotlightCos;
let u_spotlightExp;


var keysDown = []; // current keys down
var myMap;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // enable depth test
  gl.enable(gl.DEPTH_TEST);

  // enable transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_shiny
  u_shiny = gl.getUniformLocation(gl.program, 'u_shiny');
  if (!u_shiny) {
    console.log('Failed to get the storage location of u_shiny');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_lightColor
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_normVis
  u_normVis = gl.getUniformLocation(gl.program, 'u_normVis');
  if (!u_normVis) {
    console.log('Failed to get the storage location of u_normVis');
    return;
  }

  // Get the storage location of u_normalOn
  u_normalOn = gl.getUniformLocation(gl.program, 'u_normalOn');
  if (!u_normalOn) {
    console.log('Failed to get the storage location of u_normalOn');
    return;
  }

  // set the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // set the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  // set the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('failed to get the storage location of u_Sampler0');
    return false;
  }

  // get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('failed to get the storage location of u_Sampler1');
    return false;
  }

  // set the initial value for this matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  // for spotlight
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if(!u_spotlightOn) {
    console.log('failed to get the storage location of u_spotlightOn');
    return false;
  }
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if(!u_spotlightPos) {
    console.log('failed to get the storage location of u_spotlightPos');
    return false;
  }
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  if(!u_spotlightDir) {
    console.log('failed to get the storage location of u_spotlightDir');
    return false;
  }
  u_spotlightCos = gl.getUniformLocation(gl.program, 'u_spotlightCos');
  if(!u_spotlightCos) {
    console.log('failed to get the storage location of u_spotlightCos');
    return false;
  }
  u_spotlightExp = gl.getUniformLocation(gl.program, 'u_spotlightExp');
  if(!u_spotlightExp) {
    console.log('failed to get the storage location of u_spotlightExp');
    return false;
  }


}

// global vars for UI
let g_sus = 0;

let g_startTime = performance.now();
let g_lastFrame = performance.now();
var g_seconds = (performance.now() - g_startTime) / 1000;

//global animation vars
var g_bounce  = 0,  g_bounceSlide  = 0;
var g_swingL1 = 0,  g_swingL1Slide = 0;
var g_swingL2 = 0,  g_swingL2Slide = 0;
var g_swingR1 = 0,  g_swingR1Slide = 0;
var g_swingR2 = 0,  g_swingR2Slide = 0;
let g_bounceAni = true;
let g_runAni = true;
var g_runningCircleDeg = 0;
var g_globalAngle = 0;
let g_lightAni = true;
let g_lightOn = true;
let g_spotlightOn = false;
let g_normalOn = true;
let g_normVis = false;
let g_lightPos = [0, 10, 0];
let g_lightColor = [1.0, 1.0, 1.0];

// setup the actions for the HTML UI elements
function addActionsForHtmlUI() {
  // sus slider
  document.getElementById('susSlide').addEventListener('mousemove',  function() {
    g_sus = this.value; });
  // color sliders
  document.getElementById('rSlide').addEventListener('mousemove',  function() {
    g_lightColor[0] = this.value / 10; });
  document.getElementById('gSlide').addEventListener('mousemove',  function() {
    g_lightColor[1] = this.value / 10; });
  document.getElementById('bSlide').addEventListener('mousemove',  function() {
    g_lightColor[2] = this.value / 10; });
  // light slider
  document.getElementById('lPosSlide').addEventListener('mousemove',  function() {
    g_lightPos = [16 + 7 * Math.cos(this.value / 180 * Math.PI), 7,
    16 + 13 * Math.sin(this.value / 180 * Math.PI)]; });
  
  // button events
  document.getElementById('lightAniOn').onclick = function() {
    g_lightAni = true; };
  document.getElementById('lightAniOff').onclick = function() {
    g_lightAni = false; };
  document.getElementById('lightOn').onclick = function() {
    g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() {
    g_lightOn = false; };
  document.getElementById('spotlightOn').onclick = function() {
    g_spotlightOn = true; };
  document.getElementById('spotlightOff').onclick = function() {
    g_spotlightOn = false; };
  document.getElementById('normOn').onclick = function() {
    g_normalOn = true; };
  document.getElementById('normOff').onclick = function() {
    g_normalOn = false; };
  document.getElementById('normVOn').onclick = function() {
    g_normVis = true; };
  document.getElementById('normVOff').onclick = function() {
    g_normVis = false; };
}

function initTextures(gl, n) {
  
  // create the image objects
  var image0 = new Image();
  if (!image0) {
    console.log('failed to create the image0 object');
    return false;
  }
  var image1 = new Image();
  if (!image1) {
    console.log('failed to create the image1 object');
    return false;
  }
  // register the event handlers to be called on loading an image
  image0.onload = function() { sendTextureToGLSL(image0, 0); };
  image0.src = 'images/block.png';
  image1.onload = function() { sendTextureToGLSL(image1, 1); };
  image1.src = 'images/brick.png';
  return true;
}

function sendTextureToGLSL(image, num) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('failed to create the texture object');
    return false;
  }

  if (num == 0) {
    // flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // bind the texture onect to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
  }
  else {
    // flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit1
    gl.activeTexture(gl.TEXTURE1);
    // bind the texture onect to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // set the texture unit 1 to the sampler
    gl.uniform1i(u_Sampler1, 1);
  }

  console.log('finished loadTexture');
}

function captureKeys() {
  // keep track of which keys are pressed
  for (var i = 0; i < 256; i++)
    keysDown[i] = false;
  document.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
  });
  document.addEventListener("keyup", function(event) {
    keysDown[event.keyCode] = false;
  });
}

function buildMap() {
  // pillars
  wallMap.addBlocks(0, 0, 5, 5, 8);
  wallMap.addBlocks(0, 27, 5, 5, 8);
  wallMap.addBlocks(27, 0, 5, 5, 8);
  wallMap.addBlocks(27, 27, 5, 5, 8);
  // walls
  wallMap.addBlocks(0, 5, 1, 22, 3);
  wallMap.addBlocks(5, 0, 22, 1, 3);
  wallMap.addBlocks(31, 5, 1, 22, 3);
  wallMap.addBlocks(5, 31, 22, 1, 3);

  // combo pyramid 1
  wallMap.addBlocks(10, 7, 5, 5, 2);
  structMap.addBlocks(11, 8, 3, 3, 4);
  wallMap.addBlocks(12, 9, 1, 1, 6);

  // combo pyramid 2
  structMap.addBlocks(16, 7, 6, 5, 4);
  wallMap.addBlocks(17, 8, 4, 3, 8);
  structMap.addBlocks(18, 9, 2, 1, 20);
  
  // house
  structMap.addBlocks(6, 13, 1, 5, 3);
  structMap.addBlocks(7, 13, 5, 1, 3);
  structMap.addBlocks(12, 13, 1, 5, 3);
  structMap.addBlocks(7, 17, 2, 1, 3);
  structMap.addBlocks(10, 17, 2, 1, 3);

  // other stuff
  structMap.addBlocks(3, 12, 1, 6, 2);
  structMap.addBlocks(3, 9,  2, 3, 10);
  structMap.addBlocks(2, 8,  4, 1, 5);
  structMap.addBlocks(3, 7,  4, 1, 1);
  
  // pyramid
  structMap.addBlocks(14, 13, 10, 11, 1);
  structMap.addBlocks(24, 13, 1, 10, 1);
  structMap.addBlocks(15, 14, 9, 9, 2);
  structMap.addBlocks(16, 15, 7, 7, 3);
  structMap.addBlocks(17, 16, 5, 5, 4);
  structMap.addBlocks(18, 17, 3, 3, 5);
  structMap.addBlocks(19, 18, 1, 1, 6);

  // create shell for faster rendering
  wallMap.createShell();
  structMap.createShell();
}

function main() {
  
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  captureKeys()

  initTextures(gl, 0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // create map
  wallMap = new Map(32, 32);
  wallMap.textureNum = 0;
  wallMap.shiny = 0.8;
  structMap = new Map(32, 32);
  structMap.textureNum = 1;
  structMap.shiny = 0.0;
  buildMap();

  // start ticking
  requestAnimationFrame(tick);
}

function tick() {
  var thisFrame = performance.now();
  var duration = thisFrame - g_lastFrame;
  g_lastFrame = thisFrame;
  sendTextToHTML("ms: " + Math.floor(duration) +
    " fps: " + Math.floor(1000/duration), "numdot");

  updateAnimationAngles();
  moveCamera(duration);
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  g_seconds = (performance.now() - g_startTime) / 1000;
  if (g_bounceAni) g_bounce = .2 * Math.abs(Math.sin(g_seconds * 5));
  else g_bounce = g_bounceSlide / 100;
  if (g_runAni) {
    g_swingL1 = 30 * Math.sin(g_seconds * 5);
    g_swingL2 = -20 + 20 * Math.sin(g_seconds * 5 - 2);
    g_swingR1 = 30 * -Math.sin(g_seconds * 5);
    g_swingR2 = -20 + 20 * -Math.sin(g_seconds * 5 - 2);
  }
  else {
    g_swingL1 = g_swingL1Slide;
    g_swingL2 = g_swingL2Slide;
    g_swingR1 = g_swingR1Slide;
    g_swingR2 = g_swingR2Slide;
  }

  g_runningCircleDeg = (g_seconds * 7) % 360;
  if (g_lightAni)
    g_lightPos = [16 + 7 * Math.cos(-1 * g_seconds), 7, 16 + 13 * Math.sin(-1 * g_seconds)];
}

var hRot = 0;
var vRot = 0;
var g_eye = new Vector3([11, 1, 21]);
var g_at = new Vector3([11, 1, -82]);
var g_up = new Vector3([0, 1, 0]);

function moveCamera(frameTime) {
  if (frameTime > 100) frameTime = 100; // for lag spikes
  var d = new Vector3(g_at.elements);
  d.sub(g_eye);
  d.normalize();
  var s = Vector3.cross(d, g_up);
  s.normalize();
  //scale to frameTime
  d.mul(frameTime / 200);
  s.mul(frameTime / 200);

  if (keysDown[87]) { // W
    g_eye.add(d);
  }
  else if (keysDown[65]) { // A
    g_eye.sub(s);
  }
  else if (keysDown[83]) { // S
    g_eye.sub(d);
  }
  else if (keysDown[68]) { // D
    g_eye.add(s);
  }

  if (keysDown[37] || keysDown[81]) { // left arrow or Q
    hRot -= frameTime / 400;
  }
  else if (keysDown[39] || keysDown[69]) { // right arrow or E
    hRot += frameTime / 400;
  }
  if (keysDown[38]) { // up arrow
    vRot += frameTime / 400;
    if (vRot > 1) vRot = 1;
  }
  else if (keysDown[40]) { // down arrow
    vRot -= frameTime / 400;
    if (vRot < -1) vRot = -1;
  }
  var x = g_eye.elements[0] + Math.sin(hRot) * Math.cos(vRot) * 103;
  var y = g_eye.elements[1] + Math.sin(vRot) * 103;
  var z = g_eye.elements[2] - Math.cos(hRot) * Math.cos(vRot) * 103;
  g_at.setTo(x, y, z);
  
}

// draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // pass the projection matrix
  var projMatrix = new Matrix4();
  projMatrix.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);
  // pass the view matrix
  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(g_eye.elements[0], g_eye.elements[1], g_eye.elements[2],
                       g_at.elements[0],  g_at.elements[1],  g_at.elements[2],
                       g_up.elements[0],  g_up.elements[1],  g_up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // Pass the rotation matrix
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // pass light + camera position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform3f(u_cameraPos, g_eye.elements[0], g_eye.elements[1], g_eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_normVis, g_normVis);
  gl.uniform1i(u_normalOn, g_normalOn);
  // spotlight
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform3f(u_spotlightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_spotlightDir, 0.0, -1.0, 0.0);
  gl.uniform1f(u_spotlightCos, 0.8);
  gl.uniform1f(u_spotlightExp, 8);



  // light
  var light = new Cube();
  light.textureNum = -2;
  light.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-.5, -.5, -.5);
  light.normalMatrix.setInverseOf(light.matrix).transpose();
  light.render();

  // Ground plane
  var groundPlane = new Cube();
  groundPlane.textureNum = -2;
  groundPlane.color = [0.5, 0.5, 0.5, 1.0];
  groundPlane.matrix.translate(0, -1, 0);
  groundPlane.matrix.scale(64, 1, 64);
  groundPlane.render();

  // Sky box
  var skyBox = new Cube();
  skyBox.textureNum = -2;
  skyBox.shiny = 0.0;
  skyBox.color = [0.6, 0.7, 1.0, 1.0];
  skyBox.matrix.scale(-96, -96, -96);
  skyBox.matrix.translate(-.75, -.75, -.75);
  skyBox.render();

  // spheres
  var s1 = new Sphere();
  s1.textureNum = 0;
  s1.shiny = 0.8;
  s1.color = [0.0, 0.0, 0.0, 1.0];
  s1.matrix.translate(8, 4, 19);
  s1.matrix.rotate(g_runningCircleDeg, 0, 1, 0);
  s1.normalMatrix.setInverseOf(s1.matrix).transpose();
  s1.render();
  var s2 = new Sphere();
  s2.textureNum = 1;
  s2.shiny = 0.2;
  s2.color = [0.0, 0.0, 0.0, 1.0];
  s2.matrix.translate(10, 5, 20);
  s2.render();
  var s3 = new Sphere();
  s3.textureNum = -2;
  s3.shiny = 0.9;
  s3.color = [0.1, 0.7, 0.2, 1.0];
  s3.matrix.translate(13, 3, 25);
  s3.render();

  // blocks
  wallMap.drawShell();
  structMap.drawShell();

  // imposters
  if (g_sus < 1) return;
  // red imposter
  var red = new Cube();
  red.matrix.setTranslate(16.5, 0.58, 16.5);
  red.matrix.rotate(g_runningCircleDeg, 0, 1, 0);
  red.matrix.translate(12, 0, 0);
  renderImposter(red.matrix, [1.0, 0.0, 0.0, 1.0]);

  if (g_sus < 2) return;
  // blue imposter
  var blue = new Cube();
  blue.matrix.setTranslate(16.5, 0.58, 16.5);
  blue.matrix.rotate(g_runningCircleDeg + 90, 0, 1, 0);
  blue.matrix.translate(12, 0, 0);
  renderImposter(blue.matrix, [0.2, 0.2, 1.0, 1.0]);

  if (g_sus < 3) return;
  // green imposter
  var green = new Cube();
  green.matrix.setTranslate(16.5, 0.58, 16.5);
  green.matrix.rotate(g_runningCircleDeg + 180, 0, 1, 0);
  green.matrix.translate(12, 0, 0);
  renderImposter(green.matrix, [0.1, 0.7, 0.1, 1.0]);

  if (g_sus < 4) return;
  // yellow imposter
  var yellow = new Cube();
  yellow.matrix.setTranslate(16.5, 0.58, 16.5);
  yellow.matrix.rotate(g_runningCircleDeg + 270, 0, 1, 0);
  yellow.matrix.translate(12, 0, 0);
  renderImposter(yellow.matrix, [0.9, 1.0, 0.1, 1.0]);
  
}

function renderImposter(imposterCoordsMat, color) {
  // draw the body cubes
  var bodyCenter = new Cube();
  bodyCenter.matrix.set(imposterCoordsMat);
  bodyCenter.color = color;
  bodyCenter.matrix.translate(0, 0 + g_bounce, 0);
  bodyCenter.matrix.scale    (0.4, 0.5, 0.4);
  bodyCenter.matrix.translate(-.5, -.5, -.5);
  bodyCenter.normalMatrix.setInverseOf(bodyCenter.matrix).transpose();
  bodyCenter.render();
  var bodyX = new Cube();
  bodyX.matrix.set(imposterCoordsMat);
  bodyX.color = color;
  bodyX.matrix.translate(0, 0 + g_bounce, 0);
  bodyX.matrix.scale    (0.5, 0.4, 0.3);
  bodyX.matrix.translate(-.5, -.5, -.5);
  bodyX.normalMatrix.setInverseOf(bodyX.matrix).transpose();
  bodyX.render();
  var bodyY = new Cube();
  bodyY.matrix.set(imposterCoordsMat);
  bodyY.color = color;
  bodyY.matrix.translate(0, 0 + g_bounce, 0);
  bodyY.matrix.scale    (0.3, 0.6, 0.3);
  bodyY.matrix.translate(-.5, -.5, -.5);
  bodyY.normalMatrix.setInverseOf(bodyY.matrix).transpose();
  bodyY.render();
  var bodyZ = new Cube();
  bodyZ.matrix.set(imposterCoordsMat);
  bodyZ.color = color;
  bodyZ.matrix.translate(0, 0 + g_bounce, 0);
  bodyZ.matrix.scale    (0.3, 0.4, 0.5);
  bodyZ.matrix.translate(-.5, -.5, -.5);
  bodyZ.normalMatrix.setInverseOf(bodyZ.matrix).transpose();
  bodyZ.render();
  var backpack = new Cube();
  backpack.matrix.set(imposterCoordsMat);
  backpack.color = [color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1.0];
  backpack.matrix.translate(0, -.05 + g_bounce, .3);
  backpack.matrix.scale    (.4, 0.4, 0.2);
  backpack.matrix.translate(-.5, -.5, -.5);
  backpack.normalMatrix.setInverseOf(backpack.matrix).transpose();
  backpack.render();
  var visor = new Cube();
  visor.matrix.set(imposterCoordsMat);
  visor.color = [0.7, 0.8, 1.0, 1.0];
  visor.matrix.translate(0, .08 + g_bounce, -.21);
  visor.matrix.scale    (.35, 0.2, 0.1);
  visor.matrix.translate(-.5, -.5, -.5);
  visor.normalMatrix.setInverseOf(visor.matrix).transpose();
  visor.render();

  // draw upper left leg
  var uLeftLeg = new Cube();
  uLeftLeg.matrix.set(imposterCoordsMat);
  uLeftLeg.color = [color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1.0];
  uLeftLeg.matrix.translate(.1, -.3 + g_bounce, 0);
  uLeftLeg.matrix.rotate(g_swingL1, 1, 0, 0);
  //set knee joint
  uLeftLeg.matrix.translate(0, -.12, 0);
  var LeftLegCoordsMat = new Matrix4(uLeftLeg.matrix);
  uLeftLeg.matrix.translate(0, .12, 0);
  // draw upper left leg
  uLeftLeg.matrix.scale(.175, .3, .2);
  uLeftLeg.matrix.translate(-.5, -.5, -.5);
  uLeftLeg.normalMatrix.setInverseOf(uLeftLeg.matrix).transpose();
  uLeftLeg.render();
  // draw lower left leg
  var lLeftLeg = new Cube();
  lLeftLeg.color = [color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1.0];
  lLeftLeg.matrix = LeftLegCoordsMat;
  lLeftLeg.matrix.rotate(g_swingL2, 1, 0, 0);
  lLeftLeg.matrix.translate(0, -.05, 0);
  lLeftLeg.matrix.scale(.175, .2, .2);
  lLeftLeg.matrix.translate(-.5, -.5, -.5);
  lLeftLeg.normalMatrix.setInverseOf(lLeftLeg.matrix).transpose();
  lLeftLeg.render();

  // draw upper right leg
  var uRightLeg = new Cube();
  uRightLeg.matrix.set(imposterCoordsMat);
  uRightLeg.color = [color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1.0];
  uRightLeg.matrix.translate(-.1, -.3 + g_bounce, 0);
  uRightLeg.matrix.rotate(g_swingR1, 1, 0, 0);
  //set knee joint
  uRightLeg.matrix.translate(0, -.12, 0);
  var RightLegCoordsMat = new Matrix4(uRightLeg.matrix);
  uRightLeg.matrix.translate(0, .12, 0);
  // draw upper left leg
  uRightLeg.matrix.scale(.175, .3, .2);
  uRightLeg.matrix.translate(-.5, -.5, -.5);
  uRightLeg.normalMatrix.setInverseOf(uRightLeg.matrix).transpose();
  uRightLeg.render();
  // draw lower right leg
  var lRightLeg = new Cube();
  lRightLeg.color = [color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1.0];
  lRightLeg.matrix = RightLegCoordsMat;
  lRightLeg.matrix.rotate(g_swingR2, 1, 0, 0);
  lRightLeg.matrix.translate(0, -.05, 0);
  lRightLeg.matrix.scale(.175, .2, .2);
  lRightLeg.matrix.translate(-.5, -.5, -.5);
  lRightLeg.normalMatrix.setInverseOf(lRightLeg.matrix).transpose();
  lRightLeg.render();

  // draw shadow
  var shadow = new Cube();
  shadow.matrix.set(imposterCoordsMat);
  shadow.color = [.3,.3,.3,1.0];
  shadow.matrix.translate(0, -.61009, 0);
  shadow.matrix.scale((.8-g_bounce)*.5, .1, (.8-g_bounce)*.5);
  shadow.matrix.translate(-.5, -.5, -.5);
  shadow.normalMatrix.setInverseOf(shadow.matrix).transpose();
  shadow.render();
  var shadowX = new Cube();
  shadowX.matrix.set(imposterCoordsMat);
  shadowX.color = [.3,.3,.3,1.0];
  shadowX.matrix.translate(0, -.61009, 0);
  shadowX.matrix.scale((.8-g_bounce)*.6, .1, (.8-g_bounce)*.4);
  shadowX.matrix.translate(-.5, -.5, -.5);
  shadowX.normalMatrix.setInverseOf(shadowX.matrix).transpose();
  shadowX.render();
  var shadowZ = new Cube();
  shadowZ.matrix.set(imposterCoordsMat);
  shadowZ.color = [.3,.3,.3,1.0];
  shadowZ.matrix.translate(0, -.61009, 0);
  shadowZ.matrix.scale((.8-g_bounce)*.4, .1, (.8-g_bounce)*.6);
  shadowZ.matrix.translate(-.5, -.5, -.5);
  shadowZ.normalMatrix.setInverseOf(shadowZ.matrix).transpose();
  shadowZ.render();
}

function sendTextToHTML (text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }
  htmlElm.innerHTML = text;
}






