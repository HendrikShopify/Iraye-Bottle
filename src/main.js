import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Get the existing canvas element from the DOM
const canvas = document.querySelector('canvas');

// Scene, Camera, and Renderer setup
const scene = new THREE.Scene();
scene.background = null; // Set the scene background to be transparent

let camera; // We will assign this later from the GLTF scene if it exists
const fallbackCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Fallback camera
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Make sure camera aspect is correct on load
fallbackCamera.aspect = window.innerWidth / window.innerHeight;
fallbackCamera.updateProjectionMatrix();

// Add some light
const dirLightOne = new THREE.DirectionalLight(0xffffff, 1);
dirLightOne.position.set(5, 10, 7.5);

const dirLightTwo = new THREE.DirectionalLight(0xffffff, 1);
dirLightTwo.position.set(-5, 10, 7.5);

scene.add(dirLightOne, dirLightTwo);

// OrbitControls (we'll update this later based on the camera)
let controls = new OrbitControls(fallbackCamera, renderer.domElement);

// GLTF Loader to load the 3D model
const loader = new GLTFLoader();
let mixer; // This will be used for animations

loader.load(
  './static/bottle.glb', // Path to your GLTF model file
  (gltf) => {
    scene.add(gltf.scene);
    console.log(gltf.scene);
    gltf.scene.position.set(0, 0, 0); // Adjust model position if needed

    // Check if the GLTF scene contains a camera
    if (gltf.cameras && gltf.cameras.length > 0) {
      camera = gltf.cameras[0]; // Use the camera from the GLTF scene
      console.log("Using camera from GLTF model.");

      // Ensure the GLTF camera aspect ratio matches the canvas
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    } else {
      camera = fallbackCamera; // Fallback to the manually created camera
      console.log("No camera found in GLTF, using fallback camera.");
    }

    controls = new OrbitControls(camera, renderer.domElement); // Reassign controls to use the correct camera

    // Create AnimationMixer and play animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene); // AnimationMixer is used to handle animations
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip); // Get animation clip action
        action.play(); // Play each animation
      });
      console.log("Animations found and playing.");
    } else {
      console.log("No animations found in GLTF model.");
    }

    animate();
  },
  (xhr) => {
    // Progress logging
  },
  (error) => {
    console.error('An error happened while loading the GLTF model:', error);
  }
);

// Position the fallback camera
fallbackCamera.position.z = 5;

// Handle resizing
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Update animations if the mixer is available
  if (mixer) {
    const delta = clock.getDelta(); // Get time difference for smooth animation
    mixer.update(delta); // Update the mixer to advance animations
  }

  renderer.render(scene, camera || fallbackCamera); // Render with the correct camera
}

const clock = new THREE.Clock(); // Used for controlling animation timing
