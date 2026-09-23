"use client";

import { useLayoutEffect } from "react";
import { enhanceGame } from "./game";
import { enhanceNav } from "./nav";

const scope = "data-v-fcc15a3a";
const feedLines = [
  ["> ", "whoami"], ["= ", "站点主人 :: 内容待填写"],
  ["> ", "cat ./notes.log"], ["= ", "技术学习记录 · 日常生活记录"],
  ["> ", "echo $STATUS"], ["= ", '"等待第一篇内容。"'],
  ["> ", "ls ./modules"], ["= ", "tech/  life/  friends/  tools/  about/"],
];

function enhanceTerminal(root: HTMLElement) {
  const feed = root.querySelector<HTMLElement>(".terminal-feed");
  if (feed) feed.innerHTML = feedLines.map(([prompt, text]) => `<div ${scope} class="feed-line"><span ${scope} class="feed-prompt">${prompt === "> " ? "&gt; " : "= "}</span><span ${scope} class="feed-text">${text}</span></div>`).join("");
  const command = root.querySelector<HTMLElement>(".ph-cmd");
  if (command) command.textContent = "ls ./modules";
  const start = Date.now();
  const update = () => {
    const clock = root.querySelector<HTMLElement>(".hud-bar-right .hud-bar-text:last-child");
    if (clock) clock.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    const uptime = root.querySelector<HTMLElement>(".panel-meta");
    if (uptime) uptime.textContent = `uptime ${new Date(Date.now() - start).toISOString().slice(11, 19)}`;
    root.querySelectorAll<HTMLElement>(".meter").forEach((meter, index) => {
      const value = Math.round([32, 64, 86][index] + (Math.random() - .5) * [20, 12, 10][index]);
      const pct = meter.querySelector<HTMLElement>(".meter-pct");
      const fill = meter.querySelector<HTMLElement>(".meter-fill");
      if (pct) pct.textContent = `${value}%`;
      if (fill) fill.style.width = `${value}%`;
    });
    const tx = root.querySelector<HTMLElement>(".panel-foot .dim");
    if (tx) tx.textContent = `tx ${Math.round(80 + Math.random() * 60)} kb/s`;
    root.querySelector(".wave polyline")?.setAttribute("points", Array.from({ length: 41 }, (_, i) => `${i * 5},${(19 + 8 * Math.sin(i * .68 + Date.now() / 1400) + Math.random() * 5).toFixed(1)}`).join(" "));
  };
  update();
  const interval = window.setInterval(update, 1600);
  const canvas = root.querySelector<HTMLCanvasElement>(".rain-canvas");
  let frame = 0;
  let observer: ResizeObserver | undefined;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let drops: number[] = [];
      const resize = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; drops = Array.from({ length: Math.ceil(canvas.width / 25) }, () => Math.random() * canvas.height / 16); };
      resize(); observer = new ResizeObserver(resize); observer.observe(canvas);
      let tick = 0;
      const draw = () => {
        frame = requestAnimationFrame(draw);
        if (++tick % 4) return;
        ctx.fillStyle = "rgba(10,8,5,.12)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "13px monospace";
        drops.forEach((d, i) => { ctx.fillStyle = `rgba(255,176,0,${.1 + Math.random() * .16})`; ctx.fillText("01{}[]<>/;"[Math.floor(Math.random() * 10)], i * 25, d * 16); drops[i] = d * 16 > canvas.height && Math.random() > .965 ? 0 : d + .4; });
      };
      draw();
    }
  }
  return () => { window.clearInterval(interval); cancelAnimationFrame(frame); observer?.disconnect(); };
}

function enhanceCipher(root: HTMLElement) {
  const buttons = root.querySelectorAll<HTMLButtonElement>(".cta-btn");
  const enter = () => root.querySelector(".quests")?.scrollIntoView({ behavior: "smooth", block: "start" });
  buttons[0]?.addEventListener("click", enter);
  let modal: HTMLElement | null = null;
  const close = () => { modal?.remove(); modal = null; };
  const open = () => {
    close();
    const puzzles = [["VWDB FXULRXV", "STAY CURIOUS"], ["NHHS FRGLQJ", "KEEP CODING"], ["IXWXUH LV QRZ", "FUTURE IS NOW"]];
    const [cipher, answer] = puzzles[Math.floor(Math.random() * puzzles.length)];
    modal = document.createElement("div"); modal.className = "cipher-mask"; modal.setAttribute(scope, "");
    modal.innerHTML = `<div ${scope} class="cipher-modal"><div ${scope} class="cipher-head"><span ${scope} class="led led-rust"></span><span ${scope}>DECRYPT.exe</span><button ${scope} class="cipher-close">×</button></div><div ${scope} class="cipher-body"><p ${scope} class="cipher-tip">截获一段密文。已知它使用 <span ${scope} class="hl">凯撒密码 / shift = 3</span>，请输入原文 <span ${scope} class="hl">（忽略大小写与空格）</span>：</p><div ${scope} class="cipher-cipher">${cipher}</div><div ${scope} class="cipher-form"><span ${scope} class="cipher-prompt">solve&gt;</span><input ${scope} class="cipher-input" placeholder="type the plaintext..." spellcheck="false" autocomplete="off"></div><div ${scope} class="cipher-result"></div><div ${scope} class="cipher-actions"><button ${scope} class="cipher-btn">[ VERIFY ]</button><button ${scope} class="cipher-btn ghost">[ HINT ]</button></div></div></div>`;
    root.append(modal);
    const activeModal = modal;
    const input = activeModal.querySelector<HTMLInputElement>(".cipher-input")!;
    const result = activeModal.querySelector<HTMLElement>(".cipher-result")!;
    const verify = () => { const good = input.value.replace(/\s/g, "").toUpperCase() === answer.replace(/\s/g, ""); result.textContent = good ? "ACCESS GRANTED :: 信号已解锁 ✓" : "ACCESS DENIED :: 再试一次"; result.className = `cipher-result ${good ? "success" : "error"}`; };
    activeModal.querySelector(".cipher-close")?.addEventListener("click", close);
    activeModal.querySelector(".cipher-btn")?.addEventListener("click", verify);
    activeModal.querySelector(".cipher-btn.ghost")?.addEventListener("click", () => { result.textContent = `hint :: 首字母解出来是 "${answer[0]}"`; });
    input.addEventListener("keydown", e => { if (e.key === "Enter") verify(); });
    activeModal.addEventListener("click", e => { if (e.target === activeModal) close(); });
    input.focus();
  };
  const esc = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
  buttons[1]?.addEventListener("click", open); document.addEventListener("keydown", esc);
  return () => { buttons[0]?.removeEventListener("click", enter); buttons[1]?.removeEventListener("click", open); document.removeEventListener("keydown", esc); close(); };
}

export default function ClientEnhancements({ starMarkup }: { starMarkup: string }) {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".wasteland");
    if (!root) return;
    const cleanup = [enhanceTerminal(root), enhanceCipher(root), enhanceGame(root), enhanceNav(root, starMarkup)];
    return () => cleanup.forEach(fn => fn());
  }, [starMarkup]);
  return null;
}
