var canvas;
var gl;

var NumBody = 6;
var NumTail = 3;
var NumLeftFin = 3;
var NumRightFin = 3;
var NumEyes = 4;
var NumVertices = NumBody + NumTail + NumRightFin + NumLeftFin + NumEyes;


var fishes = [];

var SEPARATION_RADIUS = 5.0; 
var ALIGNMENT_RADIUS = 2.0; 
var COHESION_RADIUS = 1.0; 

var vertices = [
    vec4( -0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2,  0.2, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2, -0.15, 0.0, 1.0 ),
	vec4( -0.5,  0.0, 0.0, 1.0 ),

    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( -0.65,  0.15, 0.0, 1.0 ),
    vec4( -0.65, -0.15, 0.0, 1.0 ),

    vec4( -0.0,  0.0, 0.0, 1.0 ),
    vec4( -0.20,  0.10, 0.0, 1.0 ),
    vec4( -0.20, -0.10, 0.0, 1.0 ), 
    
    vec4( -0.0,  0.0, 0.0, 1.0 ),
    vec4( -0.20,  0.10, 0.0, 1.0 ),
    vec4( -0.20, -0.10, 0.0, 1.0 ), 

];

var eyeVertices = [];
var eyeBorderVertices = [];

var eyeRadius = 0.1; // Adjust the radius as needed

for (var theta = 0; theta < 360; theta += 10) {
    var thetaRadians = radians(theta);
    var x = -0.2 + eyeRadius * Math.cos(thetaRadians);
    var y = eyeRadius * Math.sin(thetaRadians);

    // White part of the eye
    eyeVertices.push(vec4(x, y, 0.1, 1.0));

    // Black part of the eye (inner border)
    eyeBorderVertices.push(vec4(x, y, 0.1, 1.0));
}

// Close the circular shape
eyeVertices.push(eyeVertices[0]);
eyeBorderVertices.push(eyeBorderVertices[0]);


var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotTail = 0.0;
var incTail = 2.0;
var rotLeftFin = 0.0;
var incLeftFin = 1.0;
var rotRightFin = 0.0;
var incRightFin = 1.0;
var zView = 5.0;

var proLoc;
var mvLoc;
var colorLoc;

var lastUpdateTime = Date.now();
var yzDuration = 5000;
var yGildi = (Math.random() - 0.01) * 0.02;
var zGildi = (Math.random() - 0.01) * 0.02;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices.concat(eyeBorderVertices).concat(eyeVertices)), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));

    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:
                zView += 0.2;
                break;
            case 40:
                zView -= 0.2;
                break;
         }
     }  );  

     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  

    for (var i = 0; i < 15; i++) {
        var fish = {
            bodyColor: vec4(Math.random(), Math.random(), Math.random(), 1.0),
            secondColor: vec4(Math.random(), Math.random(), Math.random(), 1.0),            
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5,
            z: Math.random() * 10 - 5,
            tailRotationLimit: 25.0 + Math.random() * 26.0,
            speed: 0.01 + Math.random() * 0.02,
            direction: normalize(vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)),
            tailSpeed: 20.0 + Math.random() * 40.0,
            incLeftFin: 1.0 + Math.random() * 2.0,
            incRightFin: 1.0 + Math.random() * 2.0
        };
        fishes.push(fish);
    }

    render();
}

function updateFishPositions() {
    var currentTime = Date.now();
    var elapsedMilliseconds = currentTime - lastUpdateTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.0;
  
    for (var i = 0; i < fishes.length; i++) {
      var fish = fishes[i];
      var separation = vec3(0.0, 0.0, 0.0);
      var alignment = vec3(0.0, 0.0, 0.0);
      var cohesion = vec3(0.0, 0.0, 0.0);
      var countSeparation = 0;
      var countAlignment = 0;
      var countCohesion = 0;
  
      for (var j = 0; j < fishes.length; j++) {
        if (i !== j) {
          var otherFish = fishes[j];
          var dx = otherFish.x - fish.x;
          var dy = otherFish.y - fish.y;
          var dz = otherFish.z - fish.z;
          var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
          if (distance < COHESION_RADIUS) {
            cohesion[0] += otherFish.x;
            cohesion[1] += otherFish.y;
            cohesion[2] += otherFish.z;
            countCohesion++;
          }
  
          if (distance < SEPARATION_RADIUS) {
            var toOtherFish = vec3(dx, dy, dz);
            separation[0] += toOtherFish[0];
            separation[1] += toOtherFish[1];
            separation[2] += toOtherFish[2];
            countSeparation++;
          }
  
          if (distance < ALIGNMENT_RADIUS) {
            alignment[0] += otherFish.direction[0];
            alignment[1] += otherFish.direction[1];
            alignment[2] += otherFish.direction[2];
            countAlignment++;
          }
        }
      }
  
      if (countSeparation > 0) {
        separation[0] /= countSeparation;
        separation[1] /= countSeparation;
        separation[2] /= countSeparation;
        var newPosition = vec3(
          fish.x - separation[0] * 0.01,
          fish.y - separation[1] * 0.01,
          fish.z - separation[2] * 0.01
        );
        fish.y = newPosition[1];
        fish.z = newPosition[2];
      }
  
      if (countAlignment > 0) {
        alignment[1] /= countAlignment;
        alignment[2] /= countAlignment;
      }
  
      if (countCohesion > 0) {
        cohesion[1] /= countCohesion;
        cohesion[2] /= countCohesion;
        var toCenter = vec3(
          cohesion[0] - fish.x,
          cohesion[1] - fish.y,
          cohesion[2] - fish.z
        );
        toCenter[1] *= 0.01;
        toCenter[2] *= 0.01;
        var newPosition = vec3(
          fish.y + toCenter[1] + 0.01,
          fish.z + toCenter[2] + 0.01
        );
        fish.y = newPosition[1];
        fish.z = newPosition[2];
      }
  
      fish.x += fish.speed * elapsedSeconds * (Math.random() - 0.5);
      fish.y += fish.speed * elapsedSeconds * (Math.random() - 0.5);
      fish.z += fish.speed * elapsedSeconds * (Math.random() - 0.5);
  
      if (fish.x > 5.0) {
        fish.x = -5.0;
      }
      if (fish.y > 5.0) {
        fish.y = -5.0;
      }
      if (fish.y < -5.0) {
        fish.y = 5.0;
      }
      if (fish.z > 5.0) {
        fish.z = -5.0;
      }
      if (fish.z < -5.0) {
        fish.z = 5.0;
      }
    }
  
    lastUpdateTime = currentTime;
  }

function updateYzTarget() {
    var currentTime = Date.now();
    var elapsedMilliseconds = currentTime - lastUpdateTime;

    if (elapsedMilliseconds >= yzUpdateInterval) {
        yGildi = (Math.random() - 0.5) * 0.1;
        zGildi = (Math.random() - 0.5) * 0.1;

        lastUpdateTime = currentTime;
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt(vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));

    updateFishPositions();

    for (var i = 0; i < fishes.length; i++) {
        var fish = fishes[i];

        fish.x += fish.speed;

        fish.y += yGildi;
        fish.z += zGildi;

        if (fish.x > 5.0) {
            fish.x = -5.0;
        }
        if (fish.y > 5.0) {
            fish.y = -5.0;
        }
        if (fish.y < -5.0) {
            fish.y = 5.0;
        }
        if (fish.z > 5.0) {
            fish.z = -5.0;
        }
        if (fish.z < -5.0) {
            fish.z = 5.0;
        }

        gl.uniform4fv(colorLoc, fish.bodyColor);

        

        var fishMv = mv;
        fishMv = mult(fishMv, translate(fish.x, fish.y, fish.z));

        var fishMvTail = mult(fishMv, translate(-0.5, 0.0, 0.0));
        fishMvTail = mult(fishMvTail, rotateY(rotTail + i * 0.0));
        fishMvTail = mult(fishMvTail, translate(0.5, 0.0, 0.0));

        var fishMvLeftFin = mult(fishMv, translate(0.0, -0.10, 0.0));
        fishMvLeftFin = mult(fishMvLeftFin, rotateY(rotLeftFin + i * 0.0));

        var fishMvRightFin = mult(fishMv, translate(0.0, -0.10, 0.0));
        fishMvRightFin = mult(fishMvRightFin, rotateY(rotRightFin + i * 0.0));

        gl.uniform4fv(colorLoc, fish.bodyColor);
        
        // Draw the body
        gl.uniformMatrix4fv(mvLoc, false, flatten(fishMv));
        gl.drawArrays(gl.TRIANGLES, 0, NumBody);

        gl.uniform4fv(colorLoc, fish.secondColor);

        // Draw the tail
        gl.uniformMatrix4fv(mvLoc, false, flatten(fishMvTail));
        gl.drawArrays(gl.TRIANGLES, NumBody, NumTail);

        // Draw fin 1
        gl.uniformMatrix4fv(mvLoc, false, flatten(fishMvLeftFin));
        gl.drawArrays(gl.TRIANGLES, 9, NumLeftFin);

        // Draw fin 2
        gl.uniformMatrix4fv(mvLoc, false, flatten(fishMvRightFin));
        gl.drawArrays(gl.TRIANGLES, 12, NumRightFin);
        

        
            var fishMvEyeBorder = mult(fishMv, translate(0.2, 0.0, 0.0)); // Original eye position
            fishMvEyeBorder = mult(fishMvEyeBorder, translate(0.2, 0.0, 0.0)); // Adjusted eye position
        
            gl.uniform4fv(colorLoc, vec4(1.0, 1.0, 1.0, 1.0)); // Set color for the eye whites
        
            // Draw the white part of the eye
            gl.uniformMatrix4fv(mvLoc, false, flatten(fishMvEyeBorder));
            gl.drawArrays(gl.TRIANGLE_FAN, NumBody + NumTail, eyeVertices.length);
        
            gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 0.0, 1.0)); // Set color for the eye border
        
            // Draw the black part of the eye (inner border)
            gl.uniformMatrix4fv(mvLoc, false, flatten(fishMvEyeBorder));
            gl.drawArrays(gl.LINE_LOOP, NumBody + NumTail + eyeVertices.length, eyeBorderVertices.length);


    }

    rotTail += incTail;
    if (rotTail > fish.tailSpeed || rotTail < -fish.tailSpeed)
        incTail *= -1;

    rotLeftFin += incLeftFin;
    if (rotLeftFin > 0.0 || rotLeftFin < -45.0)
        incLeftFin *= -1;

    rotRightFin += incRightFin;
    if (rotRightFin > 45.0 || rotRightFin < 0.0)
        incRightFin *= -1;

    gl.uniform4fv(colorLoc, vec4(0.2, 0.6, 0.9, 1.0));

    requestAnimFrame(render);
}


