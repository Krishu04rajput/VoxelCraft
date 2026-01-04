<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>VoxelCraft</title>
<style>
body { margin:0; overflow:hidden; background:#000; font-family:Arial }
#crosshair {
  position:fixed;
  left:50%; top:50%;
  transform:translate(-50%,-50%);
  color:white; font-size:18px;
}
#hotbar {
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  display:flex;
  gap:6px;
}
.slot {
  width:48px; height:48px;
  border:2px solid #999;
  background:#222;
  color:#0f0;
  font-size:12px;
  display:flex;
  justify-content:flex-end;
  align-items:flex-end;
  padding:3px;
}
.active { border-color:yellow }
</style>
</head>
<body>

<div id="crosshair">+</div>
<div id="hotbar"></div>

<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
<script>
// ================= SCENE =================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100,200,100);
scene.add(sun);

// ================= INPUT =================
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);
document.body.onclick = () => document.body.requestPointerLock();

// ================= MOUSE =================
let yaw = 0, pitch = 0;
addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.4, Math.min(1.4, pitch));
});

// ================= TEXTURES =================
function tex(c1,c2){
  const c=document.createElement("canvas");
  c.width=c.height=32;
  const x=c.getContext("2d");
  x.fillStyle=c1; x.fillRect(0,0,32,32);
  for(let i=0;i<200;i++){
    x.fillStyle=c2;
    x.fillRect(Math.random()*32,Math.random()*32,2,2);
  }
  const t=new THREE.CanvasTexture(c);
  t.magFilter=t.minFilter=THREE.NearestFilter;
  return t;
}

const mats=[
  new THREE.MeshStandardMaterial({map:tex("#3cb371","#2e8b57")}), // grass
  new THREE.MeshStandardMaterial({map:tex("#8b4513","#5c3317")}), // dirt
  new THREE.MeshStandardMaterial({map:tex("#888","#666")})        // stone
];

// ================= BLOCKS =================
const geo=new THREE.BoxGeometry(1,1,1);
const blocks=new Map();
const key=(x,y,z)=>`${x},${y},${z}`;

function addBlock(x,y,z,t){
  const b=new THREE.Mesh(geo,mats[t]);
  b.position.set(x,y,z);
  scene.add(b);
  blocks.set(key(x,y,z),b);
}

// ================= WORLD =================
function height(x,z){
  return Math.floor(
    Math.sin(x*0.08)*4 +
    Math.cos(z*0.08)*4 + 8
  );
}

for(let x=-40;x<40;x++)
for(let z=-40;z<40;z++){
  const h=height(x,z);
  for(let y=0;y<=h;y++){
    addBlock(x,y,z,y===h?0:y>h-2?1:2);
  }
}

// ================= PLAYER =================
const player={
  pos:new THREE.Vector3(0,20,0),
  vel:new THREE.Vector3(),
  size:new THREE.Vector3(0.6,1.8,0.6),
  eye:1.6,
  onGround:false
};

function collide(p){
  for(let x=Math.floor(p.x-player.size.x/2);x<=Math.floor(p.x+player.size.x/2);x++)
  for(let y=Math.floor(p.y);y<=Math.floor(p.y+player.size.y);y++)
  for(let z=Math.floor(p.z-player.size.z/2);z<=Math.floor(p.z+player.size.z/2);z++)
    if(blocks.has(key(x,y,z))) return true;
  return false;
}

// ================= HOTBAR =================
const hotbar=document.getElementById("hotbar");
let selected=0;
function drawHotbar(){
  hotbar.innerHTML="";
  for(let i=0;i<9;i++){
    const d=document.createElement("div");
    d.className="slot"+(i===selected?" active":"");
    hotbar.appendChild(d);
  }
}
drawHotbar();

addEventListener("keydown",e=>{
  if(e.code.startsWith("Digit")){
    selected=Number(e.code.slice(5))-1;
    drawHotbar();
  }
});

// ================= LOOP =================
function loop(){
  requestAnimationFrame(loop);

  // camera rotation
  camera.rotation.order="YXZ";
  camera.rotation.y=yaw;
  camera.rotation.x=pitch;

  // ===== CORRECT MOVEMENT (NOT INVERTED) =====
  const forward=new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y=0;
  forward.normalize();

  const right=new THREE.Vector3();
  right.crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();

  const move=new THREE.Vector3();
  if(keys.KeyW) move.add(forward);
  if(keys.KeyS) move.sub(forward);
  if(keys.KeyA) move.sub(right);
  if(keys.KeyD) move.add(right);

  if(move.lengthSq()>0){
    move.normalize().multiplyScalar(0.1);
    player.pos.x+=move.x;
    if(collide(player.pos)) player.pos.x-=move.x;
    player.pos.z+=move.z;
    if(collide(player.pos)) player.pos.z-=move.z;
  }

  // gravity
  player.vel.y-=0.02;
  player.pos.y+=player.vel.y;
  if(collide(player.pos)){
    player.pos.y-=player.vel.y;
    player.vel.y=0;
    player.onGround=true;
  } else player.onGround=false;

  if(keys.Space && player.onGround) player.vel.y=0.35;

  camera.position.set(
    player.pos.x,
    player.pos.y+player.eye,
    player.pos.z
  );

  renderer.render(scene,camera);
}
loop();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
</script>
</body>
</html>
