import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 1. Fetch & render portfolio projects
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
renderer.setClearColor(0x05070d, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070d, 0.08);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1, 6.5);
scene.add(camera);

// Ambient & dynamic lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x00f3ff, 0, 10);
pointLight.position.set(0, 0, 1.5);
scene.add(pointLight);

// 3. Procedural Cyberpunk PC Rig Assembly
const pcGroup = new THREE.Group();
scene.add(pcGroup);

// Materials
const metalMat = new THREE.MeshStandardMaterial({
  color: 0x111625,
  metalness: 0.85,
  roughness: 0.25,
});

const darkMetalMat = new THREE.MeshStandardMaterial({
  color: 0x080c14,
  metalness: 0.9,
  roughness: 0.4,
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x0f172a,
  transparent: true,
  opacity: 0.4,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.8,
  ior: 1.5,
});

// A. Chassis Frame
const chassisGeo = new THREE.BoxGeometry(2.2, 3.2, 1.6);
const chassis = new THREE.Mesh(chassisGeo, darkMetalMat);
pcGroup.add(chassis);

// Glass Side Panel
const glassGeo = new THREE.BoxGeometry(0.04, 3.0, 1.45);
const glass = new THREE.Mesh(glassGeo, glassMat);
glass.position.set(1.12, 0, 0);
pcGroup.add(glass);

// B. Exploded Components
// Motherboard
const moboGeo = new THREE.BoxGeometry(0.1, 2.4, 1.2);
const moboMat = new THREE.MeshStandardMaterial({ color: 0x0d3b66, roughness: 0.6 });
const mobo = new THREE.Mesh(moboGeo, moboMat);
mobo.position.set(-0.8, 0, 0);
pcGroup.add(mobo);

// GPU (High-end Graphic Card)
const gpuGeo = new THREE.BoxGeometry(0.6, 0.4, 1.3);
const gpuMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
const gpu = new THREE.Mesh(gpuGeo, gpuMat);
gpu.position.set(-0.3, -0.4, 0);
pcGroup.add(gpu);

// CPU AIO Cooler (with glowing RGB ring)
const coolerGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32);
const coolerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
const cooler = new THREE.Mesh(coolerGeo, coolerMat);
cooler.rotation.z = Math.PI / 2;
cooler.position.set(-0.65, 0.4, 0);
pcGroup.add(cooler);

const coolerRingGeo = new THREE.TorusGeometry(0.22, 0.03, 16, 32);
const coolerRingMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
const coolerRing = new THREE.Mesh(coolerRingGeo, coolerRingMat);
coolerRing.rotation.y = Math.PI / 2;
coolerRing.position.set(-0.55, 0.4, 0);
pcGroup.add(coolerRing);

// RAM Sticks
const ramGeo = new THREE.BoxGeometry(0.05, 0.7, 0.12);
const ramMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.2 });
const ram1 = new THREE.Mesh(ramGeo, ramMat);
const ram2 = new THREE.Mesh(ramGeo, ramMat);
ram1.position.set(-0.65, 0.5, 0.35);
ram2.position.set(-0.65, 0.5, 0.2);
pcGroup.add(ram1);
pcGroup.add(ram2);

// Front RGB Fan Grids
const fanGroup = new THREE.Group();
for (let i = -1; i <= 1; i++) {
  const fanGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
  const fanMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.3 });
  const fan = new THREE.Mesh(fanGeo, fanMat);
  fan.position.set(0, i * 0.9, 0.82);
  fanGroup.add(fan);
}
pcGroup.add(fanGroup);

// Front LED Logo Panel (Aero Cloud Boot Screen)
const canvasLogo = document.createElement("canvas");
canvasLogo.width = 512;
canvasLogo.height = 256;
const ctx = canvasLogo.getContext("2d");
ctx.fillStyle = "#020617";
ctx.fillRect(0, 0, 512, 256);
ctx.fillStyle = "#22d3ee";
ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("AERO CLOUD", 256, 110);
ctx.fillStyle = "#38bdf8";
ctx.font = "24px monospace";
ctx.fillText("SYSTEM ONLINE", 256, 175);

const logoTexture = new THREE.CanvasTexture(canvasLogo);
const logoPanelGeo = new THREE.PlaneGeometry(1.6, 0.8);
const logoPanelMat = new THREE.MeshBasicMaterial({
  map: logoTexture,
  transparent: true,
  opacity: 0,
});
const logoPanel = new THREE.Mesh(logoPanelGeo, logoPanelMat);
logoPanel.position.set(0, 0, 0.83);
pcGroup.add(logoPanel);

// 4. Initial Exploded Positions
mobo.position.x = -2.8;
gpu.position.x = 2.5;
gpu.position.y = -1.5;
gpu.rotation.z = 0.4;
cooler.position.y = 2.5;
coolerRing.position.y = 2.5;
ram1.position.z = 2.0;
ram2.position.z = 2.2;
chassis.rotation.y = -0.5;
pcGroup.rotation.y = -0.4;
pcGroup.rotation.x = 0.2;

// 5. GSAP Scroll Animation Timeline
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#scene-wrapper",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2,
  },
});

// Phase 1: Assembly (Floating parts lock into chassis)
tl.to(
  mobo.position,
  { x: -0.8, ease: "power2.out", duration: 2 },
  "assemble"
)
  .to(
    gpu.position,
    { x: -0.3, y: -0.4, ease: "power2.out", duration: 2 },
    "assemble"
  )
  .to(gpu.rotation, { z: 0, ease: "power2.out", duration: 2 }, "assemble")
  .to(
    [cooler.position, coolerRing.position],
    { y: 0.4, ease: "back.out(1.2)", duration: 2 },
    "assemble+=0.3"
  )
  .to(
    [ram1.position, ram2.position],
    { z: (i) => (i === 0 ? 0.35 : 0.2), ease: "power2.out", duration: 1.8 },
    "assemble+=0.2"
  )
  .to(
    pcGroup.rotation,
    { x: 0.05, y: -0.8, duration: 2.5, ease: "power1.inOut" },
    "assemble"
  );

// Phase 2: Power Up & RGB Glow
tl.to(
  pointLight,
  { intensity: 4.5, duration: 1.5, ease: "power2.in" },
  "powerup"
)
  .to(
    coolerRingMat,
    { color: new THREE.Color(0x38bdf8), duration: 1 },
    "powerup"
  )
  .to(
    ramMat,
    { emissiveIntensity: 2.5, duration: 1 },
    "powerup"
  )
  .to(
    pcGroup.rotation,
    { y: -0.1, x: 0, duration: 2, ease: "power1.inOut" },
    "powerup"
  );

// Phase 3: Zoom In & Boot Screen
tl.to(
  camera.position,
  { x: 0, y: 0, z: 2.4, duration: 3, ease: "power2.inOut" },
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
    "boot+=1"
  );

// 6. Smooth Loop & Idle Floating Animation
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Subtle natural idle float
  pcGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;
  coolerRing.rotation.x = elapsedTime * 2;

  renderer.render(scene, camera);
}
animate();

// 7. Responsive Resizing
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
