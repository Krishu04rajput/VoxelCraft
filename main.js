// ==================
// BASIC SETUP
// ==================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera (player)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==================
// LIGHTING
// ==================
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

// ==================
// BLOCK GEOMETRY
// ==================
const blockGeo = new THREE.BoxGeometry(1, 1, 1);
const grassMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });

// Ground
for (let x = -10; x <= 10; x++) {
  for (let z = -10; z <= 10; z++) {
    const block = new THREE.Mesh(blockGeo, grassMat);
    block.position.set(x, -1, z);
    scene.add(block);
  }
}

// Test block
const testBlock = new THREE.Mesh(
  blockGeo,
  new THREE.MeshStandardMaterial({ color: 0x006400 })
);
testBlock.position.set(0, 0, 0);
scene.add(testBlock);

// ==================
// CONTROLS (KEYBOARD)
// ==================
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ==================
// MOUSE LOOK (FPS)
// ==================
let yaw = 0;
let pitch = 0;

document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.0015;
    pitch -= e.movementY * 0.0015;

    // Limit up/down look
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  }
});

// ==================
// PLAYER MOVEMENT
// ==================
const speed = 0.06;

function updatePlayer() {
  camera.rotation.set(pitch, yaw, 0);

  const dir = new THREE.Vector3();

  if (keys["KeyW"]) dir.z -= 1;
  if (keys["KeyS"]) dir.z += 1;
  if (keys["KeyA"]) dir.x -= 1;
  if (keys["KeyD"]) dir.x += 1;

  if (dir.length() > 0) {
    dir.normalize();
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    camera.position.x += dir.x * speed;
    camera.position.z += dir.z * speed;
  }

  // Lock player height (no flying yet)
  camera.position.y = 2;
}

// ==================
// RESIZE SUPPORT
// ==================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================
// GAME LOOP
// ==================
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}

animate();
