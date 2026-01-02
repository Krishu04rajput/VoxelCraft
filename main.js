// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(20, 30, 10);
scene.add(sun);

// ===== BLOCK TYPES =====
const BLOCKS = [
  { color: 0x22aa22 },
  { color: 0x8b4513 },
  { color: 0x888888 }
];

let selectedBlock = 0;
const slots = document.querySelectorAll(".slot");
document.addEventListener("keydown", e => {
  if (e.key >= "1" && e.key <= "3") {
    selectedBlock = Number(e.key) - 1;
    slots.forEach((s,i)=>s.classList.toggle("active", i===selectedBlock));
  }
});

// ===== WORLD =====
const geometry = new THREE.BoxGeometry(1,1,1);
const blocks = [];
const blockMap = new Map();

function key(x,y,z){ return `${x},${y},${z}`; }

function addBlock(x,y,z,type){
  const mat = new THREE.MeshStandardMaterial({ color: BLOCKS[type].color });
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x,y,z);
  scene.add(mesh);
  blocks.push(mesh);
  blockMap.set(key(x,y,z), mesh);
}

function removeBlock(mesh){
  scene.remove(mesh);
  blocks.splice(blocks.indexOf(mesh),1);
  blockMap.delete(key(
    mesh.position.x,
    mesh.position.y,
    mesh.position.z
  ));
}

// Ground
for(let x=-15;x<=15;x++){
  for(let z=-15;z<=15;z++){
    addBlock(x,0,z,0);
  }
}

// ===== PLAYER =====
const player = {
  height: 1.7,
  radius: 0.3,
  velocity: new THREE.Vector3(),
  onGround: false
};

camera.position.set(0, 3, 5);

// ===== INPUT =====
let keys = {};
document.addEventListener("keydown", e=>keys[e.code]=true);
document.addEventListener("keyup", e=>keys[e.code]=false);

// ===== MOUSE (PEAK CONTROL) =====
let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

document.body.addEventListener("click",()=>{
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement!==document.body) return;

  yaw -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;

  pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

// ===== RAYCAST =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0,0);

document.addEventListener("mousedown", e=>{
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(blocks);
  if(!hits.length) return;

  const hit = hits[0];

  if(e.button===0){
    removeBlock(hit.object);
  }

  if(e.button===2){
    const p = hit.object.position.clone().add(hit.face.normal);
    const x=Math.round(p.x), y=Math.round(p.y), z=Math.round(p.z);
    if(!blockMap.has(key(x,y,z))){
      addBlock(x,y,z,selectedBlock);
    }
  }
});

document.addEventListener("contextmenu", e=>e.preventDefault());

// ===== COLLISION =====
function checkCollision(pos){
  const minX = Math.floor(pos.x - player.radius);
  const maxX = Math.floor(pos.x + player.radius);
  const minY = Math.floor(pos.y - player.height);
  const maxY = Math.floor(pos.y);
  const minZ = Math.floor(pos.z - player.radius);
  const maxZ = Math.floor(pos.z + player.radius);

  for(let x=minX;x<=maxX;x++){
    for(let y=minY;y<=maxY;y++){
      for(let z=minZ;z<=maxZ;z++){
        if(blockMap.has(key(x,y,z))){
          return true;
        }
      }
    }
  }
  return false;
}

// ===== LOOP =====
function animate(){
  requestAnimationFrame(animate);

  const speed = 0.08;
  const gravity = 0.015;

  let move = new THREE.Vector3();
  if(keys.KeyW) move.z -= speed;
  if(keys.KeyS) move.z += speed;
  if(keys.KeyA) move.x -= speed;
  if(keys.KeyD) move.x += speed;

  move.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);

  // Horizontal collision
  const nextPos = camera.position.clone().add(move);
  if(!checkCollision(new THREE.Vector3(nextPos.x, camera.position.y, nextPos.z))){
    camera.position.x = nextPos.x;
    camera.position.z = nextPos.z;
  }

  // Gravity
  player.velocity.y -= gravity;
  camera.position.y += player.velocity.y;

  if(checkCollision(camera.position)){
    camera.position.y = Math.ceil(camera.position.y);
    player.velocity.y = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  renderer.render(scene,camera);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
