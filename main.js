// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(30, 50, 20);
scene.add(sun);

// ===== PROCEDURAL TEXTURE (NO EXTERNAL FILES) =====
function createGrassTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#3aa655";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#2e8b57" : "#4caf50";
    ctx.fillRect(
      Math.random() * size,
      Math.random() * size,
      2,
      2
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const grassTexture = createGrassTexture();

// ===== BLOCK SYSTEM =====
const blockGeo = new THREE.BoxGeometry(1, 1, 1);
const blockMat = new THREE.MeshStandardMaterial({ map: grassTexture });
const blocks = new Map();
const key = (x, y, z) => `${x},${y},${z}`;

function addBlock(x, y, z) {
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.position.set(x, y, z);
  scene.add(block);
  blocks.set(key(x, y, z), block);
}

// ===== CHUNK SYSTEM =====
function generateChunk(cx, cz) {
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      addBlock(cx * 16 + x, 0, cz * 16 + z);
    }
  }
}

generateChunk(0, 0);

// ===== PLAYER =====
let yaw = 0, pitch = 0;
let velocityY = 0;
let onGround = false;

camera.position.set(8, 3, 8);

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

document.body.onclick = () => document.body.requestPointerLock();

addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = keys.ShiftLeft ? 0.15 : 0.08;

  const move = new THREE.Vector3(
    (keys.KeyA ? -1 : 0) + (keys.KeyD ? 1 : 0),
    0,
    (keys.KeyW ? -1 : 0) + (keys.KeyS ? 1 : 0)
  ).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

  camera.position.add(move.multiplyScalar(speed));

  // Gravity & Jump
  velocityY -= 0.015;
  if (keys.Space && onGround) {
    velocityY = 0.3;
    onGround = false;
  }

  camera.position.y += velocityY;

  if (camera.position.y <= 1.7) {
    camera.position.y = 1.7;
    velocityY = 0;
    onGround = true;
  }

  renderer.render(scene, camera);
}

animate();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
