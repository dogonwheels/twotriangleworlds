(function() {
    var createFragmentShader, createShader, createVertexShader, drawScene, initBuffers, initGL, initShaders, loadIdentity, multMatrix, mvMatrix, mvTranslate, pMatrix, perspective, resizeScene, setMatrixUniforms, start;
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
        var viewport = $("#port");
        canvas.width = viewport.width();
        canvas.height = viewport.height();
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
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
    initShaders = function(gl, vertexShaderSource, fragmentShaderSource) {
        var fragmentShader = createShader(gl, gl.createShader(gl.FRAGMENT_SHADER), fragmentShaderSource);
        var vertexShader = createShader(gl, gl.createShader(gl.VERTEX_SHADER), vertexShaderSource);

        var shaderProgram = gl.createProgram();
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
        shaderProgram.viewMatrix = gl.getUniformLocation(shaderProgram, "viewMatrix");
        return shaderProgram;
    };
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
    pMatrix = Matrix.I(4);
    perspective = function(fovy, aspect, znear, zfar) {
        return pMatrix = makePerspective(fovy, aspect, znear, zfar);
    };
    setMatrixUniforms = function(gl, shaderProgram) {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
        return gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
    };
    initBuffers = function(gl) {
        var colors, squareVertexColorBuffer, squareVertexPositionBuffer, vertices;
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;
        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        colors = [1.0, 0.5, 1.0, 1.0, 0.5, 1.0, 1.0, 1.0, 0.5, 1.0, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;
        return [squareVertexPositionBuffer, squareVertexColorBuffer];
    };
    drawScene = function(gl, squareVertexPositionBuffer, squareVertexColorBuffer, shaderProgram) {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        pMatrix = makePerspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
        mvMatrix = Matrix.I(4);
        m = Matrix.Translation($V([0.0, 0.0, -3.0])).ensure4x4();
        mvMatrix = mvMatrix.x(m);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));


        var viewportSize = Math.min(canvas.width, canvas.height);
        gl.uniformMatrix2fv(shaderProgram.viewMatrix, false, new Float32Array([gl.viewportWidth / viewportSize, 0, 0, gl.viewportHeight / viewportSize]));
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms(gl, shaderProgram);
        return gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    };
    start = function(vertexShaderSource, fragmentShaderSource) {
        var canvas, draw, gl, resize, shaderProgram, squareBuffer, squareColors, _ref;
        canvas = document.getElementById("canvas");
        gl = initGL(canvas);
        shaderProgram = initShaders(gl, vertexShaderSource, fragmentShaderSource);
        _ref = initBuffers(gl), squareBuffer = _ref[0], squareColors = _ref[1];
        gl.clearColor(1.0, 0.2, 0.4, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        draw = function() {
            return drawScene(gl, squareBuffer, squareColors, shaderProgram);
        };
        resize = function() {
            resizeScene(gl, canvas);
            return draw();
        };
        $(window).resize(resize);
        resize();
    };
    document.start = start;
}).call(this);
