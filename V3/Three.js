// Set up scene
const scene = new THREE.Scene();

// Set up camera
const cameraElfView = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraTopView = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up grid
const gridSize = { rows: 16, cols: 15 };
const cellSize = 10;
const grid = new THREE.Group();

for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
        const mushroom = new THREE.Mesh(
            new THREE.BoxGeometry(cellSize, cellSize, cellSize),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // You can replace this with your mushroom texture
        );
        mushroom.position.set(col * cellSize, row * cellSize, 0);
        grid.add(mushroom);
    }
}

scene.add(grid);

// Set up garden elf
const elf = new THREE.Mesh(
    new THREE.BoxGeometry(cellSize, cellSize, cellSize),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }) // You can replace this with your elf texture
);
elf.position.set((gridSize.cols / 2) * cellSize, 0, 0); // Place the elf at the bottom center
scene.add(elf);

// Set up centipede
// (You'll need to implement the centipede logic and create a 3D model for it)

// Set up darts
// (You'll need to implement the dart logic and create a 3D model for it)

// Set up camera positions
cameraElfView.position.set(elf.position.x, elf.position.y, 30);
cameraTopView.position.set(gridSize.cols * cellSize / 2, gridSize.rows * cellSize / 2, 100);
cameraTopView.lookAt(grid.position);

// Add controls for the elf (assuming you've included the necessary libraries)
const controls = new THREE.PointerLockControls(cameraElfView, document.body);
scene.add(controls.getObject());

// Add event listener to switch between cameras
window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        cameraElfView.layers.enable(1); // Elf's perspective
        cameraTopView.layers.enable(2); // Top-down perspective
    }
});

// Your animation/rendering loop
function animate() {
    requestAnimationFrame(animate);

    // Update game logic here

    // Render the scene based on the active camera
    renderer.render(scene, cameraElfView);
}

animate();
