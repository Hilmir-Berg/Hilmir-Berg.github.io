var gl;
var points;

var NumTriangles = 100;
var colorLoc;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Create an array of vertices for a small equilateral triangle
    var triangleVertices = [
        vec2(-0.05, -0.05),
        vec2(0.05, -0.05),
        vec2(0.0, 0.05)
    ];

    // Array to hold vertices for all triangles
    var triangles = [];

    for (var i = 0; i < NumTriangles; i++) {
        // Random number from [-1,1]
        var x = Math.random() * 2 - 1;
        var y = Math.random() * 2 - 1;

        for (var j = 0; j < triangleVertices.length; j++) {
            var vertex = add(triangleVertices[j], vec2(x, y));
            triangles.push(vertex);
        }
    }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    colorLoc = gl.getUniformLocation(program, "fColor");

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < NumTriangles; i++) {
        // Set a random color
        gl.uniform4fv(colorLoc, vec4(Math.random(), Math.random(), Math.random(), 1.0));

        // Draw one triangle
        gl.drawArrays(gl.TRIANGLES, i * 3, 3);
    }
}
