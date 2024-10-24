import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import gsap from 'gsap';


// renderer.setPixelRatio(window.devicePixelRatio);

let isInnited = false;



// Initial check
runOnLargeScreens();

// Check on window resize
window.addEventListener('resize', runOnLargeScreens);

function runOnLargeScreens() {
  if (!isInnited && window.innerWidth > 479) {
    


let bottleGroup = null;
const pivot = new THREE.Group();
const loader = new GLTFLoader();

const scene = new THREE.Scene()
scene.add(pivot); // Add the pivot to the scene

// Load the bottle
loader.load(
  'https://cdn.shopify.com/3d/models/4a7f029ca57ad73c/solo-bottle.glb',
  (gltf) => {
    console.log(gltf.scene);

    bottleGroup = new THREE.Group();
    bottleGroup.name = 'bottle'; 
    
    const children = [...gltf.scene.children];

    for (const child of children) {
      child.scale.set(1, 1, 1);
      child.rotation.set(1.570796461153735, 0, Math.PI * .5);
      bottleGroup.add(child);

    }

    // Adjust the bottleGroup position to set its origin
    const box = new THREE.Box3().setFromObject(bottleGroup);
    const center = box.getCenter(new THREE.Vector3());

    bottleGroup.position.set(-center.x, -center.y, -center.z); // Offset the bottleGroup so it rotates around its center

    let newScale = 0.9

    bottleGroup.scale.set(newScale, newScale, newScale); // Scale the bottleGroup down

    // Add the bottleGroup to the pivot, instead of directly to the scene
    pivot.add(bottleGroup);
    pivot.position.set(0, 1, 0); // Set the pivot position to the center of the scene

    createBottleBalerina()

    // Start the animation or rendering loop
    tick();
  },
  (xhr) => {
    // Optional: track progress here
  },
  (error) => {
    console.error('An error happened while loading the GLTF model:', error);
  }
);



/////////////////////////////////////

const lineMetrics = {
    opacity: 0.75,
}

// LINES

// Function to create a line with its own dots
function createWavyLine(scene, lineIndex) {
    const material = new THREE.LineBasicMaterial({ color: 'white',
      transparent: true, 
      opacity: lineMetrics.opacity      
    });
  
    let points = [];
    const amplitude = 1.25;
    const frequency = 2;
    const segments = 100;
    const geometry = new THREE.BufferGeometry();
    const line = new THREE.Line(geometry, material);
  
    // Randomize line position
    const randomX = Math.random() < 0.5 ? Math.random() * 10 + 5 : -(Math.random() * 10 + 5);
    const randomY = (Math.random() - 0.5) * 6;
    const randomZ = (Math.random() - 0.5) * 5;
  
    line.position.set(randomX, randomY, randomZ);
    scene.add(line);
  
    // Create dots
    const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: lineMetrics.opacity });
    const dots = [];
  
    for (let i = 0; i < 7; i++) {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      scene.add(dot);
      dots.push(dot);
    }
  
    function updateWave(time) {
      points = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = -1 + t * 2;
        const z = -25 + t * 50;
        const y = Math.sin(t * frequency * Math.PI * 2 + time + lineIndex) * amplitude;
        points.push(new THREE.Vector3(x, y, z));
      }
      geometry.setFromPoints(points);
  
      // Update dots
      for (let i = 0; i < dots.length; i++) {
        const t = (i + 1) / (dots.length + 1);
        const x = -1 + t * 2;
        const z = -25 + t * 50;
        const y = Math.sin(t * frequency * Math.PI * 2 + time + lineIndex) * amplitude;
  
        dots[i].position.set(x + randomX, y + randomY, z + randomZ);
      }
    }
  
    return updateWave;
  }
  

// Create multiple lines and store their update functions
const numLines = 6;
const updateFunctions = [];

for (let i = 0; i < numLines; i++) {
  const updateWave = createWavyLine(scene, i);
  updateFunctions.push(updateWave);
}

// GSAP Animation
let waveTime = { value: 0 };

gsap.to(waveTime, {
  value: Math.PI * 2,  // Complete one full wave cycle
  duration: 15,        // Control the speed of the wave (10 seconds for a slow wave)
  repeat: -1,          // Repeat indefinitely
  ease: "none",        // Keep a constant speed
  onUpdate: () => {
    updateFunctions.forEach(update => update(waveTime.value));  // Update all lines and dots
  }
});

/**
 * Base
 */

// const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene

const hdriLoader = new THREE.CubeTextureLoader();
const texture = hdriLoader.load([
    'https://cdn.shopify.com/s/files/1/0595/3149/3581/files/px.webp?v=1728501435', 
    'https://cdn.shopify.com/s/files/1/0595/3149/3581/files/nx.webp?v=1728501435',
    'https://cdn.shopify.com/s/files/1/0595/3149/3581/files/py.webp?v=1728501435',
    'https://cdn.shopify.com/s/files/1/0595/3149/3581/files/ny.webp?v=1728501435',
    'https://cdn.shopify.com/s/files/1/0595/3149/3581/files/pz.webp?v=1728501435',
    'https://cdn.shopify.com/s/files/1/0595/3149/3581/files/nz.webp?v=1728501435',
]);

scene.environment = texture;
scene.environmentIntensity = 1.05;
// scene.background = null;
scene.background = new THREE.Color('#F1EFE8');
/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.05); // Soft ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Sunlight
directionalLight.position.set(-3, 1, 1);
scene.add(directionalLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.5); // Backlight
backLight.position.set(3, 2, -10);
scene.add(backLight);


/**
 *
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-35, 0, )
scene.add(camera)




// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

controls.enabled = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
})

renderer.setClearColor( 0x000000, 0 ); // the default
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// GSAP

window.addEventListener('mousemove', (event) => {
    // Get normalized mouse coordinates (-1 to 1)
    const xRotation = (event.clientX / window.innerWidth) * 2 - 1;
    const yRotation = (event.clientY / window.innerHeight) * 2 - 1;

    // Animate the rotation of the pivot point (which contains the bottleGroup)
    gsap.to(pivot.rotation, {
        x: xRotation * -0.05, // Rotate along the X-axis (up and down)
        y: xRotation * 0.5,   // Rotate along the Y-axis (left and right)
        z: yRotation * 0.05,  // Rotate along the Z-axis
        duration: 1.5,        // Smooth transition
        ease: 'power2.out',
    });
});

// Mousemove effect to move backLight
window.addEventListener('mousemove', (event) => {
    // Get normalized mouse coordinates (-1 to 1)
    const xMouse = (event.clientX / window.innerWidth) * 2 - 1;
    const yMouse = (event.clientY / window.innerHeight) * 2 - 1;

    // Animate the movement of the backLight based on mouse position
    gsap.to(backLight.position, {
        x: 0 + xMouse * 5,  // Move horizontally based on mouse position
        y: 0 + yMouse * 3,  // Move vertically based on mouse position
        z: -5 + yMouse * 2, // Move along the z-axis slightly
        duration: 1.2,       // Smooth transition
        ease: 'power2.out',
    });
});

gsap.registerPlugin(ScrollTrigger);


function createBottleBalerina() {

  const bottleSection = document.querySelector('.section_f-product');
  
  let spinAnimation = gsap.timeline({
    scrollTrigger: {
      trigger: bottleSection,
      start: 'top top',         
      scrub: false,             
      markers: false,           
      
    }
  });

  const spinValues = {
    ease: 'expo.out',
    rotationDuration: 2,
    positionDuration: 1.25,
    scaleDuration: 1.25,
    scaleValue: 0,
  };

  // Animation sequence
  spinAnimation.from(
    bottleGroup.scale,
    {
      x: spinValues.scaleValue,
      y: spinValues.scaleValue,
      z: spinValues.scaleValue,
      duration: spinValues.scaleDuration,
      ease: spinValues.ease
    }
  ).from(bottleGroup.position, 
    { 
      y: 0,
      duration: spinValues.positionDuration,
      ease: spinValues.ease
    }, "<"
  ).fromTo(bottleGroup.rotation, 
    { y: 0, x: -1, }, 
    { 
      y: Math.PI * 2, // Full spin on the y-axis
      x: 0, // Reset x-axis rotation
      duration: spinValues.rotationDuration, 
      ease: spinValues.ease 
    }, 
    0
  )
}

// Create the particle system
function createParticles(scene) {
  const particleCount = 2000; // Increase the number of particles
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3); // 3 values per particle (x, y, z)

  // Fill the position buffer with random values, within a smaller range to ensure they stay close
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50; // Random positions within a smaller cube of size 50
  }

  // Set the geometry's attributes
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Create a PointsMaterial for the particles, with a round texture
  const material = new THREE.PointsMaterial({
    color: 0xffffff,      // White color
    size: 0.3,            // Adjust size to make particles more visible
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true, // Make particles round and adjust size with perspective
    map: new THREE.TextureLoader().load('https://threejsfundamentals.org/threejs/resources/images/disc.png'),
    alphaTest: 0.5        // Prevent blending issues
  });

  // Create the particle system and add it to the scene
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

// Call the particle creation function
createParticles(scene);

    // Your code here
    isInnited = true;
  }
}