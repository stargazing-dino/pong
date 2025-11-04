// Get canvas
const canvas = document.getElementById('renderCanvas');

// Create Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);

// Game state
let gameRunning = false;
let player1Score = 0;
let player2Score = 0;

// Keyboard state
const keys = {};

// Game objects
let ball, player1Paddle, player2Paddle;
let ballVelocity = new BABYLON.Vector3(0.15, 0, 0.1);
const paddleSpeed = 0.2;

// Create scene
const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 3,
        30,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 50;

    // Lighting
    const light1 = new BABYLON.HemisphericLight(
        'light1',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light1.intensity = 0.7;

    const light2 = new BABYLON.PointLight(
        'light2',
        new BABYLON.Vector3(0, 10, 0),
        scene
    );
    light2.intensity = 0.5;

    // Materials
    const paddleMaterial = new BABYLON.StandardMaterial('paddleMat', scene);
    paddleMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 1);
    paddleMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.5);
    paddleMaterial.specularColor = new BABYLON.Color3(1, 1, 1);

    const ballMaterial = new BABYLON.StandardMaterial('ballMat', scene);
    ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0.2);
    ballMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.1);
    ballMaterial.specularColor = new BABYLON.Color3(1, 1, 1);

    const wallMaterial = new BABYLON.StandardMaterial('wallMat', scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    wallMaterial.alpha = 0.3;

    const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.3);

    // Create playing field ground
    const ground = BABYLON.MeshBuilder.CreateGround(
        'ground',
        { width: 20, height: 15 },
        scene
    );
    ground.material = groundMaterial;

    // Create walls (top and bottom)
    const topWall = BABYLON.MeshBuilder.CreateBox(
        'topWall',
        { width: 20, height: 1, depth: 0.5 },
        scene
    );
    topWall.position.z = 7.5;
    topWall.position.y = 0.5;
    topWall.material = wallMaterial;

    const bottomWall = BABYLON.MeshBuilder.CreateBox(
        'bottomWall',
        { width: 20, height: 1, depth: 0.5 },
        scene
    );
    bottomWall.position.z = -7.5;
    bottomWall.position.y = 0.5;
    bottomWall.material = wallMaterial;

    // Create Player 1 paddle (left)
    player1Paddle = BABYLON.MeshBuilder.CreateBox(
        'player1',
        { width: 0.5, height: 1, depth: 3 },
        scene
    );
    player1Paddle.position.x = -9;
    player1Paddle.position.y = 0.5;
    player1Paddle.material = paddleMaterial;

    // Create Player 2 paddle (right)
    player2Paddle = BABYLON.MeshBuilder.CreateBox(
        'player2',
        { width: 0.5, height: 1, depth: 3 },
        scene
    );
    player2Paddle.position.x = 9;
    player2Paddle.position.y = 0.5;
    player2Paddle.material = paddleMaterial;

    // Create ball
    ball = BABYLON.MeshBuilder.CreateSphere(
        'ball',
        { diameter: 0.8 },
        scene
    );
    ball.position.y = 0.5;
    ball.material = ballMaterial;

    // Add glow effect to ball
    const glowLayer = new BABYLON.GlowLayer('glow', scene);
    glowLayer.intensity = 0.5;

    // Center line markers
    for (let i = -6; i <= 6; i += 2) {
        const marker = BABYLON.MeshBuilder.CreateBox(
            'marker' + i,
            { width: 0.2, height: 0.1, depth: 1 },
            scene
        );
        marker.position.z = i;
        marker.position.y = 0.05;
        marker.material = wallMaterial;
    }

    return scene;
};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        updateMessage();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update paddles
const updatePaddles = () => {
    // Player 1 controls (W/S)
    if (keys['w'] || keys['W']) {
        player1Paddle.position.z = Math.max(-6, player1Paddle.position.z - paddleSpeed);
    }
    if (keys['s'] || keys['S']) {
        player1Paddle.position.z = Math.min(6, player1Paddle.position.z + paddleSpeed);
    }

    // Player 2 controls (Arrow keys)
    if (keys['ArrowUp']) {
        player2Paddle.position.z = Math.max(-6, player2Paddle.position.z - paddleSpeed);
    }
    if (keys['ArrowDown']) {
        player2Paddle.position.z = Math.min(6, player2Paddle.position.z + paddleSpeed);
    }
};

// Update ball
const updateBall = () => {
    ball.position.addInPlace(ballVelocity);

    // Collision with top and bottom walls
    if (ball.position.z <= -7 || ball.position.z >= 7) {
        ballVelocity.z = -ballVelocity.z;
        ball.position.z = Math.max(-7, Math.min(7, ball.position.z));
    }

    // Collision with paddles
    // Player 1 paddle
    if (ball.position.x <= player1Paddle.position.x + 0.5 &&
        ball.position.x >= player1Paddle.position.x - 0.5 &&
        Math.abs(ball.position.z - player1Paddle.position.z) <= 1.9 &&
        ballVelocity.x < 0) {
        ballVelocity.x = -ballVelocity.x;
        // Add variation based on hit position
        const hitPos = (ball.position.z - player1Paddle.position.z) / 1.5;
        ballVelocity.z = hitPos * 0.2;
        // Increase speed slightly
        ballVelocity.x *= 1.05;
    }

    // Player 2 paddle
    if (ball.position.x >= player2Paddle.position.x - 0.5 &&
        ball.position.x <= player2Paddle.position.x + 0.5 &&
        Math.abs(ball.position.z - player2Paddle.position.z) <= 1.9 &&
        ballVelocity.x > 0) {
        ballVelocity.x = -ballVelocity.x;
        // Add variation based on hit position
        const hitPos = (ball.position.z - player2Paddle.position.z) / 1.5;
        ballVelocity.z = hitPos * 0.2;
        // Increase speed slightly
        ballVelocity.x *= 1.05;
    }

    // Scoring
    if (ball.position.x < -10) {
        player2Score++;
        updateScore();
        resetBall();
    } else if (ball.position.x > 10) {
        player1Score++;
        updateScore();
        resetBall();
    }
};

// Reset ball
const resetBall = () => {
    ball.position.x = 0;
    ball.position.z = 0;
    ballVelocity.x = (Math.random() > 0.5 ? 1 : -1) * 0.15;
    ballVelocity.z = (Math.random() - 0.5) * 0.2;
    gameRunning = false;
    updateMessage();
};

// Update score display
const updateScore = () => {
    document.getElementById('player1Score').textContent = player1Score;
    document.getElementById('player2Score').textContent = player2Score;
};

// Update message
const updateMessage = () => {
    const messageEl = document.getElementById('message');
    if (!gameRunning) {
        messageEl.style.display = 'block';
    } else {
        messageEl.style.display = 'none';
    }
};

// Create scene
const scene = createScene();

// Game loop
engine.runRenderLoop(() => {
    if (gameRunning) {
        updatePaddles();
        updateBall();
    }
    scene.render();
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
});

// Initialize
updateScore();
updateMessage();
