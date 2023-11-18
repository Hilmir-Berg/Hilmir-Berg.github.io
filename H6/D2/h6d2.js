function mouseLook(key, mdelta) {
    // Sensitivity for mouse movement
    const sensitivity = 0.005;
    // Speed of camera movement (WASD)
    const speed = 0.1;
  
    // Initialize UAngle (view direction) if it doesn't exist
    if (typeof UAngle === 'undefined') {
      UAngle = 0;
    }
  
    // Update UAngle based on mdelta
    UAngle += mdelta * sensitivity;
  
    // Calculate changes in camera position
    let dx = 0;
    let dy = 0;
  
    if (key === 'w') {
      dy = -speed;
    } else if (key === 's') {
      dy = speed;
    } else if (key === 'a') {
      dx = -speed;
    } else if (key === 'd') {
      dx = speed;
    }
  
    // Update UAngle based on horizontal movement
    UAngle += dx;
  
    // Calculate the camera's view vector, right vector, and up vector
    const viewVector = [Math.cos(UAngle), 0, Math.sin(UAngle)];
    const rightVector = cross([0, 1, 0], viewVector);
    const upVector = cross(viewVector, rightVector);
  
    // Set the camera's position and target
    const eye = [currentPositionX, currentPositionY, currentPositionZ];
    const at = [eye[0] + viewVector[0], eye[1] + viewVector[1], eye[2] + viewVector[2]];
    const up = upVector;
  
    // Create a view matrix
    const result = lookAt(eye, at, up);
  
    return result;
  }
  