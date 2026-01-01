// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Ground blocks
const geometry = new THREE.BoxGeometry(1, 1, 1);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

for (let x = -10; x <= 10; x++) {
  for (let z = -10; z <= 10; z++) {
    const block = new THREE.Mesh(geometry, groundMaterial);
    block.position.set(x, -1, z);
    scene.add(block);
  }
}

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Mouse look
let yaw = 0;
let pitch = 0;

document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  }
});

// Movement
function updatePlayer() {
  camera.rotation.set(pitch, yaw, 0);

  const speed = 0.1;
  const direction = new THREE.Vector3();

  if (keys["KeyW"]) direction.z -= speed;
  if (keys["KeyS"]) direction.z += speed;
  if (keys["KeyA"]) direction.x -= speed;
  if (keys["KeyD"]) direction.x += speed;

  direction.applyEuler(camera.rotation);
  camera.position.add(direction);
}

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Game loop
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}
animate();
