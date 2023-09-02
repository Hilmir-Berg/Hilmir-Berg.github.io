"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5; // You can increase this for more detail

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Initialize the corners of the square
    var vertices = [
        vec2(-1, -1),
        vec2(-1, 1),
        vec2(1, 1),
        vec2(1, -1)
    ];

    divideSquare(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate shader variables with data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

function square(a, b, c, d) {
    points.push(a, b, c, a, c, d);
}

function divideSquare(a, b, c, d, count) {
    if (count === 0) {
        square(a, b, c, d);
    } else {
        var midAB1 = mix(a, b, 1 / 3);
        var midAB2 = mix(a, b, 2 / 3);
        var midBC1 = mix(b, c, 1 / 3);
        var midBC2 = mix(b, c, 2 / 3);
        var midCD1 = mix(c, d, 1 / 3);
        var midCD2 = mix(c, d, 2 / 3);
        var midDA1 = mix(d, a, 1 / 3);
        var midDA2 = mix(d, a, 2 / 3);

        var midE = mix(midAB1, midCD2, 1 / 3);
        var midF = mix(midAB1, midCD2, 2 / 3);
        var midG = mix(midAB2, midCD1, 1 / 3);
        var midH = mix(midAB2, midCD1, 2 / 3);

        --count;

        // Divide the square into 8 smaller squares
        divideSquare(midAB2, b, midBC1, midG, count); // Top left
        divideSquare(midG, midBC1, midBC2, midH, count); // Top center
        divideSquare(midH, midBC2, c, midCD1, count); // Top right

        divideSquare(midAB1, midAB2, midG, midE, count); // Middle left
        // Middle center (no further division)
        divideSquare(midF, midH, midCD1, midCD2, count); // Middle right

        divideSquare(a, midAB1, midE, midDA2, count); // Bottom left
        divideSquare(midDA2, midE, midF, midDA1, count); // Bottom center
        divideSquare(midDA1, midF, midCD2, d, count); // Bottom right
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
