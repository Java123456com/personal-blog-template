import * as THREE from "three";

type CosmicModule = {
  title: string;
  subtitle: string;
  href: string;
  color: number;
  symbol: string;
};

const MODULES: CosmicModule[] = [
  { title: "首页", subtitle: "MAIN PORTAL", href: "/", color: 0x9b8cff, symbol: "⌂" },
  { title: "技术学习", subtitle: "TECH NOTES", href: "/moments/tech/", color: 0x68d9ff, symbol: "⌘" },
  { title: "日常生活", subtitle: "DAILY LIFE", href: "/moments/life/", color: 0xffbe68, symbol: "✦" },
  { title: "简历", subtitle: "RESUME", href: "/resume/", color: 0x72e2bc, symbol: "▤" },
  { title: "友链", subtitle: "FRIENDS", href: "/friends/", color: 0xff9c83, symbol: "∞" },
  { title: "工具", subtitle: "TOOLS", href: "/tools/", color: 0x67c9ff, symbol: "◇" },
  { title: "关于", subtitle: "ABOUT", href: "/about/", color: 0xd18cff, symbol: "◎" },
];

type HandsConstructor = new (options: { locateFile: (file: string) => string }) => {
  setOptions(options: Record<string, unknown>): void;
  onResults(callback: (result: { multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>> }) => void): void;
  send(input: { image: HTMLVideoElement }): Promise<void>;
  close(): Promise<void>;
};

declare global {
  interface Window { Hands?: HandsConstructor }
}

function loadScript(src: string) {
  const found = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (found) return found.dataset.loaded === "true"
    ? Promise.resolve()
    : new Promise<void>((resolve, reject) => {
        found.addEventListener("load", () => resolve(), { once: true });
        found.addEventListener("error", () => reject(new Error("手势识别库载入失败")), { once: true });
      });
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => { script.dataset.loaded = "true"; resolve(); }, { once: true });
    script.addEventListener("error", () => reject(new Error("手势识别库载入失败")), { once: true });
    document.head.append(script);
  });
}

function particleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(.18, "rgba(220,235,255,.98)");
  gradient.addColorStop(.5, "rgba(122,173,255,.45)");
  gradient.addColorStop(1, "rgba(60,90,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeParticles(count: number, radius: number, color: number, texture: THREE.Texture, shell = false) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new THREE.Color(color);
  const white = new THREE.Color(0xeaf6ff);
  for (let index = 0; index < count; index++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const spread = shell ? .82 + Math.random() * .24 : Math.pow(Math.random(), .46);
    const r = radius * spread;
    positions[index * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = r * Math.cos(phi) * (shell ? .72 : 1);
    positions[index * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    const mixed = base.clone().lerp(white, Math.random() * .72);
    colors[index * 3] = mixed.r;
    colors[index * 3 + 1] = mixed.g;
    colors[index * 3 + 2] = mixed.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: shell ? .26 : .18,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: shell ? 1 : .9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(geometry, material);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function mountCosmicGalaxy(container: HTMLElement) {
  const galaxy = container.querySelector<HTMLElement>(".galaxy");
  const canvas = galaxy?.querySelector<HTMLCanvasElement>("canvas");
  if (!galaxy || !canvas) return () => {};

  galaxy.classList.add("cosmic-nexus");
  canvas.removeAttribute("style");
  const oldHint = galaxy.querySelector<HTMLElement>(".galaxy-hint");
  if (oldHint) oldHint.innerHTML = '<span class="gh-ico">⌖</span>拖动星域 · 点击模块传送 · 可开启摄像头手势控制';

  const markerLayer = document.createElement("div");
  markerLayer.className = "cosmic-markers";
  const hud = document.createElement("div");
  hud.className = "cosmic-hud";
  hud.innerHTML = `<div class="cosmic-status"><span class="cosmic-status-dot"></span><span class="cosmic-status-main">鼠标控制已就绪</span><small>GESTURE LINK · STANDBY</small></div><div class="cosmic-actions"><button type="button" class="cosmic-camera">◉ 开启手势控制</button><button type="button" class="cosmic-reset" title="复位星域">↻ 复位</button></div>`;
  const pip = document.createElement("div");
  pip.className = "cosmic-pip";
  pip.hidden = true;
  pip.innerHTML = `<video muted playsinline></video><canvas width="240" height="160"></canvas><span>HAND TRACKING</span>`;
  galaxy.append(markerLayer, hud, pip);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05091d, .012);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 180);
  camera.position.set(0, 12, 52);
  camera.lookAt(0, 0, 0);
  const texture = particleTexture();

  const root = new THREE.Group();
  root.rotation.x = -.12;
  scene.add(root);
  const core = makeParticles(15000, 9.6, 0xa889ff, texture, true);
  core.scale.set(1.45, .74, 1.05);
  root.add(core);
  const coreGlow = makeParticles(6000, 6.2, 0x56ecff, texture);
  coreGlow.scale.set(1.7, .42, 1.15);
  root.add(coreGlow);
  const nucleusGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: 0xffc866, transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending }));
  nucleusGlow.scale.set(16, 10, 1);
  root.add(nucleusGlow);
  const nucleus = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: 0xfff1c6, transparent: true, opacity: .82, depthWrite: false, blending: THREE.AdditiveBlending }));
  nucleus.scale.set(5.2, 3.2, 1);
  root.add(nucleus);

  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(2600 * 3);
  const dustColors = new Float32Array(2600 * 3);
  const armColors = [0x54efff, 0xa47cff, 0xffcf66, 0x51dfff, 0xff72bc].map(color => new THREE.Color(color));
  for (let i = 0; i < 2600; i++) {
    const arm = i % 5;
    const r = 5 + Math.random() * 29;
    const a = arm * Math.PI * .4 + r * .17 + (Math.random() - .5) * .58;
    dustPositions[i * 3] = Math.cos(a) * r;
    dustPositions[i * 3 + 1] = (Math.random() - .5) * (1.2 + r * .035);
    dustPositions[i * 3 + 2] = Math.sin(a) * r * .72;
    const color = armColors[arm].clone().lerp(new THREE.Color(0xffffff), Math.random() * .32);
    dustColors[i * 3] = color.r;
    dustColors[i * 3 + 1] = color.g;
    dustColors[i * 3 + 2] = color.b;
  }
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ size: .24, map: texture, vertexColors: true, transparent: true, opacity: .88, depthWrite: false, blending: THREE.AdditiveBlending }));
  root.add(dust);

  const orbit = new THREE.Group();
  root.add(orbit);
  const nodes: Array<{ group: THREE.Group; label: HTMLButtonElement; position: THREE.Vector3; data: CosmicModule }> = [];
  MODULES.forEach((module, index) => {
    const angle = index / MODULES.length * Math.PI * 2;
    const group = new THREE.Group();
    group.position.set(Math.cos(angle) * 23.5, Math.sin(angle * 2) * 3.8, Math.sin(angle) * 15);
    const points = makeParticles(760, 2.25, module.color, texture, true);
    group.add(points);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.9, .025, 4, 72),
      new THREE.MeshBasicMaterial({ color: module.color, transparent: true, opacity: .34, blending: THREE.AdditiveBlending }),
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    orbit.add(group);
    const label = document.createElement("button");
    label.type = "button";
    label.className = "cosmic-marker";
    label.style.setProperty("--module-color", `#${module.color.toString(16).padStart(6, "0")}`);
    label.innerHTML = `<span class="cosmic-reticle"></span><b>${module.symbol}</b><span><strong>${module.title}</strong><small>${module.subtitle}</small></span>`;
    label.addEventListener("click", () => { window.location.href = module.href; });
    markerLayer.append(label);
    nodes.push({ group, label, position: new THREE.Vector3(), data: module });
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MODULES.length * 3), 3));
  const web = new THREE.LineLoop(lineGeometry, new THREE.LineBasicMaterial({ color: 0x83c9ff, transparent: true, opacity: .25, blending: THREE.AdditiveBlending }));
  orbit.add(web);

  let width = 1;
  let height = 1;
  let frame = 0;
  let rotation = .22;
  let targetRotation = rotation;
  let zoom = 52;
  let targetZoom = zoom;
  let dragX = 0;
  let dragging = false;
  let moved = false;
  let focused = 0;
  let destroyed = false;
  const resize = () => {
    const rect = galaxy.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(galaxy);
  resize();

  const pointerDown = (event: PointerEvent) => {
    dragging = true;
    moved = false;
    dragX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
    galaxy.classList.add("is-dragging");
  };
  const pointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    const delta = event.clientX - dragX;
    if (Math.abs(delta) > 1) moved = true;
    targetRotation += delta * .005;
    dragX = event.clientX;
  };
  const pointerUp = () => { dragging = false; galaxy.classList.remove("is-dragging"); };
  const wheel = (event: WheelEvent) => {
    event.preventDefault();
    targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * .018, 38, 68);
  };
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("wheel", wheel, { passive: false });

  const setStatus = (main: string, sub: string, live = false) => {
    hud.querySelector<HTMLElement>(".cosmic-status-main")!.textContent = main;
    hud.querySelector<HTMLElement>(".cosmic-status small")!.textContent = sub;
    hud.classList.toggle("is-live", live);
  };
  const reset = () => { targetRotation = .22; targetZoom = 52; setStatus("星域坐标已复位", "ORBIT CALIBRATED", Boolean(stream)); };
  const resetButton = hud.querySelector<HTMLButtonElement>(".cosmic-reset")!;
  resetButton.addEventListener("click", reset);

  let stream: MediaStream | null = null;
  let hands: InstanceType<HandsConstructor> | null = null;
  let handFrame = 0;
  let handBusy = false;
  let lastHandX: number | null = null;
  let fistSince = 0;
  let lastEnter = 0;
  const video = pip.querySelector<HTMLVideoElement>("video")!;
  const pipCanvas = pip.querySelector<HTMLCanvasElement>("canvas")!;
  const pipContext = pipCanvas.getContext("2d")!;
  const cameraButton = hud.querySelector<HTMLButtonElement>(".cosmic-camera")!;

  const stopCamera = () => {
    cancelAnimationFrame(handFrame);
    handFrame = 0;
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    pip.hidden = true;
    cameraButton.textContent = "◉ 开启手势控制";
    setStatus("鼠标控制已就绪", "GESTURE LINK · STANDBY");
  };
  const drawHand = (landmarks: Array<{ x: number; y: number }>) => {
    pipContext.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
    pipContext.strokeStyle = "rgba(105,213,255,.72)";
    pipContext.lineWidth = 1;
    const links = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    links.forEach(([a,b]) => { pipContext.beginPath(); pipContext.moveTo((1-landmarks[a].x)*240,landmarks[a].y*160);pipContext.lineTo((1-landmarks[b].x)*240,landmarks[b].y*160);pipContext.stroke(); });
    pipContext.fillStyle = "#dff8ff";
    landmarks.forEach(point => { pipContext.beginPath();pipContext.arc((1-point.x)*240,point.y*160,2.2,0,Math.PI*2);pipContext.fill(); });
  };
  const handleHand = (landmarks?: Array<{ x: number; y: number; z: number }>) => {
    if (!landmarks) { lastHandX = null; fistSince = 0; setStatus("等待手势进入画面", "HAND SEARCHING", true); return; }
    drawHand(landmarks);
    const palmX = 1 - landmarks[9].x;
    if (lastHandX !== null) targetRotation += THREE.MathUtils.clamp(palmX - lastHandX, -.06, .06) * 3.4;
    lastHandX = palmX;
    const palmSize = distance(landmarks[0], landmarks[9]);
    targetZoom = THREE.MathUtils.clamp(69 - palmSize * 115, 39, 66);
    const curled = [8,12,16,20].filter(tip => distance(landmarks[tip], landmarks[0]) < distance(landmarks[tip-2], landmarks[0]) * 1.12).length;
    if (curled >= 3) {
      if (!fistSince) fistSince = performance.now();
      const progress = Math.min(100, (performance.now() - fistSince) / 6.5);
      setStatus(`握拳确认 ${MODULES[focused].title} · ${Math.round(progress)}%`, "HOLD TO ENTER", true);
      if (performance.now() - fistSince > 650 && performance.now() - lastEnter > 1800) {
        lastEnter = performance.now();
        window.location.href = MODULES[focused].href;
      }
    } else {
      fistSince = 0;
      setStatus(`手势锁定 · ${MODULES[focused].title}`, "MOVE · ZOOM · FIST TO ENTER", true);
    }
  };
  const pumpHands = async () => {
    if (!stream || destroyed) return;
    if (!handBusy && video.readyState >= 2 && hands) {
      handBusy = true;
      await hands.send({ image: video }).catch(() => {}).finally(() => { handBusy = false; });
    }
    handFrame = requestAnimationFrame(pumpHands);
  };
  const startCamera = async () => {
    if (stream) { stopCamera(); return; }
    cameraButton.disabled = true;
    cameraButton.textContent = "连接摄像头…";
    setStatus("正在载入手势识别", "MEDIAPIPE INITIALIZING", true);
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      if (!window.Hands) throw new Error("手势识别库不可用");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      video.srcObject = stream;
      await video.play();
      if (!hands) {
        hands = new window.Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: .55, minTrackingConfidence: .5 });
        hands.onResults(result => handleHand(result.multiHandLandmarks?.[0]));
      }
      pip.hidden = false;
      cameraButton.textContent = "关闭手势控制";
      setStatus("手势控制已连接", "MOVE · ZOOM · FIST TO ENTER", true);
      pumpHands();
    } catch (error) {
      stopCamera();
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
      setStatus(denied ? "未获得摄像头权限" : "手势识别连接失败", denied ? "请允许摄像头后重试" : "GESTURE LINK ERROR");
    } finally { cameraButton.disabled = false; }
  };
  cameraButton.addEventListener("click", startCamera);

  const projected = new THREE.Vector3();
  const animate = (now: number) => {
    if (destroyed) return;
    frame = requestAnimationFrame(animate);
    rotation += (targetRotation - rotation) * .075;
    zoom += (targetZoom - zoom) * .075;
    camera.position.z = zoom;
    camera.position.y = 11 + (zoom - 52) * .08;
    camera.lookAt(0, 0, 0);
    root.rotation.y = rotation;
    core.rotation.y += .00065;
    coreGlow.rotation.y -= .00038;
    dust.rotation.y += .00028;
    nodes.forEach((node, index) => {
      node.group.rotation.y += .004;
      node.group.getWorldPosition(node.position);
      (lineGeometry.attributes.position.array as Float32Array).set([node.position.x,node.position.y,node.position.z], index*3);
      projected.copy(node.position).project(camera);
      const visible = projected.z < 1 && projected.z > -1;
      node.label.style.transform = `translate3d(${(projected.x*.5+.5)*width}px,${(-projected.y*.5+.5)*height}px,0) translate(-50%,-50%) scale(${THREE.MathUtils.clamp(1.05-projected.z*.23,.68,1.12)})`;
      node.label.style.opacity = visible ? String(THREE.MathUtils.clamp(1.15-projected.z*.45,.28,1)) : "0";
      node.label.style.zIndex = String(Math.round((1-projected.z)*50));
    });
    lineGeometry.attributes.position.needsUpdate = true;
    let best = Infinity;
    let nextFocused = focused;
    nodes.forEach((node,index) => {
      projected.copy(node.position).project(camera);
      const score = Math.hypot(projected.x, projected.y) + Math.max(0, projected.z) * .18;
      if (score < best) { best = score; nextFocused = index; }
    });
    if (nextFocused !== focused) {
      nodes[focused]?.label.classList.remove("is-focused");
      focused = nextFocused;
      nodes[focused]?.label.classList.add("is-focused");
    }
    renderer.render(scene, camera);
  };
  nodes[0].label.classList.add("is-focused");
  frame = requestAnimationFrame(animate);

  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    stopCamera();
    void hands?.close();
    observer.disconnect();
    canvas.removeEventListener("pointerdown", pointerDown);
    canvas.removeEventListener("pointermove", pointerMove);
    canvas.removeEventListener("pointerup", pointerUp);
    canvas.removeEventListener("pointercancel", pointerUp);
    canvas.removeEventListener("wheel", wheel);
    resetButton.removeEventListener("click", reset);
    cameraButton.removeEventListener("click", startCamera);
    scene.traverse(object => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach(item => item.dispose()); else material?.dispose?.();
    });
    texture.dispose();
    renderer.dispose();
    markerLayer.remove(); hud.remove(); pip.remove();
    galaxy.classList.remove("cosmic-nexus", "is-dragging");
  };
}
