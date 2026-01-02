// ===== BASIC SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff,0.4));
const sun = new THREE.DirectionalLight(0xffffff,0.8);
sun.position.set(30,50,20);
scene.add(sun);

// ===== TEXTURES (ATLAS STYLE) =====
const loader = new THREE.TextureLoader();
const grass = loader.load("https://i.imgur.com/8Ih4F8T.png");
grass.magFilter = THREE.NearestFilter;

// ===== BLOCK SYSTEM =====
const geo = new THREE.BoxGeometry(1,1,1);
const mat = new THREE.MeshStandardMaterial({map:grass});
const blocks = new Map();
const key=(x,y,z)=>`${x},${y},${z}`;

function addBlock(x,y,z){
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  scene.add(m);
  blocks.set(key(x,y,z),m);
}

// ===== CHUNK SYSTEM (SIMPLE) =====
function generateChunk(cx,cz){
  for(let x=0;x<16;x++)
    for(let z=0;z<16;z++)
      addBlock(cx*16+x,0,cz*16+z);
}
generateChunk(0,0);

// ===== PLAYER =====
let yaw=0,pitch=0;
const vel={y:0};
let onGround=false;
camera.position.set(8,3,8);

// ===== INPUT =====
const keys={};
addEventListener("keydown",e=>keys[e.code]=true);
addEventListener("keyup",e=>keys[e.code]=false);

// Mouse
document.body.onclick=()=>document.body.requestPointerLock();
addEventListener("mousemove",e=>{
  if(document.pointerLockElement!==document.body) return;
  yaw-=e.movementX*0.002;
  pitch-=e.movementY*0.002;
  pitch=Math.max(-1.5,Math.min(1.5,pitch));
  camera.rotation.set(pitch,yaw,0);
});

// ===== INVENTORY =====
let slot=0;
document.querySelectorAll(".slot").forEach((s,i)=>{
  addEventListener("keydown",e=>{
    if(e.key===(i+1)+""){
      slot=i;
      document.querySelectorAll(".slot").forEach(x=>x.classList.remove("active"));
      s.classList.add("active");
    }
  });
});

// ===== GAME LOOP =====
function animate(){
  requestAnimationFrame(animate);

  let speed=keys.ShiftLeft?0.15:0.08;
  const dir=new THREE.Vector3(
    (keys.KeyA?-1:0)+(keys.KeyD?1:0),
    0,
    (keys.KeyW?-1:0)+(keys.KeyS?1:0)
  ).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);

  camera.position.add(dir.multiplyScalar(speed));

  // Jump + gravity
  vel.y-=0.015;
  if(keys.Space && onGround){ vel.y=0.3; onGround=false; }
  camera.position.y+=vel.y;

  if(camera.position.y<=1.7){
    camera.position.y=1.7;
    vel.y=0;
    onGround=true;
  }

  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
