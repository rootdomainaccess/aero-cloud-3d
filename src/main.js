import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 1. Fetch & render portfolio buttons
fetch("/src/assets/portfolio.json")
  .then((r) => r.json())
  .then((list) => {
    const container = document.getElementById("cards");
    if (!container) return;
    list.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "card";
      btn.textContent = item.title;
      btn.onclick = () => window.open(item.url, "_blank");
      container.appendChild(btn);
    });
  })
  .catch((err) => console.error("Error loading portfolio:", err));

// 2. Setup Three.js Scene
const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x030712, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, 0.05);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// Responsive camera distance setup
function getResponsiveCameraZ() {
  const isMobile = window.innerWidth < 768;
  return isMobile ? 8.2 : 6.0;
}
camera.position.set(0, 0.8, getResponsiveCameraZ());
scene.add(camera);

// Ambient & dynamic key lights
const ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
dirLight.position.set(6, 10, 8);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x818cf8, 1.5);
rimLight.position.set(-6, -4, -4);
scene.add(rimLight);

const pointLight = new THREE.PointLight(0x00f3ff, 0.5, 12);
pointLight.position.set(0, 0, 1.5);
scene.add(pointLight);

// 3. Cyberpunk PC Rig Assembly
const pcGroup = new THREE.Group();
// Slight upward offset on mobile so it clears bottom story boxes
function updatePcGroupY() {
  const isMobile = window.innerWidth < 768;
  pcGroup.position.y = isMobile ? 0.7 : 0;
}
updatePcGroupY();
scene.add(pcGroup);

// Materials with high contrast so they pop clearly against the dark space
const chassisMetalMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  metalness: 0.85,
  roughness: 0.2,
});

const chassisAccentMat = new THREE.MeshStandardMaterial({
  color: 0x0ea5e9,
  metalness: 0.6,
  roughness: 0.3,
  emissive: 0x0284c7,
  emissiveIntensity: 0.25,
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.25,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.85,
  ior: 1.4,
});

// A. Main Chassis Frame
const chassisFrame = new THREE.Group();
const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 1.5), chassisMetalMat);
chassisFrame.add(bodyMesh);

// Corner glowing edge rails
for (let x of [-1.01, 1.01]) {
  for (let z of [-0.76, 0.76]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.05, 0.04), chassisAccentMat);
    rail.position.set(x, 0, z);
    chassisFrame.add(rail);
  }
}
pcGroup.add(chassisFrame);

// Tempered Glass Panel
const glass = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.9, 1.4), glassMat);
glass.position.set(1.02, 0, 0);
pcGroup.add(glass);

// B. Components
// Motherboard
const mobo = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 2.4, 1.15),
  new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5, metalness: 0.5 })
);
mobo.position.set(-0.75, 0, 0);
pcGroup.add(mobo);

// GPU Block
const gpu = new THREE.Mesh(
  new THREE.BoxGeometry(0.55, 0.35, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
);
gpu.position.set(-0.35, -0.4, 0);
pcGroup.add(gpu);

// Liquid AIO CPU Cooler
const cooler = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.28, 0.15, 32),
  new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
);
cooler.rotation.z = Math.PI / 2;
cooler.position.set(-0.62, 0.38, 0);
pcGroup.add(cooler);

const coolerRingMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
const coolerRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.2, 0.025, 16, 32),
  coolerRingMat
);
coolerRing.rotation.y = Math.PI / 2;
coolerRing.position.set(-0.52, 0.38, 0);
pcGroup.add(coolerRing);

// Glowing DDR5 RAM Sticks
const ramMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  emissive: 0x38bdf8,
  emissiveIntensity: 0.4,
});
const ram1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.1), ramMat);
const ram2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.1), ramMat);
ram1.position.set(-0.62, 0.45, 0.32);
ram2.position.set(-0.62, 0.45, 0.18);
pcGroup.add(ram1);
pcGroup.add(ram2);

// Front 3-Fan RGB Array
const fansGroup = new THREE.Group();
const fanRings = [];
for (let i = -1; i <= 1; i++) {
  const fMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.4 });
  const fRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 16, 32), fMat);
  fRing.position.set(0, i * 0.85, 0.77);
  fansGroup.add(fRing);
  fanRings.push(fMat);
}
pcGroup.add(fansGroup);

// Front Boot Monitor / Aero Cloud Display
const canvasLogo = document.createElement("canvas");
canvasLogo.width = 512;
canvasLogo.height = 256;
const ctx = canvasLogo.getContext("2d");
ctx.fillStyle = "#020617";
ctx.fillRect(0, 0, 512, 256);
ctx.fillStyle = "#00f3ff";
ctx.font = "bold 56px -apple-system, sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("AERO CLOUD", 256, 100);
ctx.fillStyle = "#38bdf8";
ctx.font = "bold 26px monospace";
ctx.fillText("SYSTEM ACTIVE", 256, 165);

const logoTexture = new THREE.CanvasTexture(canvasLogo);
const logoPanelMat = new THREE.MeshBasicMaterial({
  map: logoTexture,
  transparent: true,
  opacity: 0,
});
const logoPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), logoPanelMat);
logoPanel.position.set(0, 0, 0.78);
pcGroup.add(logoPanel);

// 4. Initial Exploded Positions (Hero Stage)
mobo.position.x = -2.6;
gpu.position.x = 2.4;
gpu.position.y = -1.6;
gpu.rotation.z = 0.45;
cooler.position.y = 2.4;
coolerRing.position.y = 2.4;
ram1.position.z = 2.2;
ram2.position.z = 2.4;
pcGroup.rotation.y = -0.55;
pcGroup.rotation.x = 0.2;

// 5. GSAP Scroll Animation
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#scene-wrapper",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2,
  },
});

// Phase 1: Assembly Sequence
tl.to(
  mobo.position,
  { x: -0.75, ease: "power2.out", duration: 2 },
  "assemble"
)
  .to(
    gpu.position,
    { x: -0.35, y: -0.4, ease: "power2.out", duration: 2 },
    "assemble"
  )
  .to(gpu.rotation, { z: 0, ease: "power2.out", duration: 2 }, "assemble")
  .to(
    [cooler.position, coolerRing.position],
    { y: 0.38, ease: "back.out(1.2)", duration: 2 },
    "assemble+=0.2"
  )
  .to(
    [ram1.position, ram2.position],
    { z: (i) => (i === 0 ? 0.32 : 0.18), ease: "power2.out", duration: 1.8 },
    "assemble+=0.3"
  )
  .to(
    pcGroup.rotation,
    { x: 0.05, y: -0.85, duration: 2.5, ease: "power1.inOut" },
    "assemble"
  );

// Phase 2: Power Up LEDs & RGB Fans
tl.to(
  pointLight,
  { intensity: 5.5, duration: 1.5, ease: "power2.in" },
  "powerup"
)
  .to(
    coolerRingMat,
    { color: new THREE.Color(0x38bdf8), duration: 1 },
    "powerup"
  )
  .to(
    ramMat,
    { emissiveIntensity: 3.0, duration: 1 },
    "powerup"
  )
  .to(
    fanRings,
    { opacity: 0.9, duration: 1 },
    "powerup"
  )
  .to(
    pcGroup.rotation,
    { y: -0.15, x: 0, duration: 2, ease: "power1.inOut" },
    "powerup"
  );

// Phase 3: Final Zoom & Screen Boot
const targetZoomZ = () => (window.innerWidth < 768 ? 3.6 : 2.5);
tl.to(
  camera.position,
  {
    x: 0,
    y: () => (window.innerWidth < 768 ? 0.7 : 0),
    z: targetZoomZ,
    duration: 3,
    ease: "power2.inOut",
  },
  "boot"
)
  .to(
    pcGroup.rotation,
    { x: 0, y: 0, duration: 2 },
    "boot"
  )
  .to(
    logoPanelMat,
    { opacity: 1, duration: 1.5, ease: "power2.out" },
    "boot+=0.8"
  );

// 6. Natural Float & Continuous Render Loop
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Subtle floating motion
  const baseY = window.innerWidth < 768 ? 0.7 : 0;
  pcGroup.position.y = baseY + Math.sin(elapsedTime * 1.5) * 0.05;
  coolerRing.rotation.x = elapsedTime * 2;

  renderer.render(scene, camera);
}
animate();

// 7. Dynamic Window Resizing
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = w / h;
  camera.position.z = getResponsiveCameraZ();
  updatePcGroupY();
  camera.updateProjectionMatrix();
  ScrollTrigger.refresh();
});
