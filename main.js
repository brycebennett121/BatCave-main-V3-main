import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000005);

document.getElementById("loading-screen").style.display = "block";


scene.fog = new THREE.Fog(0xaaaaaa, 0.2);

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 0.5, 6);


// Store original camera position for resetting
const originalCameraPosition = new THREE.Vector3(4, 0.5, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(0, 1, 1).normalize();
directionalLight.castShadow = true;
scene.add(directionalLight);

const secondDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
secondDirectionalLight.position.set(0, 1, -1).normalize();
secondDirectionalLight.castShadow = true;
scene.add(secondDirectionalLight);


const floodLight = new THREE.PointLight(0xffffff, 0.43, 1000);
floodLight.position.set(0, -0.3, 0);
floodLight.castShadow = true;
scene.add(floodLight);

const secondfloodLight = new THREE.PointLight(0x000ff, 0.5, 1000);
secondfloodLight.position.set(0, -0.3, 0);
secondfloodLight.castShadow = true;
scene.add(secondfloodLight);

const yellowFloodLight1 = new THREE.PointLight(0xffff00, 1, 10000);
yellowFloodLight1.position.set(-0.5, 0.2, 2.5);  // Set position as you like
yellowFloodLight1.castShadow = true;
scene.add(yellowFloodLight1);

const yellowFloodLight2 = new THREE.PointLight(0xffff00, 6, 10000);
yellowFloodLight2.position.set(0.5, 0.2, -15);  // Set position as you like
yellowFloodLight2.castShadow = true;
scene.add(yellowFloodLight2);




// Function to reset camera angle
const resetCameraAngle = () => {

    camera.lookAt(0, 0, 0);
    isAnimatingCamera = true, cameraTargetPosition = new THREE.Vector3(4, 1, 6);
};

// Listen for Escape key press
window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        resetCameraAngle();
        closeTerminal();

    }
});
const zoomCameraToOriginalPosition = () => {
    cameraTargetPosition.copy(originalCameraPosition);
    isAnimatingCamera = true;
};


let totalModelsToLoad = 2;  // We have 2 GLTF models: goodbat.glb and ocean.glb
let modelsLoaded = 0;



const hideLoadingScreen = () => {
    modelsLoaded++;
    if (modelsLoaded >= totalModelsToLoad) {
        setTimeout(() => {
            // Gradually fade out the overlay
            const fadeOverlay = document.getElementById("fade-overlay");
            fadeOverlay.style.opacity = 0;
            // Hide the overlay after the fade
            setTimeout(() => {
                fadeOverlay.style.display = "none";
                document.getElementById("loading-screen").style.display = "none";

            }, 1000); // Match the transition time in CSS
        }, 1000); // 1 second delay before fade starts
    }
};


let mixer;
const loader = new GLTFLoader();
loader.load('goodbat.glb', (gltf) => {
    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    const clips = gltf.animations;
    clips.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();

    });


    gltf.scene.traverse((child) => {
        if (child.isLight) {
            child.intensity *= 0;
            child.castShadow = true;
            scene.add(child);
        }
        if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }


    });


    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    camera.lookAt(center);
}, undefined, (error) => {
    console.error('An error occurred while loading the GLTF model:', error);
});

let oceanActions = [];
let mixer2;
const loader2 = new GLTFLoader();
loader2.load('ocean.glb', (gltf) => {
    gltf.scene.position.set(-80, -30, 80); // Set the x, y, z position here

    gltf.scene.scale.set(1, 1, 1); // Scale here

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            // Assuming the material is MeshStandardMaterial
            if (child.material.isMeshStandardMaterial) {
                child.material.color.setHex(0x000133);  // Set to blue color, replace with your desired color
                child.material.metalness = -1;  // Adjust the metalness
                child.material.roughness = 0;  // Adjust the roughness
            }
            // If the material is an array, change all of them
            else if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                    mat.color.setHex(0x0000ff);  // Set to blue color
                });
            }
        }
    });
    scene.add(gltf.scene);

    mixer2 = new THREE.AnimationMixer(gltf.scene);
    const clips = gltf.animations;

    clips.forEach((clip) => {
        const action = mixer2.clipAction(clip);
        action.play();


        oceanActions.push(action); // Store the action to change its speed later
    });

    // Change playback speed of all ocean animations
    const playbackSpeed = 40; // 2 times the normal speed
    oceanActions.forEach(action => {
        action.setEffectiveTimeScale(playbackSpeed);
        hideLoadingScreen();
    });
});



const terminal = document.getElementById('terminal');

const clock = new THREE.Clock();

// 3D sphere as a clickable button
//const sphereGeometry = new THREE.SphereGeometry(0.15, 8, 8);
//const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0, transparent: true });
//const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
//sphere.position.set(0, -0.8, 0);
//scene.add(sphere);

// Moon

const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshStandardMaterial({
        map: moonTexture, transparent: true, opacity: 0.5,
        normalMap: normalTexture, transparent: true, opacity: 0.5,
    })
);

scene.add(moon);

moon.position.x = -50;
moon.position.y = 20;
moon.position.z = -40;

// Create Moon
const moonlightGeometry = new THREE.SphereGeometry(4, 32, 32); // adjust radius to your needs
const moonlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xaaaaaa,
});
const moonlight = new THREE.Mesh(moonlightGeometry, moonlightMaterial);
moonlight.position.set(-50, 20, -40); // set position to wherever you want the moon
scene.add(moonlight);

// Create Light Emitted by Moon
const moonLight = new THREE.PointLight(0xffffff, 40, 100000);  // color, intensity, distance
moonLight.position.set(-50, 20, -40); // set light position at the same position as the moon
scene.add(moonLight);





var controls = new OrbitControls(camera, renderer.domElement);


// New variables for camera animation
let isAnimatingCamera = false;
let cameraTargetPosition = new THREE.Vector3(0, 0, 0);

const changeCameraAngle = () => {
    cameraTargetPosition.set(0, 0.20, 0.5);
    isAnimatingCamera = true;
};


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function closeTerminal() {
    const modal = document.getElementById("terminalModal");
    modal.style.visibility = "hidden";
}

document.getElementById("clickMe").onclick = onMouseClick;


function onButtonClick(event) {
    alert(event.target.id);
}
// ...

// Add this function to insert buttons into the terminal
function insertButtonsIntoTerminal(terminal) {
    const buttonsHTML = `
      <div id="button-container">
        <button id="about-button">About</button>
        <button id="projects-button">Projects</button>
        <button id="contact-button">Contact</button>
      </div>
    `;
    terminal.innerHTML += buttonsHTML;

    // Add event listeners to the buttons
    document.getElementById("about-button").addEventListener("click", function () {
        console.log("About button clicked");
        window.open(currentURL, '_blank'); // Opens a new window with the current URL
    });

    document.getElementById("projects-button").addEventListener("click", function () {
        console.log("Projects button clicked");
        window.open(currentURL, '_blank'); // Opens a new window with the current URL
    });

    document.getElementById("contact-button").addEventListener("click", function () {
        console.log("Contact button clicked");
        window.open(currentURL, '_blank'); // Opens a new window with the current URL
    });
}


let hasFinishedWriting = false;

function onMouseClick(event) {
    console.log("here")
    changeCameraAngle();
    openTerminal();
    const terminal = document.getElementById("terminal");
    terminal.textContent = ''; // Clear the terminal if you want to
    document.getElementById("terminalModal").style.display = "block"; // Show the terminal
    const firstMessage = "Enter Password: ********";
    const secondMessage = "Compiling source files...\n";
    const thirdMessage = "Linking...\n";
    const fourthMessage = "Program executed successfully!\n";
    const fifthMessage = `
W   W  EEEEE  L      CCCC  OOO  M   M EEEEE
W   W  E      L     C     O   O MM MM E    
W W W  EEE    L     C     O   O M M M EEE  
W W W  E      L     C     O   O M   M E    
W   W  EEEEE  LLLLL  CCCC  OOO  M   M EEEEE`;

    const typeSpeed = 40; // Speed of typing

    setTimeout(() => {
        writeToTerminal(terminal, firstMessage, 0);
        let hasFinishedWriting = false;
    }, 1000);

    setTimeout(() => {
        terminal.textContent = ''; // Clear the terminal if you want to
        writeToTerminal(terminal, secondMessage, 0);
        let hasFinishedWriting = false;
    }, 3000 + firstMessage.length * typeSpeed);

    setTimeout(() => {
        writeToTerminal(terminal, thirdMessage, 0);
        let hasFinishedWriting = false;
    }, 5000 + (firstMessage.length + secondMessage.length) * typeSpeed);

    setTimeout(() => {
        writeToTerminal(terminal, fourthMessage, 0);
        let hasFinishedWriting = false;
    }, 7000 + (firstMessage.length + secondMessage.length + thirdMessage.length) * typeSpeed);

    setTimeout(() => {
        writeToTerminalFaster(terminal, fifthMessage, 0);
        let hasFinishedWriting = false;
    }, 10000 + (firstMessage.length + secondMessage.length + thirdMessage.length + fourthMessage.length) * typeSpeed);

    setTimeout(() => {
        terminal.textContent = ''; // Clear the terminal
        let hasFinishedWriting = false;
        terminal.innerHTML = terminal.innerHTML = '<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; margin-top: -50px;"><span style="font-size: 80px; text-align: center;">BRYCE BENNETT</span><span style="font-size: 40px; text-align: center;">Graphic Designer</span></div>';

    }, 5000 + (firstMessage.length + secondMessage.length + thirdMessage.length + fourthMessage.length + fifthMessage.length) * typeSpeed);

    setTimeout(() => {
        insertButtonsIntoTerminal(terminal);
        let hasFinishedWriting = false;
    }, 5000 + (firstMessage.length + secondMessage.length + thirdMessage.length + fourthMessage.length + fifthMessage.length) * typeSpeed);
    let hasFinishedWriting = true;
}

function writeToTerminalFaster(terminal, message, index) {
    const typeSpeed = 6; // Faster speed for fifth message
    if (index < message.length) {
        terminal.textContent += message[index];
        setTimeout(() => writeToTerminalFaster(terminal, message, index + 1), typeSpeed);
    }
}


function openTerminal() {
    // Delay for 2 seconds (2000 milliseconds) before opening the terminal
    setTimeout(() => {
        const modal = document.getElementById("terminalModal");
        modal.style.visibility = "visible";

        const closeBtn = document.getElementsByClassName("close")[0];
        closeBtn.onclick = () => { modal.style.display = "none"; };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
    }, 600);  // Change 2000 to the number of milliseconds you'd like to delay
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    if (mixer2) mixer2.update(clock.getDelta());

    const positions = rain.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1;
        if (positions[i] < -10) {
            positions[i] = 10;
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;


    if (isAnimatingCamera) {
        camera.position.lerp(cameraTargetPosition, 0.05);
        if (camera.position.distanceTo(cameraTargetPosition) < 0.1) {
            isAnimatingCamera = false;
        }

    }




    controls.update();
    renderer.render(scene, camera);
}


// Create rain
const rainGeometry = new THREE.BufferGeometry();
const rainVertices = [];
const rainSpeeds = [];

for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = Math.random() * 40;
    const z = (Math.random() - 0.5) * 40;
    rainVertices.push(x, y, z);

    // Add random speed for this raindrop
    rainSpeeds.push(Math.random() * 0.01 + 0.01);
}

rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));

const rainMaterial = new THREE.PointsMaterial({
    color: 0x9099a1,
    size: 0.01,
    transparent: true,
    opacity: 0.4
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);



// Create stars
const starsGeometry = new THREE.BufferGeometry();
const starsVertices = [];

for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });
const stars = new THREE.Points(starsGeometry, starsMaterial);

scene.add(stars);

animate();
controls.update();


window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});

