// Variable to track the game state
let gameOver = false;
let gameOverMessage;
let restartButton;

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();

// Background Gradient
const canvasGradient = document.createElement('canvas');
canvasGradient.width = window.innerWidth;
canvasGradient.height = window.innerHeight;

const canvasContext = canvasGradient.getContext('2d');
const gradient = canvasContext.createLinearGradient(0, 0, 0, window.innerHeight);
gradient.addColorStop(0, '#6699ff'); // Light blue
gradient.addColorStop(1, '#003366'); // Dark blue
canvasContext.fillStyle = gradient;
canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

const backgroundTexture = new THREE.CanvasTexture(canvasGradient);
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
const backgroundGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(background);

// Load the heart and logo textures
const heartTexture = textureLoader.load('heart.png');
const logoTexture = textureLoader.load('logo.png');

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
    const posX = 7;
    const posY = Math.random() * 20 - 10; // Y range from -10 to 10
    const posZ = -15; // Adjust the Z position if needed

    collidingSprite.position.set(posX, posY, posZ);

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

// Array to store colliding sprite objects
let collidingSprites = [];

// Set up variables
let score = 0;
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '10px';
scoreDisplay.style.right = '10px';
scoreDisplay.style.color = '#ffffff';
scoreDisplay.innerHTML = `Score: ${score}`;
document.body.appendChild(scoreDisplay);

let isMovingUp = false;
let isMovingDown = false;

// Function to handle character movement
function handleCharacterMovement(event) {
    if (event.type === 'mousedown' || event.type === 'touchstart') {
        isMovingUp = true;
    } else if (event.type === 'mouseup' || event.type === 'touchend') {
        isMovingUp = false;
    } else if (event.type === 'keydown') {
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

// Event listeners for character movement
window.addEventListener('keydown', handleCharacterMovement);
window.addEventListener('keyup', handleCharacterMovement);

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
                gameOverMessage.style.fontSize = '24px';
                gameOverMessage.style.textAlign = 'center'
                gameOverMessage.textContent = '❌ You were not consistently candid in your communications with the board!';
                // Display game over message and restart button
                restartButton = document.createElement('div');
                restartButton.style.position = 'absolute';
                restartButton.style.top = '65%';
                restartButton.style.left = '50%';
                restartButton.style.transform = 'translate(-50%, -50%)';
                restartButton.style.color = '#FF0000';
                restartButton.style.fontSize = '24px';
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
// Game loop
function animate() {

    requestAnimationFrame(animate);

    if (!gameOver) {
        // Character movement
        if (isMovingUp) {
            characterSprite.position.y += 0.2;
        } if (isMovingDown) {
            characterSprite.position.y -= 0.2;
        }


        // Handle character going out of screen
        if (characterSprite.position.y < -15 || characterSprite.position.y > 15) {
            // Implement game over logic here
            // For now, reset character position
            characterSprite.position.set(-6.5, 0, -10);
            score = 0;
        }

        // Create a new sprite occasionally
        if (Math.random() < 0.01) { // Adjust the probability as needed
            createMovingSprite();
        }

        movecollidingSprites();

        // Check collision between character and collidingSprites
        checkCollision();

        // Update score display
        scoreDisplay.innerHTML = `Score: ${score}`;

        renderer.render(scene, camera);
    }
}


// Function to update the background texture size on window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    canvasGradient.width = window.innerWidth;
    canvasGradient.height = window.innerHeight;
    gradient = canvasContext.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, '#6699ff');
    gradient.addColorStop(1, '#003366');
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight);

    backgroundTexture.needsUpdate = true;
}

// Character
// Load the image texture
const characterTexture = textureLoader.load('sam.png', () => {
    // Calculate the aspect ratio of the loaded character image
    const aspectRatio = characterTexture.image.width / characterTexture.image.height;

    // Adjust the scale based on the aspect ratio to maintain proportions
    const desiredHeight = 4; // Set the desired height of the character sprite
    const desiredWidth = aspectRatio * desiredHeight;

    characterSprite.scale.set(desiredWidth, desiredHeight, 1);
});

// Create the character sprite
const characterMaterial = new THREE.SpriteMaterial({ map: characterTexture });
const characterSprite = new THREE.Sprite(characterMaterial);
scene.add(characterSprite);

// Set the position of the character sprite
characterSprite.position.set(-6.5, 0, -15);

window.addEventListener('resize', onWindowResize);

// Start the game loop
animate();