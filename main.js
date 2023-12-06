// Variables to track the game state
let gameOver = true;
let gameOverMessage;
let restartButton;
let subTitleText;
let titleText;
let samImage;
let instructionText;
let collidingSprites = []; // Array to store colliding sprite objects
let score = 0;
let scoreDisplay;
let isMovingUp = false; // control character movement
let isMovingDown = false;
let spriteGenerationFrequency;
let characterSprite;
let characterTexture;
// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.touchAction = 'manipulation'; // prevents double tapping to zoom while playing
document.body.style.backgroundColor = 'black'; // prevents double tapping to zoom while playing
// document.body.style.overflow = "hidden";
const textureLoader = new THREE.TextureLoader();
const heartTexture = textureLoader.load('heart.png'); // image textures
const logoTexture = textureLoader.load('logo.png');
characterTexture = textureLoader.load('sam.png', () => { // Load the character texture
    loadCharacter();
});
setupBackground();

// Event listeners
window.addEventListener('keydown', handleCharacterMovement);
window.addEventListener('keyup', handleCharacterMovement);
window.addEventListener('touchstart', handleTouchStart);
window.addEventListener('touchend', handleTouchEnd);
window.addEventListener('resize', onWindowResize);


function loadCharacter() {
    const characterMaterial = new THREE.SpriteMaterial({ map: characterTexture });
    characterSprite = new THREE.Sprite(characterMaterial);
    // Calculate the aspect ratio of the loaded character image
    const aspectRatio = characterTexture.image.width / characterTexture.image.height;
    // Adjust the scale based on the aspect ratio to maintain proportions
    const desiredHeight = 4; // Set the desired height of the character sprite
    const desiredWidth = aspectRatio * desiredHeight;
    characterSprite.scale.set(desiredWidth, desiredHeight, 1);
    // Create the character sprite

    scene.add(characterSprite);
    // Set the position of the character sprite
    characterSprite.position.set(-(window.innerWidth / window.innerHeight) * 10, 0, -15);
}

function setupScoreDisplay() {
    scoreDisplay = document.createElement('div');
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.right = '10px';
    scoreDisplay.style.fontSize = '2rem';
    scoreDisplay.style.color = '#ffffff';
    scoreDisplay.innerHTML = `Score: ${score}`;
    document.body.appendChild(scoreDisplay);
}

// Function to create difficulty selection buttons
function createDifficultyButtons() {

    // Add an image alongside the difficulty buttons
    samImage = document.createElement('img');
    samImage.src = 'sam.png';
    samImage.style.position = 'absolute';
    samImage.style.top = '25%';
    samImage.style.left = '85%';
    samImage.style.transform = 'translateX(-50%)';
    samImage.style.width = '50rem'; // Adjust the width as needed
    document.body.appendChild(samImage);

    titleText = document.createElement('div');
    titleText.style.position = 'absolute';
    titleText.style.top = '20%';
    titleText.style.left = '50%';
    titleText.style.transform = 'translateX(-50%)';
    titleText.style.color = '#ffffff';
    titleText.style.fontSize = '6rem';
    titleText.style.fontFamily = 'Impact';
    titleText.style.font = "bold"
    titleText.style.textAlign = "center";
    titleText.style.fontWeight = 'bold';
    titleText.textContent = "Altman's Adventures";
    document.body.appendChild(titleText);

    subTitleText = document.createElement('div');
    subTitleText.style.position = 'absolute';
    subTitleText.style.top = '44%';
    subTitleText.style.left = '50%';
    subTitleText.style.textAlign = "center";
    subTitleText.style.padding = "2rem";
    subTitleText.style.transform = 'translateX(-50%)';
    subTitleText.style.color = '#ffffff';
    subTitleText.style.fontSize = '2rem';
    subTitleText.textContent = 'Gather love from your employees and avoid the Board!';
    document.body.appendChild(subTitleText);

    instructionText = document.createElement('div');
    instructionText.style.position = 'absolute';
    instructionText.style.top = '97%';
    instructionText.style.left = '50%';
    instructionText.style.transform = 'translateX(-50%)';
    instructionText.style.color = '#ffffff';
    instructionText.style.fontSize = '1rem';
    instructionText.style.textAlign = "center";
    instructionText.textContent = "Use UP and DOWN keys or press to MOVE.";
    document.body.appendChild(instructionText);

    // Function to handle difficulty selection
    function selectDifficulty(difficulty) {
        removeDifficultyButtons(); // Remove difficulty buttons once selected
        startGame(difficulty); // Start the game with the selected difficulty
    }

    // Create buttons for different difficulty levels
    const difficultyButtons = ['Easy', 'Medium', 'Satya Nadella'];
    for (const difficulty of difficultyButtons) {
        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.top = `${64 + (difficultyButtons.indexOf(difficulty) * 12)}%`;
        button.style.left = '50%';
        button.style.color = '#098ed6';
        button.style.textAlign = 'center'
        button.style.border = '2px solid #098ed6'; // Border style
        button.style.borderRadius = '10px'; // Rounded corners
        button.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)'; // Shadow
        button.style.padding = '10px 10px'; // Padding for button
        button.style.transform = 'translateX(-50%)';
        button.style.fontSize = '3rem';
        button.textContent = difficulty;
        button.onclick = () => selectDifficulty(difficulty);
        document.body.appendChild(button);
    }

}

// Function to remove difficulty selection buttons and display score
function removeDifficultyButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.remove());
    document.body.removeChild(titleText);
    document.body.removeChild(subTitleText);
    document.body.removeChild(samImage);
    document.body.removeChild(instructionText);
    setupScoreDisplay();
}

function setupBackground() {
    const canvasGradient = document.createElement('canvas');
    canvasGradient.width = window.innerWidth;
    canvasGradient.height = window.innerHeight;

    const canvasContext = canvasGradient.getContext('2d');
    let gradient = canvasContext.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, '#098ed6'); // Light blue
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const backgroundTexture = new THREE.CanvasTexture(canvasGradient);
    // Create a plane geometry with the same aspect ratio as the window
    const aspect = window.innerWidth / window.innerHeight;
    const backgroundGeometry = new THREE.PlaneGeometry(2 * aspect, 2, 1, 1);

    // Use the background texture in a material
    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    // Setting the z-position
    background.position.z = -19; // Adjust the value based on your scene setup
    // Scale the background to cover the viewport
    background.scale.set(window.innerWidth, window.innerHeight, 1);
    scene.add(background);
}

// Function to start the game based on selected difficulty
function startGame(difficulty) {
    removeGameOverElements();
    gameOver = false;
    score = 0;
    collidingSprites = []; // Clear collidingSprites array
    // Adjust the frequency of generated colliding sprites based on difficulty
    switch (difficulty) {
        case 'Easy':
            spriteGenerationFrequency = 0.01; // Adjust as needed
            break;
        case 'Medium':
            spriteGenerationFrequency = 0.05; // Adjust as needed
            break;
        case 'Satya Nadella':
            spriteGenerationFrequency = 0.1; // Adjust as needed
            break;
        default:
            spriteGenerationFrequency = 0.01; // Default to easy
            break;
    }
    gameLoop();
}

// Function to update the character placement in window
function onWindowResize() {
    characterSprite.position.set(-(window.innerWidth / window.innerHeight) * 10, 0, -15);
}

// Function to create colliding sprites based on selected frequency
function createSpriteBasedOnDifficulty() {
    if (!gameOver && Math.random() < spriteGenerationFrequency) {
        createMovingSprite();
    }
}

// Function to create a heart or logo sprite
function createMovingSprite() {
    let textureToUse;
    // Randomly choose between heartTexture and boardTexture
    if (Math.random() < 0.5) {
        textureToUse = heartTexture;
    } else {
        textureToUse = logoTexture;
    }

    const collidingMaterial = new THREE.SpriteMaterial({ map: textureToUse });
    const collidingSprite = new THREE.Sprite(collidingMaterial);

    // Set initial position randomly along the right side of the screen
    const posX = (window.innerWidth / window.innerHeight) * 12;
    const posY = Math.random() * 20 - 10; // Y range from -10 to 10
    const posZ = -15; // Adjust the Z position if needed

    collidingSprite.position.set(posX, posY, posZ);


    // Calculate the aspect ratio of the loaded character image
    const aspectRatio = textureToUse.image.width / textureToUse.image.height;

    // Adjust the scale based on the aspect ratio to maintain proportions
    const desiredHeight = 1.5; // Set the desired height of the texture sprite
    const desiredWidth = aspectRatio * desiredHeight;

    collidingSprite.scale.set(desiredWidth, desiredHeight, 1);


    // Add the heart to the scene
    scene.add(collidingSprite);

    // Add the heart to the collidingSprites array
    collidingSprites.push(collidingSprite);
}

// Function to move collidingSprites towards the character
function movecollidingSprites() {
    for (let i = 0; i < collidingSprites.length; i++) {
        const incoming_sprite = collidingSprites[i];

        // Move collidingSprites towards the character along the X-axis
        incoming_sprite.position.x -= 0.05; // Adjust the speed as needed

        // Check if the incoming_sprite is out of view
        if (incoming_sprite.position.x < -20) {
            // Remove the incoming_sprite from the scene
            scene.remove(incoming_sprite);
            collidingSprites.splice(i, 1); // Remove from the collidingSprites array
        }
    }
}

// Function to handle character movement
function handleCharacterMovement(event) {
    if (event.type === 'keydown') {
        if (event.key === 'ArrowUp') {
            isMovingUp = true;
        } else if (event.key === 'ArrowDown') {
            isMovingDown = true;
        }
    } else if (event.type === 'keyup') {
        if (event.key === 'ArrowUp') {
            isMovingUp = false;
        } else if (event.key === 'ArrowDown') {
            isMovingDown = false;
        }
    }
}

// Event listeners for touch events
window.addEventListener('touchstart', handleTouchStart);
window.addEventListener('touchend', handleTouchEnd);

// Function to handle touchstart event
function handleTouchStart(event) {
    event.preventDefault();
    const touchY = event.touches[0].clientY;
    const screenHeight = window.innerHeight;
    if (touchY < screenHeight / 2) {
        isMovingUp = true;
        isMovingDown = false;
    } else {
        isMovingDown = true;
        isMovingUp = false;
    }
}

// Function to handle touchend event
function handleTouchEnd() {
    isMovingUp = false;
    isMovingDown = false;
}

function getCharacterBoundingBox(characterOldBox) {
    // Get the character's bounding box

    // Get the dimensions of the bounding box
    const boxSize = new THREE.Vector3();
    characterOldBox.getSize(boxSize);
    // Reduce the size of the bounding box along the x-dimension
    const reducedSize = 0.2; // Adjust the reduction amount as needed
    const newXSize = boxSize.x * reducedSize;
    const newYSize = boxSize.y * reducedSize;
    // Calculate the center of the character's bounding box
    const boxCenter = new THREE.Vector3();
    characterOldBox.getCenter(boxCenter);
    // Calculate the new minimum and maximum points for the bounding box
    const newMin = new THREE.Vector3(boxCenter.x - newXSize / 2, boxCenter.y - newYSize / 2, boxCenter.z - boxSize.z / 2);
    const newMax = new THREE.Vector3(boxCenter.x + newXSize / 2, boxCenter.y + newYSize / 2, boxCenter.z + boxSize.z / 2);
    // Set the new size for the character's bounding box
    return new THREE.Box3(newMin, newMax);
}

// Function to remove game over elements
function removeGameOverElements() {
    if (document.body.contains(gameOverMessage)) {
        document.body.removeChild(gameOverMessage);
    }
    if (document.body.contains(restartButton)) {
        document.body.removeChild(restartButton);
    }
}

// Collision detection function between character and collidingSprites
function checkCollision() {
    const characterOldBox = new THREE.Box3().setFromObject(characterSprite);
    const newCharacterBox = getCharacterBoundingBox(characterOldBox);

    for (let i = 0; i < collidingSprites.length; i++) {
        const current_sprite = collidingSprites[i];
        const spriteBox = new THREE.Box3().setFromObject(current_sprite);
        // Define a buffer distance for collision detection (adjust as needed)
        const bufferDistance = 0.1; // This represents half the size of the bounding box

        // Expand the character bounding box by the buffer distance
        const expandedCharacterBox = characterOldBox.clone();
        expandedCharacterBox.expandByScalar(bufferDistance);

        if (newCharacterBox.intersectsBox(spriteBox)) {
            // Collision detected with a current_sprite
            const collidingTexture = current_sprite.material.map;
            if (collidingTexture === heartTexture) {
                score++;
                scene.remove(current_sprite);
                collidingSprites.splice(i, 1); // Remove from the collidingSprites array
            }
            else if (collidingTexture === logoTexture) {
                gameOver = true;

                // Display game over message and restart button
                gameOverMessage = document.createElement('div');
                gameOverMessage.style.position = 'absolute';
                gameOverMessage.style.top = '50%';
                gameOverMessage.style.left = '50%';
                gameOverMessage.style.transform = 'translate(-50%, -50%)';
                gameOverMessage.style.color = '#ffffff';
                gameOverMessage.style.fontSize = '2rem';
                gameOverMessage.style.textAlign = 'center'
                gameOverMessage.textContent = '❌ You were not consistently candid in your communications with the board!';
                // Display game over message and restart button
                restartButton = document.createElement('div');
                restartButton.style.position = 'absolute';
                restartButton.style.top = '65%';
                restartButton.style.left = '50%';
                restartButton.style.transform = 'translate(-50%, -50%)';
                restartButton.style.color = '#FF0000';
                restartButton.style.fontSize = '2rem';
                restartButton.style.textAlign = 'center'
                restartButton.style.border = '2px solid #FF0000'; // Border style
                restartButton.style.borderRadius = '10px'; // Rounded corners
                restartButton.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)'; // Shadow
                restartButton.style.padding = '10px 10px'; // Padding for button
                restartButton.style.cursor = 'pointer'; // Change cursor on hover
                restartButton.textContent = 'Bring back Sam and Greg! ❤️';

                document.body.appendChild(gameOverMessage);
                document.body.appendChild(restartButton);

                restartButton.onclick = function () {
                    removeGameOverElements();
                    gameOver = false;
                    score = 0;
                    // for each colliding delete it and set colliidng array to empty
                    for (let i = 0; i < collidingSprites.length; i++) {
                        scene.remove(collidingSprites[i]);
                    }
                    collidingSprites = [];
                }
            }
        }
    }
}

// main movement of characters and sprites
function animate() {
    requestAnimationFrame(animate);

    if (!gameOver) {
        // Character movement
        if (isMovingUp) {
            if (characterSprite.position.y < 10) {
                characterSprite.position.y += 0.2;
            }
        } if (isMovingDown) {
            if (characterSprite.position.y > -10) {
                characterSprite.position.y -= 0.2;
            }
        }
        // Create a new sprite occasionally
        createSpriteBasedOnDifficulty();

        movecollidingSprites();

        // Check collision between character and collidingSprites
        checkCollision();

        // Update score display
        scoreDisplay.innerHTML = `Score: ${score}`;

        renderer.render(scene, camera);
    }
}

function gameLoop() {
    animate();
}

// main execution
// Initialize the game by creating difficulty selection buttons
// this later calls the gameloop

createDifficultyButtons();
