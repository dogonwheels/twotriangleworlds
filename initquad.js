(function() {
  var createFragmentShader, createShader, createVertexShader, drawScene, fragmentShaderSource, initBuffers, initGL, initShaders, loadIdentity, multMatrix, mvMatrix, mvMatrixStack, mvPopMatrix, mvPushMatrix, mvRotate, mvTranslate, pMatrix, perspective, rTri, resizeScene, setMatrixUniforms, start, vertexShaderSource;
  vertexShaderSource = "attribute vec3 aVertexPosition;\nattribute vec4 aVertexColor;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n  vColor = aVertexColor;\n}";
  fragmentShaderSource = "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  gl_FragColor = vColor;\n}";
  initGL = function(canvas) {
    var gl;
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
    }
    return gl;
  };
  resizeScene = function(gl, canvas) {
    var height, width, _ref;
    _ref = [$("#port").width(), $("#port").height()], width = _ref[0], height = _ref[1];
    canvas.width = width;
    gl.viewportWidth = width;
    canvas.height = height;
    return gl.viewportHeight = height;
  };
  createFragmentShader = function(gl, text) {
    var shader;
    shader = gl.createShader(gl.FRAGMENT_SHADER);
    return createShader(gl, shader, text);
  };
  createVertexShader = function(gl, text) {
    var shader;
    shader = gl.createShader(gl.VERTEX_SHADER);
    return createShader(gl, shader, text);
  };
  createShader = function(gl, shader, text) {
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };
  initShaders = function(gl) {
    var fragmentShader, shaderProgram, vertexShader;
    fragmentShader = createFragmentShader(gl, fragmentShaderSource);
    vertexShader = createVertexShader(gl, vertexShaderSource);
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    return shaderProgram;
  };
  mvMatrix = Matrix.I(4);
  loadIdentity = function() {
    return mvMatrix = Matrix.I(4);
  };
  multMatrix = function(m) {
    return mvMatrix = mvMatrix.x(m);
  };
  mvTranslate = function(v) {
    var m;
    m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
    return multMatrix(m);
  };
  mvMatrixStack = [];
  mvPushMatrix = function(m) {
    if (m) {
      mvMatrixStack.push(m.dup());
      return mvMatrix = m.dup();
    } else {
      return mvMatrixStack.push(mvMatrix.dup());
    }
  };
  mvPopMatrix = function() {
    if (mvMatrixStack.length === 0) {
      throw "Invalid pop";
    }
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
  };
  mvRotate = function(ang, v) {
    var arad, m;
    arad = ang * Math.PI / 180.0;
    m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
    return multMatrix(m);
  };
  pMatrix = Matrix.I(4);
  perspective = function(fovy, aspect, znear, zfar) {
    return pMatrix = makePerspective(fovy, aspect, znear, zfar);
  };
  setMatrixUniforms = function(gl, shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    return gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
  };
  rTri = 0;
  initBuffers = function(gl) {
    var colors, squareVertexColorBuffer, squareVertexPositionBuffer, triangleVertexColorBuffer, triangleVertexPositionBuffer, vertices;
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    vertices = [0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;
    triangleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    colors = [1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = 3;
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    colors = [0.5, 0.5, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems = 4;
    return [triangleVertexPositionBuffer, squareVertexPositionBuffer, triangleVertexColorBuffer, squareVertexColorBuffer];
  };
  drawScene = function(gl, triangleVertexPositionBuffer, squareVertexPositionBuffer, triangleVertexColorBuffer, squareVertexColorBuffer, shaderProgram) {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    rTri += 10;
    perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    loadIdentity();
    mvTranslate([-1.5, 0.0, -7.0]);
    mvPushMatrix();
    mvRotate(rTri, [0, 1, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, shaderProgram);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
    mvPopMatrix();
    mvTranslate([3.0, 0.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, shaderProgram);
    return gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
  };
  start = function() {
    var canvas, cleanup, draw, gl, refreshId, resize, shaderProgram, squareBuffer, squareColors, triangleBuffer, triangleColors, _ref;
    canvas = document.getElementById("canvas");
    gl = initGL(canvas);
    shaderProgram = initShaders(gl);
    _ref = initBuffers(gl), triangleBuffer = _ref[0], squareBuffer = _ref[1], triangleColors = _ref[2], squareColors = _ref[3];
    gl.clearColor(1.0, 0.2, 0.4, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    draw = function() {
      return drawScene(gl, triangleBuffer, squareBuffer, triangleColors, squareColors, shaderProgram);
    };
    resize = function() {
      resizeScene(gl, canvas);
      return draw();
    };
    $(window).resize(resize);
    resize();
    refreshId = setInterval(draw, 15);
  };
  document.start = start;
}).call(this);
