// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 100;
const paddleSpeed = 6;

// Player 1 (left)
const player1 = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Player 2 (right)
const player2 = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 4,
    dy: 4,
    speed: 4
};

// Keyboard state
const keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Start/pause game with space
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update paddle positions
function updatePaddles() {
    // Player 1 controls (W/S)
    if (keys['w'] || keys['W']) {
        player1.dy = -paddleSpeed;
    } else if (keys['s'] || keys['S']) {
        player1.dy = paddleSpeed;
    } else {
        player1.dy = 0;
    }

    // Player 2 controls (Arrow keys)
    if (keys['ArrowUp']) {
        player2.dy = -paddleSpeed;
    } else if (keys['ArrowDown']) {
        player2.dy = paddleSpeed;
    } else {
        player2.dy = 0;
    }

    // Update positions
    player1.y += player1.dy;
    player2.y += player2.dy;

    // Keep paddles within canvas bounds
    player1.y = Math.max(0, Math.min(canvas.height - paddleHeight, player1.y));
    player2.y = Math.max(0, Math.min(canvas.height - paddleHeight, player2.y));
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.dy = -ball.dy;
    }

    // Ball collision with paddles
    // Player 1 paddle
    if (ball.x - ball.radius <= player1.x + player1.width &&
        ball.y >= player1.y &&
        ball.y <= player1.y + player1.height &&
        ball.dx < 0) {
        ball.dx = -ball.dx;
        // Add some variation based on where the ball hits the paddle
        const hitPos = (ball.y - player1.y) / player1.height;
        ball.dy = (hitPos - 0.5) * 8;
    }

    // Player 2 paddle
    if (ball.x + ball.radius >= player2.x &&
        ball.y >= player2.y &&
        ball.y <= player2.y + player2.height &&
        ball.dx > 0) {
        ball.dx = -ball.dx;
        // Add some variation based on where the ball hits the paddle
        const hitPos = (ball.y - player2.y) / player2.height;
        ball.dy = (hitPos - 0.5) * 8;
    }

    // Ball goes out of bounds (scoring)
    if (ball.x - ball.radius <= 0) {
        // Player 2 scores
        player2.score++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius >= canvas.width) {
        // Player 1 scores
        player1.score++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
    gameRunning = false;
}

// Update score display
function updateScore() {
    document.getElementById('player1Score').textContent = player1.score;
    document.getElementById('player2Score').textContent = player2.score;
}

// Draw paddle
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw game state message
function drawMessage() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Clear canvas
function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Main game loop
function gameLoop() {
    clearCanvas();
    drawCenterLine();
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall();
    drawMessage();

    if (gameRunning) {
        updatePaddles();
        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game
updateScore();
gameLoop();
