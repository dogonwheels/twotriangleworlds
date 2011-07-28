createWorld = (function() {
    var initGL = function(canvas) {
        var gl;
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
        return gl;
    };
    var resizeScene = function(gl, canvas) {
        var viewport = $("#port");
        canvas.width = viewport.width();
        canvas.height = viewport.height();
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    };

    var initShaders = function(gl, vertexShaderSource, fragmentShaderSource, uniforms) {
        var createShader = function(gl, shader, text) {
            gl.shaderSource(shader, text);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };
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
        shaderProgram.viewMatrix = gl.getUniformLocation(shaderProgram, "viewMatrix");

        _(uniforms).each(function(uniform) {
            shaderProgram[uniform] = gl.getUniformLocation(shaderProgram, uniform);
        });
        return shaderProgram;
    };
    initBuffers = function(gl) {
        var quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        quadBuffer.itemSize = 3;
        quadBuffer.numItems = 4;
        return quadBuffer
    };
    drawScene = function(gl, quadBuffer, shaderProgram) {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var viewportSize = Math.min(canvas.width, canvas.height);
        gl.uniformMatrix2fv(shaderProgram.viewMatrix, false, new Float32Array([gl.viewportWidth / viewportSize, 0, 0, gl.viewportHeight / viewportSize]));

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, quadBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);
    };
    start = function(vertexShaderSource, fragmentShaderSource, uniforms, tick) {
        var canvas = document.getElementById("canvas");
        var gl = initGL(canvas);
        var shaderProgram = initShaders(gl, vertexShaderSource, fragmentShaderSource, uniforms);
        var quadBuffer = initBuffers(gl);
        gl.clearColor(1.0, 0.2, 0.4, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        var redraw = true;
        draw = function() {
            if (tick(gl, shaderProgram) || redraw) {
                drawScene(gl, quadBuffer, shaderProgram);
                redraw = false;
            }
        };
        resize = function() {
            resizeScene(gl, canvas);
            redraw = true;
            draw();
        };
        $(window).resize(resize);
        resize();
    };
    return start;
})();
