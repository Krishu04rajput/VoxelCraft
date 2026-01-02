const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 100, 20);
scene.add(sun);

// BLOCKS
const geo = new THREE.BoxGeometry(1,1,1);
const blocks = [];

function block(x,y,z,color){
  const m = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color })
  );
  m.position.set(x,y,z);
  scene.add(m);
  blocks.push(m);
}

// Ground
for(let x=-20;x<=20;x++)
for(let z=-20;z<=20;z++)
  block(x,0,z,0x3aa655);

// PLAYER
const player = {
  pos: new THREE.Vector3(0,2,5),
  velY: 0,
  eye: 1.6,
  onGround: false
};

// INPUT
const keys = {};
addEventListener("keydown",e=>keys[e.code]=true);
addEventListener("keyup",e=>keys[e.code]=false);

// POINTER LOCK
document.body.onclick = () => {
  document.body.requestPointerLock();
};

let yaw = 0, pitch = 0;
const sensitivity = 0.002;

addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;

  yaw   -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;

  pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

// MAIN LOOP
function animate(){
  requestAnimationFrame(animate);

  // CAMERA ROTATION
  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // ===== TRUE FPS MOVEMENT (NO DRIFT EVER) =====
  const speed = keys.ShiftLeft ? 0.15 : 0.08;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

  const move = new THREE.Vector3();

  if (keys.KeyW) move.add(forward);
  if (keys.KeyS) move.sub(forward);
  if (keys.KeyD) move.add(right);
  if (keys.KeyA) move.sub(right);

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed);
    player.pos.add(move);
  }

  // GRAVITY
  player.velY -= 0.015;
  if (keys.Space && player.onGround) {
    player.velY = 0.3;
    player.onGround = false;
  }

  player.pos.y += player.velY;

  if (player.pos.y < 1) {
    player.pos.y = 1;
    player.velY = 0;
    player.onGround = true;
  }

  // CAMERA POSITION (FIXED Y BAR)
  camera.position.set(
    player.pos.x,
    player.pos.y + player.eye,
    player.pos.z
  );

  renderer.render(scene, camera);
}

animate();

addEventListener("resize",()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
