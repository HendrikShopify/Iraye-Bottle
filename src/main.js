import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('canvas');

const scene = new THREE.Scene();
scene.background = null;

let camera;
const fallbackCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

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
scene.background = new THREE.Color('#F1EFE8');

fallbackCamera.aspect = window.innerWidth / window.innerHeight;
fallbackCamera.updateProjectionMatrix();

let controls = new OrbitControls(fallbackCamera, renderer.domElement);

const loader = new GLTFLoader();
let mixer;

loader.load(
  'https://cdn.shopify.com/3d/models/d7e652c863cf96be/scene.glb',
  (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);

    if (gltf.cameras && gltf.cameras.length > 0) {
      camera = gltf.cameras[0];
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    } else {
      camera = fallbackCamera;
    }

    controls = new OrbitControls(camera, renderer.domElement);

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }

    animate();
  },
  (xhr) => {},
  (error) => {
    console.error('An error happened while loading the GLTF model:', error);
  }
);

fallbackCamera.position.z = 5;

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  }

  renderer.render(scene, camera || fallbackCamera);
}
