// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// ===== BLOCK TYPES =====
const BLOCKS = [
  { name: "grass", color: 0x22aa22 },
  { name: "dirt",  color: 0x8b4513 },
  { name: "stone", color: 0x888888 }
];

let selectedBlock = 0;

// ===== HOTBAR =====
const slots = document.querySelectorAll(".slot");

function updateHotbar() {
  slots.forEach((s, i) =>
    s.classList.toggle("active", i === selectedBlock)
  );
}

document.addEventListener("keydown", e => {
  if (e.key >= "1" && e.key <= "3") {
    selectedBlock = Number(e.key) - 1;
    updateHotbar();
  }
});

// ===== BLOCK SYSTEM =====
const geometry = new THREE.BoxGeometry(1,1,1);
const blocks = [];
const blockMap = new Map();

function key(x,y,z){ return `${x},${y},${z}`; }

function addBlock(x,y,z,type){
  const mat = new THREE.MeshStandardMaterial({
    color: BLOCKS[type].color
  });
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x,y,z);
  mesh.userData.type = type;
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
for(let x=-10;x<=10;x++){
  for(let z=-10;z<=10;z++){
    addBlock(x,0,z,0);
  }
}

// ===== CONTROLS =====
let keys = {};
let yaw = 0, pitch = 0;

document.addEventListener("keydown", e => keys[e.code]=true);
document.addEventListener("keyup", e => keys[e.code]=false);

document.body.addEventListener("click",()=>{
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement!==document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  camera.rotation.set(pitch,yaw,0);
});

// ===== RAYCAST =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0,0);

document.addEventListener("mousedown", e=>{
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(blocks);
  if(!hits.length) return;

  const hit = hits[0];

  // BREAK
  if(e.button===0){
    removeBlock(hit.object);
  }

  // PLACE
  if(e.button===2){
    const p = hit.object.position.clone()
      .add(hit.face.normal);
    const x=Math.round(p.x),
          y=Math.round(p.y),
          z=Math.round(p.z);
    if(!blockMap.has(key(x,y,z))){
      addBlock(x,y,z,selectedBlock);
    }
  }
});

document.addEventListener("contextmenu", e=>e.preventDefault());

// ===== LOOP =====
function animate(){
  requestAnimationFrame(animate);

  const speed = 0.1;
  const dir = new THREE.Vector3();

  if(keys.KeyW) dir.z -= speed;
  if(keys.KeyS) dir.z += speed;
  if(keys.KeyA) dir.x -= speed;
  if(keys.KeyD) dir.x += speed;

  dir.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
  camera.position.add(dir);

  renderer.render(scene,camera);
}
animate();

// ===== RESIZE =====
window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
