//
// Start here
//


// Game object declarations here ---------------------------------------------------------------->

// Colors
const colorBackground = [135, 206, 235];
const colorRed = [255, 135, 0];
const colorGold = [255, 215, 90];
const colorBrightRed = [255, 69, 0];
var grayscale = false;

// Key controls
var rightPressed = false;
var leftPressed = false;
var downPressed = false;
var spacePressed = false;
var cPressed = false;

// Game world descriptors
const groundY = 0.0;
const centreX = 0.0;
const laneWidth = 3;
const sceneZ = -21.0;
const limitDiffZ = 9;
var lastGenZ = [sceneZ, sceneZ, sceneZ];
var genNum = 1500;
var gameOver = false;
var flash = 134;
const obstacleNumLim = 30;

// Game objects
var player;
var lane = [];
var wall = [];
var coinCluster = [[], [], []];
var enemy1 = [];
var enemy2 = [];
var barricade = [];
var holeBarricade = [];
var boot = [];
var jet = [];

// Boost descriptors
const boostTimeLimit = 600;
const boostGenNum = 3000;
const boostNumLim = 3;
var boostGenFlag = 45;
var bootDraw = [];
var jetDraw = [];
var bootTime = 0;

// Coin descriptors
const coinDim = [0.5, 0.5, 0.5];
const coinNum = 7;

// Enemy1 descriptors
const enemy1Dim = [laneWidth, laneWidth, laneWidth];
var enemy1GenFlag = 94;

// Barricade descriptors
var barricadeFlag = 78;
var holeBarricadeFlag = 67;

// Player descriptors
const playerDim = [1, 2, 1];
const playerPos = [centreX, groundY + playerDim[1]/2, -10.0];
var movingRight = false;
var movingLeft = false;
var speedX = 0.25;
var speedZ = 0.1;
var currentLane = 1;
var playerScore = 0;
var isDucking = false;
var jumpHeight = 2;
var isJumping = false;

// ---------------------------------------------------------------------------------------------->



main();



function genEnemy1(gl) {
  var laneNum = Math.floor(Math.random() * 100) % 3;
  var ret = new cuboid(gl, [lane[laneNum].pos[0], groundY + enemy1Dim[1]/2, lastGenZ[laneNum] - Math.random()*50], enemy1Dim, loadTexture(gl, colorBrightRed, 1));
  lastGenZ[laneNum] = ret.pos[2] - ret.dim[2];
  return ret;
}

function genBarricade(gl) {
  var laneNum = Math.floor(Math.random() * 100) % 3;
  var ret = new cuboid(gl, [lane[laneNum].pos[0], 3*playerDim[1]/8, lastGenZ[laneNum] - Math.random()*50], [laneWidth, 3*playerDim[1]/4, 0.5], loadTexture(gl, "static/barricade.jpeg", 0));
  lastGenZ[laneNum] = ret.pos[2] - ret.dim[2];
  return ret;
}

function genHoleBarricade(gl) {
  var laneNum = Math.floor(Math.random() * 100) % 3;
  var ret = new cuboid(gl, [lane[laneNum].pos[0], 3*playerDim[1]/4 + playerDim[1]/16, lastGenZ[laneNum] - Math.random()*50], [laneWidth - playerDim[1]/8, playerDim[1]/8, 0.5], loadTexture(gl, "static/barricade.jpeg", 0));

  var ret1 = new cuboid(gl, [lane[laneNum].pos[0] - laneWidth/2 + playerDim[1]/8, 3*playerDim[1]/8, ret.pos[2]], [playerDim[1]/8, 3*playerDim[1]/4, 0.5], loadTexture(gl, "static/barricade.jpeg", 0));

  var ret2 = new cuboid(gl, [lane[laneNum].pos[0] + laneWidth/2 - playerDim[1]/8, 3*playerDim[1]/8, ret.pos[2]], [playerDim[1]/8, 3*playerDim[1]/4, 0.5], loadTexture(gl, "static/barricade.jpeg", 0));


  lastGenZ[laneNum] = ret.pos[2] - ret.dim[2];
  return {
    top: ret,
    legs: [ret1, ret2]
  };
}

function genBoostBoot(gl) {
  var laneNum = Math.floor(Math.random() * 100) % 3;
  var ret = new cuboid(gl, [lane[laneNum].pos[0], 1, lastGenZ[laneNum] - Math.random()*50], [1, 1, 1], loadTexture(gl, "static/boot.jpeg", 0));
  bootDraw.push(true);
  lastGenZ[laneNum] = ret.pos[2] - ret.dim[2];
  return ret;
}

function genBoostJet(gl) {
  var laneNum = Math.floor(Math.random() * 100) % 3;
  var ret = new cuboid(gl, [lane[laneNum].pos[0], 1, lastGenZ[laneNum] - Math.random()*50], [1, 1, 1], loadTexture(gl, "static/jet.jpeg", 0));
  jetDraw.push(true);
  lastGenZ[laneNum] = ret.pos[2] - ret.dim[2];
  return ret;
}


function tickInput() {
  // Key input actions
  if (rightPressed) {
    // Lane change to right
    if (!movingRight && currentLane != lane.length - 1 && !movingLeft) {
      movingRight = true;
      currentLane += 1;
    }
  }
  if (leftPressed) {
    // Lane change to left
    if (!movingLeft && currentLane != 0 && !movingRight) {
      movingLeft = true;
      currentLane -= 1;
    }
  }

  if (spacePressed) {
    if (!isJumping) {
      isJumping = true;
      player.speedY = Math.sqrt(2*player.accY*jumpHeight);
    }
  }
  else if (downPressed) {
    // Duck
    if (!isDucking) {
      isDucking = true;
      player.pos[1] -= playerDim[1]/4;
      player.scale[1] /= 2.0;
      player.dim[1] /= 2;
    }
  }

  if (!downPressed && isDucking) {
    // Revert duck
    isDucking = false;
    player.pos[1] += playerDim[1]/4;
    player.scale[1] *= 2.0;
    player.dim[1] *= 2;
  }

}


function tickElements(gl) {
  // Player coins collision

  // Player enemy1 collision
  enemy1.forEach(function (e1) {
    if (detectCollision(player, e1)) {
      // gameOver = true;
    }
  });

  // Player barricade collision
  barricade.forEach(function (b) {
    if (detectCollision(player, b)) {
      // gameOver = true;
    }
  });

  // Player hole barricade collision
  holeBarricade.forEach(function (hb) {
    if (detectCollision(player, hb.legs[0]) || detectCollision(player, hb.legs[1])) {
      // gameOver = true;
    }
    if (detectCollision(player, hb.top)) {
      console.log(player.pos, player.dim);
    }
  });

  // Player boot boost collision
  boot.forEach(function (bo, index) {
    if (detectCollision(player, bo) && bootDraw[index]) {
      bootTime = 0;
      bootDraw[index] = false;
      jumpHeight = 5;
    }
  });
  bootTime++;
  if (bootTime == boostTimeLimit && jumpHeight == 5) {
    jumpHeight = 2;
  }

  // Player jet boost collision
  jet.forEach(function (j, index) {
    if (detectCollision(player, j) && jetDraw[index]) {
      jetDraw[index] = false;
    }
  });

  // Random obstacle generation
  if (enemy1GenFlag % genNum < 100 && enemy1.length < obstacleNumLim) {
    enemy1.push(genEnemy1(gl));
  }
  if (barricadeFlag % genNum < 100 && barricade.length < obstacleNumLim) {
    barricade.push(genBarricade(gl));
  }
  if (holeBarricadeFlag % genNum < 100 && holeBarricade.length < obstacleNumLim) {
    holeBarricade.push(genHoleBarricade(gl));
  }
  enemy1GenFlag = (enemy1GenFlag + 1) % genNum;
  barricadeFlag = (barricadeFlag + 1) % genNum;
  holeBarricadeFlag = (holeBarricadeFlag + 1) % genNum;

  // Random boost generation
  if (boostGenFlag % boostGenNum < 100 && boot.length < boostNumLim) {
    boot.push(genBoostBoot(gl));
    jet.push(genBoostJet(gl));
  }
  boostGenFlag = (boostGenFlag + 1) % boostGenNum;

  // Random coin generation
  
  

  // Lane changing logic
  if (movingRight) {
    if (player.pos[0] >= lane[currentLane].pos[0])
      movingRight = false;
    else
      player.pos[0] += speedX;
  }
  if (movingLeft) {
    if (player.pos[0] <= lane[currentLane].pos[0])
      movingLeft = false;
    else
      player.pos[0] -= speedX;
  }

  // Falling Logic
  var final = player.speedY - player.accY / 60;
  var disp = (player.speedY * player.speedY - final * final) / (2 * player.accY);
  if (player.pos[1] + disp <= playerPos[1]) {
    isJumping = false;
  } else {
    player.pos[1] += disp;
    player.speedY = final;
  }



  // Objects move backward
  enemy1.forEach(function (e1) {
    e1.pos[2] += speedZ;
  });
  barricade.forEach(function (b) {
    b.pos[2] += speedZ; 
  });
  holeBarricade.forEach(function (hb) {
    hb.top.pos[2] += speedZ;
    hb.legs[0].pos[2] += speedZ;
    hb.legs[1].pos[2] += speedZ;
  });
  boot.forEach(function (bo) {
    bo.pos[2] += speedZ;
  });
  jet.forEach(function (j) {
    j.pos[2] += speedZ;
  });

  // Forward Movement Illusion
  if (Math.abs(wall[0].pos[2] + speedZ - player.pos[2]) <= limitDiffZ) {
    wall[0].pos[2] = sceneZ;
    wall[1].pos[2] = sceneZ;
  }
  wall[0].pos[2] += speedZ;
  wall[1].pos[2] += speedZ;
}


function initGame(gl) {
  // Initialize game objects here
  player = new cuboid(gl, Object.assign({}, playerPos), Object.assign({}, playerDim), loadTexture(gl, colorRed, 1));

  var trackTexture = loadTexture(gl, "static/track.jpg", 0);
  lane.push(new cuboid(gl, [centreX - laneWidth, groundY - 1, sceneZ], [laneWidth, 2, 40], trackTexture));
  lane.push(new cuboid(gl, [centreX, groundY - 1, sceneZ], [laneWidth, 2, 40], trackTexture));
  lane.push(new cuboid(gl, [centreX + laneWidth, groundY - 1, sceneZ], [laneWidth, 2, 40], trackTexture));
  
  var wallTexture = loadTexture(gl, "static/wall.png", 0);
  wall.push(new cuboid(gl, [centreX + 2.1*laneWidth, 2, sceneZ], [4, 4, 40], wallTexture));
  wall.push(new cuboid(gl, [centreX - 2.1*laneWidth, 2, sceneZ], [4, 4, 40], wallTexture));
}


function drawGame(gl, viewProjectionMatrix, programInfo, programInfoFlash, deltaTime) {
  // Render objects here
  player.draw(gl, viewProjectionMatrix, programInfo, deltaTime);

  lane.forEach(function (l) {
    l.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  });

  wall.forEach(function (w) {
    if (flash % 50 < 25) {
      w.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    }
    else {
      w.draw(gl, viewProjectionMatrix, programInfoFlash, deltaTime);
    }
  });
  flash = (flash + 1) % 50;

  enemy1.forEach(function (e1) {
    e1.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  })

  barricade.forEach(function (b) {
    b.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  })

  holeBarricade.forEach(function (hb) {
    hb.top.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    hb.legs[0].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    hb.legs[1].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  })

  boot.forEach(function (bo, index) {
    if (bootDraw[index])
      bo.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  });

  jet.forEach(function (j, index) {
    if (jetDraw[index])
      j.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  })
}


function detectCollision(a, b) {
  return 2*Math.abs(a.pos[0] - b.pos[0]) <= (a.dim[0] + b.dim[0]) &&
         2*Math.abs(a.pos[1] - b.pos[1]) <= (a.dim[1] + b.dim[1]) &&
         2*Math.abs(a.pos[2] - b.pos[2]) <= (a.dim[2] + b.dim[2]);
}



//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, urlOrColor, typeFlag) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  var color = [0, 0, 255, 255];
  if (typeFlag) {
    urlOrColor.push(255);
    color = urlOrColor;
  }
  
  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array(color);  // opaque blue
  
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border, srcFormat, srcType,
    pixel);
  
  // if (typeFlag)
  //   return texture;

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      srcFormat, srcType, image);
      
      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn of mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = urlOrColor;
  
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


function main() {

  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');


  // Keyboard Input code (don't change) -------------------------------------------------------------------------->
  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);

  function keyDownHandler(event) {
    if (event.keyCode == 39) {
      rightPressed = true;
    }
    else if (event.keyCode == 37) {
      leftPressed = true;
    }
    
    if (event.keyCode == 32) {
      spacePressed = true;
    }
    else if (event.keyCode == 40) {
      downPressed = true;
    }

    if (event.keyCode == 67) {
      cPressed = true;
    }
  }

  function keyUpHandler(event) {
    if (event.keyCode == 39) {
      rightPressed = false;
    }
    else if (event.keyCode == 37) {
      leftPressed = false;
    }

    if (event.keyCode == 32) {
      spacePressed = false;
    }
    else if (event.keyCode == 40) {
      downPressed = false;
    }

    if (event.keyCode == 67) {
      cPressed = false;
      grayscale = !grayscale;
    }
  }
  // ------------------------------------------------------------------------------------------------------------->


  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    // attribute vec4 aVertexColor;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    // varying lowp vec4 vColor;
    varying mediump vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      // vColor = aVertexColor;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program
  const fsSource = `
    // varying lowp vec4 vColor;

    varying mediump vec2 vTextureCoord;
    uniform sampler2D uSampler;

    void main(void) {
      // gl_FragColor = vColor;
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  const fsSourceGrayScale = `
    // varying lowp vec4 vColor;

    varying mediump vec2 vTextureCoord;
    uniform sampler2D uSampler;
    precision mediump float;

    void main(void) {
      // gl_FragColor = vColor;
      vec4 color = texture2D(uSampler, vTextureCoord);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(vec3(gray), 1.0);
    }
  `;

  const fsSourceFlash = `
    // varying lowp vec4 vColor;

    varying mediump vec2 vTextureCoord;
    uniform sampler2D uSampler;
    precision mediump float;

    void main(void) {
      // gl_FragColor = vColor;
      vec4 color = texture2D(uSampler, vTextureCoord);
      color += vec4(0.3, 0.3, 0.3, 0);
      gl_FragColor = color;
    }
  `;
  
  const fsSourceFlashAndGrayscale = `
    // varying lowp vec4 vColor;

    varying mediump vec2 vTextureCoord;
    uniform sampler2D uSampler;
    precision mediump float;

    void main(void) {
      // gl_FragColor = vColor;
      vec4 color = texture2D(uSampler, vTextureCoord);
      color += vec4(0.3, 0.3, 0.3, 0);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(vec3(gray), 1.0);
    }
`;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      // vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  const shaderProgramGrayScale = initShaderProgram(gl, vsSource, fsSourceGrayScale);

  const programInfoGrayScale = {
    program: shaderProgramGrayScale,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramGrayScale, 'aVertexPosition'),
      // vertexColor: gl.getAttribLocation(shaderProgramGrayScale, 'aVertexColor'),
      
      textureCoord: gl.getAttribLocation(shaderProgramGrayScale, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramGrayScale, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramGrayScale, 'uModelViewMatrix'),
      
      uSampler: gl.getUniformLocation(shaderProgramGrayScale, 'uSampler'),
    },
  };

  const shaderProgramFlash = initShaderProgram(gl, vsSource, fsSourceFlash);

  const programInfoFlash = {
    program: shaderProgramFlash,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramFlash, 'aVertexPosition'),
      // vertexColor: gl.getAttribLocation(shaderProgramFlash, 'aVertexColor'),
      
      textureCoord: gl.getAttribLocation(shaderProgramFlash, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramFlash, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramFlash, 'uModelViewMatrix'),
      
      uSampler: gl.getUniformLocation(shaderProgramFlash, 'uSampler'),
    },
  };

  const shaderProgramFlashAndGrayscale = initShaderProgram(gl, vsSource, fsSourceFlashAndGrayscale);

  const programInfoFlashAndGrayscale = {
    program: shaderProgramFlashAndGrayscale,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramFlashAndGrayscale, 'aVertexPosition'),
      // vertexColor: gl.getAttribLocation(shaderProgramFlashAndGrayscale, 'aVertexColor'),
      
      textureCoord: gl.getAttribLocation(shaderProgramFlashAndGrayscale, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramFlashAndGrayscale, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramFlashAndGrayscale, 'uModelViewMatrix'),
      
      uSampler: gl.getUniformLocation(shaderProgramFlashAndGrayscale, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  initGame(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    tickInput();
    tickElements(gl);

    if (gameOver) {
      alert("Game Over");
      return;
    }

    if (!grayscale)
      drawScene(gl, programInfo, programInfoFlash, deltaTime);
    else
      drawScene(gl, programInfoGrayScale, programInfoFlashAndGrayscale, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  var colorBack = colorBackground;
  if (grayscale) {
    var temp = colorBack[0]*0.299 + colorBack[1]*0.587 + colorBack[2]*0.114;
    colorBack = [temp, temp, temp];
  }

  gl.clearColor(colorBack[0] / 255, colorBack[1] / 255, colorBack[2] / 255, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(
    projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar
  );

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var cameraMatrix = mat4.create();
  
  var eye = [centreX, playerPos[1], player.pos[2]];
  var target = [centreX, 7 + playerPos[1], 10 + player.pos[2]];
  var up = [0, 1, 0];

  // if (isJumping) {
  //   eye[1] = player.pos[1];
  // }


  mat4.translate(
    cameraMatrix,
    cameraMatrix,
    target
  );
  
  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];


  mat4.lookAt(
    cameraMatrix,
    cameraPosition,
    eye,
    up
  );


  var viewMatrix = cameraMatrix;//mat4.create();

  //mat4.invert(viewMatrix, cameraMatrix);

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  // Scene Render
  drawGame(gl, viewProjectionMatrix, programInfo, deltaTime);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
