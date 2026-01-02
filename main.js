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

// ===== TEXTURES =====
function makeTex(a,b){
  const c=document.createElement("canvas");
  c.width=c.height=64;
  const x=c.getContext("2d");
  x.fillStyle=a;
  x.fillRect(0,0,64,64);
  for(let i=0;i<300;i++){
    x.fillStyle=b;
    x.fillRect(Math.random()*64,Math.random()*64,2,2);
  }
  const t=new THREE.CanvasTexture(c);
  t.magFilter=t.minFilter=THREE.NearestFilter;
  return t;
}

const TEX=[
  makeTex("#3aa655","#2e8b57"), // grass
  makeTex("#8b4513","#5c3317"), // dirt
  makeTex("#888","#666"),       // stone
  makeTex("#e5d38c","#c2b280")  // sand
];

// ===== BLOCKS =====
const geo=new THREE.BoxGeometry(1,1,1);
const blocks=new Map();
const key=(x,y,z)=>`${x},${y},${z}`;

function addBlock(x,y,z,t){
  const m=new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({map:TEX[t]})
  );
  m.position.set(x,y,z);
  scene.add(m);
  blocks.set(key(x,y,z),m);
}

// Ground
for(let x=-20;x<=20;x++)
  for(let z=-20;z<=20;z++)
    addBlock(x,0,z,0);

// ===== PLAYER BODY =====
const player={
  x:0,
  y:1,
  z:5,
  vy:0,
  onGround:false,
  eye:1.6
};

// ===== CAMERA ROTATION =====
let yaw=0,pitch=0;
let targetYaw=0,targetPitch=0;
const sensitivity=0.002;
const smooth=0.15;

// ===== INPUT =====
const keys={};
addEventListener("keydown",e=>keys[e.code]=true);
addEventListener("keyup",e=>keys[e.code]=false);

// Mouse lock
document.body.onclick=()=>{
  if(document.pointerLockElement!==document.body)
    document.body.requestPointerLock();
};

addEventListener("mousemove",e=>{
  if(document.pointerLockElement!==document.body) return;
  targetYaw   -= e.movementX * sensitivity;
  targetPitch -= e.movementY * sensitivity;
  targetPitch = Math.max(-1.5,Math.min(1.5,targetPitch));
});

// ===== HOTBAR =====
let selected=0;
const slots=document.querySelectorAll(".slot");
addEventListener("keydown",e=>{
  if(e.key>="1"&&e.key<="4"){
    selected=e.key-1;
    slots.forEach((s,i)=>s.classList.toggle("active",i===selected));
  }
});

// ===== RAYCAST =====
const ray=new THREE.Raycaster();
addEventListener("mousedown",e=>{
  ray.setFromCamera({x:0,y:0},camera);
  const hit=ray.intersectObjects([...blocks.values()])[0];
  if(!hit) return;

  if(e.button===0){
    scene.remove(hit.object);
    blocks.delete(key(
      hit.object.position.x,
      hit.object.position.y,
      hit.object.position.z
    ));
  }

  if(e.button===2){
    const p=hit.object.position.clone().add(hit.face.normal);
    const x=Math.round(p.x),y=Math.round(p.y),z=Math.round(p.z);
    if(!blocks.has(key(x,y,z)))
      addBlock(x,y,z,selected);
  }
});
addEventListener("contextmenu",e=>e.preventDefault());

// ===== GAME LOOP =====
function animate(){
  requestAnimationFrame(animate);

  // Smooth camera
  yaw   += (targetYaw - yaw) * smooth;
  pitch += (targetPitch - pitch) * smooth;
  camera.rotation.set(pitch,yaw,0);

  // ===== CORRECT FPS MOVEMENT (FIXED) =====
  const speed = keys.ShiftLeft ? 0.15 : 0.08;

  const forward = new THREE.Vector3(
    Math.sin(yaw),
    0,
    Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.sin(yaw + Math.PI/2),
    0,
    Math.cos(yaw + Math.PI/2)
  );

  const move = new THREE.Vector3();

  if(keys.KeyW) move.add(forward);
  if(keys.KeyS) move.sub(forward);
  if(keys.KeyD) move.add(right);
  if(keys.KeyA) move.sub(right);

  if(move.lengthSq()>0){
    move.normalize().multiplyScalar(speed);
    player.x += move.x;
    player.z += move.z;
  }

  // Gravity & jump
  player.vy -= 0.015;
  if(keys.Space && player.onGround){
    player.vy = 0.3;
    player.onGround = false;
  }

  player.y += player.vy;

  if(player.y < 1){
    player.y = 1;
    player.vy = 0;
    player.onGround = true;
  }

  // Camera position (fixed Y eye level)
  camera.position.set(
    player.x,
    player.y + player.eye,
    player.z
  );

  renderer.render(scene,camera);
}

animate();

// Resize
addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
