var canvas;
var gl;
var program; // Declare program at a broader scope

// Current position of the square
var box = vec2(0.0, 0.0);

// Direction (and speed) of the square
var dX;
var dY;

// Canvas boundaries
var maxX = 1.0;
var maxY = 1.0;

// Half-width/height of the square
var boxRad = 0.05;

// Square vertices
var vertices = new Float32Array([-boxRad, -boxRad, boxRad, -boxRad, boxRad, boxRad, -boxRad, boxRad]);

// Paddle properties
var paddleWidth = 0.2;
var paddleHeight = 0.03;
var paddleX = 0.0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Initialize square direction and speed
    dX = Math.random() * 0.1 - 0.05;
    dY = Math.random() * 0.1 - 0.05;

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load square data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

    // Associate shader variables with square data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Get uniform locations
    locBox = gl.getUniformLocation(program, "boxPos");
    locColor = gl.getUniformLocation(program, "vColor");

    // Event listener for arrow key presses
    window.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 37: // Left arrow key
                paddleX -= 0.05; // Move the paddle to the left
                break;
            case 39: // Right arrow key
                paddleX += 0.05; // Move the paddle to the right
                break;
            case 38: // Up arrow key (you can handle this for other purposes)
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40: // Down arrow key (you can handle this for other purposes)
                dX /= 1.1;
                dY /= 1.1;
                break;
        }
    });

    render();
};

function drawPaddle() {
    // Define vertices for the paddle
    var paddleVertices = new Float32Array([
        paddleX - paddleWidth / 2, -maxY, // Bottom-left
        paddleX + paddleWidth / 2, -maxY, // Bottom-right
        paddleX + paddleWidth / 2, -maxY + paddleHeight, // Top-right
        paddleX - paddleWidth / 2, -maxY + paddleHeight, // Top-left
    ]);

    // Load the paddle data into the GPU
    var paddleBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paddleVertices), gl.DYNAMIC_DRAW);

    // Associate shader variables with the paddle data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Set the paddle's color (for example, green)
    gl.uniform4fv(locColor, [0.0, 1.0, 0.0, 1.0]);

    // Draw the paddle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function render() {
    // Make the square bounce off the walls
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Update the square's position
    box[0] += dX;
    box[1] += dY;

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the square
    gl.uniform2fv(locBox, flatten(box));
    gl.uniform4fv(locColor, [1.0, 0.0, 0.0, 1.0]); // Set the square's color (for example, red)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Draw the paddle
    drawPaddle();

    window.requestAnimFrame(render);
}
