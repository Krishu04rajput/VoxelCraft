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

// ===== PROCEDURAL TEXTURES =====
function texture(color1, color2) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d");
  x.fillStyle = color1;
  x.fillRect(0,0,64,64);
  for(let i=0;i<300;i++){
    x.fillStyle = color2;
    x.fillRect(Math.random()*64,Math.random()*64,2,2);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  return t;
}

const BLOCKS = [
  { name:"grass", tex:texture("#3aa655","#2e8b57") },
  { name:"dirt",  tex:texture("#8b4513","#5c3317") },
  { name:"stone", tex:texture("#888888","#666666") },
  { name:"sand",  tex:texture("#e5d38c","#c2b280") }
];

// ===== BLOCK SYSTEM =====
const geo = new THREE.BoxGeometry(1,1,1);
const blocks = new Map();
const key=(x,y,z)=>`${x},${y},${z}`;

function addBlock(x,y,z,type){
  const mat = new THREE.MeshStandardMaterial({ map: BLOCKS[type].tex });
  const b = new THREE.Mesh(geo,mat);
  b.position.set(x,y,z);
  b.userData.type = type;
  scene.add(b);
  blocks.set(key(x,y,z), b);
}

function removeBlock(b){
  scene.remove(b);
  blocks.delete(key(b.position.x,b.position.y,b.position.z));
}

// ===== WORLD =====
for(let x=-16;x<16;x++)
  for(let z=-16;z<16;z++){
    addBlock(x,0,z,0);
    if(Math.random()<0.3) addBlock(x,-1,z,1);
  }

// ===== PLAYER =====
let yaw=0,pitch=0,vy=0,onGround=false;
camera.position.set(0,3,5);

// ===== INPUT =====
const keys={};
addEventListener("keydown",e=>keys[e.code]=true);
addEventListener("keyup",e=>keys[e.code]=false);

document.body.onclick=()=>document.body.requestPointerLock();
addEventListener("mousemove",e=>{
  if(document.pointerLockElement!==document.body) return;
  yaw-=e.movementX*0.002;
  pitch-=e.movementY*0.002;
  pitch=Math.max(-1.5,Math.min(1.5,pitch));
  camera.rotation.set(pitch,yaw,0);
});

// ===== HOTBAR =====
let selected=0;
const slots=document.querySelectorAll(".slot");
addEventListener("keydown",e=>{
  if(e.key>="1"&&e.key<="4"){
    selected=Number(e.key)-1;
    slots.forEach((s,i)=>s.classList.toggle("active",i===selected));
  }
});

// ===== RAYCAST =====
const ray=new THREE.Raycaster();
addEventListener("mousedown",e=>{
  ray.setFromCamera({x:0,y:0},camera);
  const hits=[...blocks.values()];
  const hit=ray.intersectObjects(hits)[0];
  if(!hit) return;

  if(e.button===0){
    removeBlock(hit.object);
  }
  if(e.button===2){
    const p=hit.object.position.clone().add(hit.face.normal);
    const x=Math
