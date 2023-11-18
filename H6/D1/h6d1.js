var numVertices = 36; // Number of vertices for rendering

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -25.0;

var points = [];
var colors = [];

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
];

// RGBA colors
var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0), // cyan
    vec4(1.0, 1.0, 1.0, 1.0), // white
];

// Parameters controlling the size of the double pendulum
var length1 = 100; // Length of the upper pendulum
var length2 = 100; // Length of the lower pendulum

var angle1 = 0; // Angle for the upper pendulum
var angle2 = 0; // Angle for the lower pendulum
var angle1Velocity = 0; // Angular velocity for upper pendulum
var angle2Velocity = 0; // Angular velocity for lower pendulum

var angle1Acceleration = 0; // Angular acceleration for upper pendulum
var angle2Acceleration = 0; // Angular acceleration for lower pendulum

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc;

var vBuffer, cBuffer;

// Quadratic bezier control points for drawing
var controlPoints = [];

//--------------------------------------------------

function quad(a, b, c, d) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

//--------------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------------

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.9, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = perspective(60.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    // Event listeners for mouse and keyboard controls
    canvas.addEventListener("mousedown", function (e) {
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();
    });

    canvas.addEventListener("mouseup", function (e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (movement) {
            spinY = (spinY + (e.clientX - origX)) % 360;
            spinX = (spinX + (origY - e.clientY)) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    });

    window.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 38: // up arrow
                zDist += 1.0;
                break;
            case 40: // down arrow
                zDist -= 1.0;
                break;
            case 39: // right arrow (→)
                angle1Velocity += 0.5;
                break;
            case 37: // left arrow (←)
                angle1Velocity -= 0.5;
                break;
        }
    });

    window.addEventListener("mousewheel", function (e) {
        if (e.wheelDelta > 0.0) {
            zDist += 1.0;
        } else {
            zDist -= 1.0;
        }
    });

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt(vec3(0.0, 2.0, zDist), vec3(0.0, 2.0, 0.0), vec3(0.0, 1.0, 0.0));
    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));

    // Update the double pendulum angles and positions here

    // Set modelViewMatrix and render the double pendulum
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame(render);
}
