const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 50;
const numRows = 7;
const numCols = 7;
const frog = {
    x: Math.floor(numCols / 2),
    y: numRows - 1,
    direction: 'up',
};

let lastDirection = 'up';
let cars = [];
let score = 0;
let frogReachedTop = false;
let gameWon = false;
let gameOver = false;

function drawGameBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (row === 0 || row === numRows - 1) {
                ctx.fillStyle = '#aaf0ff';
            } else {
                ctx.fillStyle = '#ccc';
            }

            ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
        }
    }

    ctx.fillStyle = '#ff0000';
    cars.forEach((car) => {
        ctx.fillRect(car.x * gridSize, car.y * gridSize + gridSize / 4, gridSize, gridSize / 2);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(car.x * gridSize, car.y * gridSize + gridSize / 4, gridSize, gridSize / 2);
    });

    ctx.fillStyle = '#009900';
    ctx.beginPath();
    if (frog.direction === 'up') {
        ctx.moveTo((frog.x + 0.5) * gridSize, frog.y * gridSize);
        ctx.lineTo((frog.x + 1) * gridSize, (frog.y + 1) * gridSize);
        ctx.lineTo(frog.x * gridSize, (frog.y + 1) * gridSize);
    } else if (frog.direction === 'down') {
        ctx.moveTo((frog.x + 0.5) * gridSize, (frog.y + 1) * gridSize);
        ctx.lineTo((frog.x + 1) * gridSize, frog.y * gridSize);
        ctx.lineTo(frog.x * gridSize, frog.y * gridSize);
    }
    ctx.closePath();
    ctx.fill();

    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;

    if (score === 10 && !gameWon) {
        gameWon = true;
        const gameWonMessageElement = document.getElementById('gameWonMessage');
        gameWonMessageElement.textContent = 'You Won!';

        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'Play Again';
        playAgainButton.onclick = resetGame;
        document.body.appendChild(playAgainButton);
    }
}

function checkCollisions() {
    cars.forEach((car) => {
        if (frog.x === Math.floor(car.x) && frog.y === car.y) {
            frog.x = Math.floor(numCols / 2);
            frog.y = numRows - 1;
            frog.direction = 'up';

            if (!gameOver) {
                score = 0;
            }
        }
    });

    if (frog.y === 0 && !frogReachedTop) {
        frogReachedTop = true;
        score++;
    }

    if (frog.y === numRows - 1 && frogReachedTop) {
        frogReachedTop = false;
        score++; 
    }

    if (score === 10 && !gameWon) {
        gameWon = true;
        drawGameBoard();
    }

    if (score === 10 && !gameOver) {
        gameOver = true;
        drawGameBoard();
    }
}

function checkForCollisions() {
    for (const car of cars) {
        if (frog.x === Math.floor(car.x) && frog.y === car.y) {
            return true;
        }
    }
    return false;
}



function moveFrog(event) {
    if (gameOver) {
        return;
    }

    let shouldIncrementScore = false;

    switch (event.key) {
        case 'ArrowUp':
            if (frog.y > 0) {
                frog.y--;
                drawGameBoard();
            }
            break;
        case 'ArrowDown':
            if (frog.y < numRows - 1) {
                frog.y++;
                drawGameBoard();
            }
            break;
        case 'ArrowLeft':
            if (frog.x > 0) {
                frog.x--;
                drawGameBoard();
            }
            break;
        case 'ArrowRight':
            if (frog.x < numCols - 1) {
                frog.x++;
                drawGameBoard();
            }
            break;
    }

    if (frog.y === 0 && !frogReachedTop) {
        if (!checkForCollisions()) {
            shouldIncrementScore = true;
        }
        frogReachedTop = true;
        frog.direction = 'down';
    }

    if (frog.y === numRows - 1 && frogReachedTop) {
        if (!checkForCollisions()) {
            shouldIncrementScore = true;
        }
        frogReachedTop = false;
        frog.direction = 'up';
    }

    if (shouldIncrementScore) {
        score++;
        drawGameBoard();
    } else if (checkForCollisions()) {
        frog.x = Math.floor(numCols / 2);
        frog.y = numRows - 1;
        frog.direction = 'up';
        score = 0;
        drawGameBoard();
    }
}



function moveCars() {
    cars = cars.filter((car) => {
        car.x += car.speed;

        return !(car.speed > 0 && car.x >= numCols) && !(car.speed < 0 && car.x < -1);
    });
}

function resetGame() {
    score = 0;
    gameWon = false;
    gameOver = false; 
    frog.x = Math.floor(numCols / 2);
    frog.y = numRows - 1;
    frog.direction = 'up';
    cars = [];

    const playAgainButton = document.querySelector('button');
    if (playAgainButton) {
        playAgainButton.remove();
    }

    drawGameBoard();
}


function updateGame() {
    moveCars();
    checkCollisions();
    drawGameBoard();
    requestAnimationFrame(updateGame);
}

function createCar() {
    if (gameOver) {
        return; 
    }
    const randomY = Math.floor(Math.random() * 5) + 1; 
    const randomSpeed = Math.random() > 0.5 ? 0.15 : -0.1; 
    const startingPosition = randomY % 2 === 0 ? -1 : numCols; 
    cars.push({ x: startingPosition, y: randomY, speed: randomSpeed });
}

setInterval(createCar, 500); 

document.addEventListener('keydown', moveFrog);
drawGameBoard();
updateGame();
