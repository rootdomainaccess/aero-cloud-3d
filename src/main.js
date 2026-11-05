// src/main.js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Portfolio cards
fetch("./src/assets/portfolio.json")
  .then(r => r.json())
  .then(list => {
    const container = document.getElementById("cards");
    list.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.style.backgroundImage = `url(${item.thumb})`;
      div.textContent = item.title;
      div.onclick = () => window.open(item.url, "_blank");
      container.appendChild(div);
    });
  });

// Three.js setup
const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 5);
scene.add(camera);

const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7);
scene.add(dir);

const loader = new GLTFLoader();
const parts = {};

async function loadPart(name, url) {
  try {
    const gltf = await loader.loadAsync(url);
    const mesh = gltf.scene;
    mesh.visible = false;
    scene.add(mesh);
    parts[name] = mesh;
  } catch (e) {
    // placeholder box
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x777777 });
    const box = new THREE.Mesh(geo, mat);
    box.visible = false;
    scene.add(box);
    parts[name] = box;
  }
}

async function init() {
  await Promise.all([
    loadPart("base", "./public/models/computer_base.glb"),
    loadPart("screen", "./public/models/computer_screen.glb"),
    loadPart("gpu", "./public/models/computer_gpu.glb"),
    loadPart("hdd", "./public/models/computer_hdd.glb"),
    loadPart("logo", "./public/models/aero-cloud-logo.glb"),
  ]);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#scene-wrapper",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      anticipatePin: 1,
    },
  });

  tl.set(parts.base, { visible: true });

  tl.fromTo(parts.screen.position, { y: 2 }, { y: 0, duration: 1, ease: "power2.out" }, "+=0.2")
    .set(parts.screen, { visible: true }, "-=0.9");

  tl.fromTo(parts.gpu.position, { x: -3 }, { x: 0, duration: 1, ease: "back.out(1.5)" }, "+=0.3")
    .set(parts.gpu, { visible: true }, "-=0.9");

  tl.fromTo(parts.hdd.position, { x: 3 }, { x: 0, duration: 1, ease: "back.out(1.5)" }, "+=0.3")
    .set(parts.hdd, { visible: true }, "-=0.9");

  tl.to(hemi, { intensity: 2.5, duration: 1 }, "-=0.5");

  tl.to(parts.screen.children[0].material, {
    color: "#00ff88",
    emissiveIntensity: 1,
    duration: 1,
  }, "-=0.5");

  tl.fromTo(parts.logo.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: "elastic.out(1,0.4)" })
    .set(parts.logo, { visible: true }, "-=1");
}

init();

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
