"use client";

import { useLayoutEffect, useRef, useState } from "react";

const SPRITE = "/sites/yihanglizi-cn-bc4c2f76/shared/img/cat-sprite.png";
const MEOWS = [1, 2, 3].map(
  index => `/sites/yihanglizi-cn-bc4c2f76/shared/sounds/cat/meow${index}.mp3`,
);
const BASE = 32;
const COLS = 8;
const ROW_FRAMES: Record<number, number> = {
  0: 4, 1: 4, 2: 4, 3: 4, 4: 8, 5: 8, 6: 4, 7: 6, 8: 7, 9: 8,
};
const POSES = [
  { row: 2, frames: 4, weight: 3 },
  { row: 3, frames: 4, weight: 3 },
  { row: 7, frames: 6, weight: 1.4 },
  { row: 1, frames: 4, weight: 1 },
  { row: 9, frames: 8, weight: 1.2 },
];
const CLICK_POSES = [8, 9, 2, 3, 7, 1];
const SHOWCASE = [8, 9, 2, 3, 7, 1, 6, 0];
const IDLE_LINES = [
  "Shift+H 看看本喵指南～",
  "右上角可以切换主题哦",
  "我是这儿的常驻喵 🐾",
  "欢迎你来玩～",
  "喵～",
  "咕噜咕噜…好舒服",
  "喂！别偷看我发呆",
  "尾巴不是逗猫棒！",
];
const CLICK_LINES = ["喵！", "不许戳我肚子！", "哼，再来一下试试！", "(⊙o⊙)！！", "摸好啰，舒服～", "再摸要收费了"];
const DROP_LINES = ["放我下来！", "哎哟～要摔啦！", "饶命饶命", "喵呜！！", "稳稳…落地！"];

type Mode = "idle" | "walk" | "run" | "jump" | "pose" | "sleep" | "drag" | "drop" | "showcase";

export default function CatPet() {
  const stageRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const sprite = spriteRef.current;
    const shadow = shadowRef.current;
    if (!stage || !sprite || !shadow) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scale = reduced ? 3 : window.matchMedia("(max-width: 640px)").matches ? 2 : 4;
    let size = BASE * scale;
    let viewportWidth = window.innerWidth;
    let x = Math.max(0, viewportWidth - size - 12);
    let targetX = x;
    let facing: "left" | "right" = "left";
    let mode: Mode = "idle";
    let row = 0;
    let frames = 4;
    let frame = 0;
    let speed = 66;
    let distanceTravelled = 0;
    let actionElapsed = 0;
    let actionDuration = .8;
    let idleElapsed = 0;
    let idleDelay = .8;
    let chatterElapsed = 0;
    let chatterTarget = 12 + Math.random() * 16;
    let vertical = 0;
    let jumpElapsed = 0;
    let dropElapsed = 0;
    let showcaseIndex = 0;
    let showcaseElapsed = 0;
    let clock = 0;
    let pointerId = -1;
    let pointerMoved = false;
    let longPressTriggered = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerOffsetX = 0;
    let raf = 0;
    let last = performance.now();
    let bubbleTimer: number | undefined;
    let helpTimer: number | undefined;
    let holdTimer: number | undefined;
    const meowPool = MEOWS.map(source => {
      const audio = new Audio(source);
      audio.preload = "auto";
      audio.load();
      return audio;
    });
    let activeAudio: HTMLAudioElement | null = null;
    let lastMeow = -1;
    let bubbleShown = false;

    const setDimensions = () => {
      size = BASE * scale;
      stage.style.width = `${size}px`;
      stage.style.height = `${size}px`;
      sprite.style.width = `${size}px`;
      sprite.style.height = `${size}px`;
      sprite.style.backgroundImage = `url(${SPRITE})`;
      sprite.style.backgroundRepeat = "no-repeat";
      sprite.style.backgroundSize = `${BASE * COLS * scale}px ${BASE * 10 * scale}px`;
    };
    const showBubble = (text: string, duration = 1300) => {
      bubbleShown = true;
      setBubble(text);
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(() => { bubbleShown = false; setBubble(null); }, duration);
    };
    const playMeow = () => {
      if (document.documentElement.dataset.soundEffects === "off") return;
      try {
        activeAudio?.pause();
        let next = Math.floor(Math.random() * meowPool.length);
        if (meowPool.length > 1 && next === lastMeow) next = (next + 1) % meowPool.length;
        lastMeow = next;
        const audio = meowPool[next];
        const master = Number(document.documentElement.dataset.soundVolume ?? "1");
        audio.pause();
        audio.currentTime = 0;
        audio.playbackRate = .96 + Math.random() * .08;
        audio.volume = Number.isFinite(master) ? Math.min(1, Math.max(0, master)) : 1;
        activeAudio = audio;
        void audio.play().catch(() => {});
        const clear = () => { if (activeAudio === audio) activeAudio = null; };
        audio.addEventListener("ended", clear, { once: true });
        audio.addEventListener("error", clear, { once: true });
      } catch {}
    };
    const setFrame = (next: number) => {
      frame = next % COLS;
      sprite.style.backgroundPosition = `${Math.round(-frame * BASE * scale)}px ${Math.round(-row * BASE * scale)}px`;
    };
    const setIdle = (delay = .8) => {
      mode = "idle";
      row = 0;
      idleElapsed = 0;
      idleDelay = delay;
      setFrame(0);
    };
    const startTravel = (kind?: "walk" | "run", forced = false) => {
      const max = Math.max(0, viewportWidth - size);
      if (forced) targetX = x < max / 2 ? max : 0;
      else if (x < size + 24) targetX = max * (.7 + Math.random() * .3);
      else if (x > max - size - 24) targetX = max * Math.random() * .3;
      else targetX = Math.random() * max;
      facing = targetX >= x ? "right" : "left";
      mode = kind ?? (Math.random() < .1 ? "run" : "walk");
      row = mode === "run" ? 5 : 4;
      speed = mode === "run" ? 150 : 66;
      distanceTravelled = 0;
    };
    const choosePose = () => {
      let total = POSES.reduce((sum, pose) => sum + pose.weight, 0);
      let pick = Math.random() * total;
      const pose = POSES.find(item => (pick -= item.weight) < 0) ?? POSES[0];
      mode = "pose";
      row = pose.row;
      frames = pose.frames;
      actionElapsed = 0;
      actionDuration = pose.frames * .26;
    };
    const startPoseRow = (nextRow: number, multiplier = 2) => {
      mode = "pose";
      row = nextRow;
      frames = ROW_FRAMES[nextRow] ?? 4;
      actionElapsed = 0;
      actionDuration = frames * .15 * multiplier;
    };
    const randomClickPose = (dropped = false) => {
      const nextRow = CLICK_POSES[Math.floor(Math.random() * CLICK_POSES.length)];
      startPoseRow(nextRow, 3);
      const lines = dropped ? DROP_LINES : CLICK_LINES;
      if (Math.random() < .65) showBubble(lines[Math.floor(Math.random() * lines.length)]);
    };
    const startJump = () => {
      if (mode === "jump") return;
      mode = "jump";
      row = 8;
      jumpElapsed = 0;
      playMeow();
      showBubble("喵！");
    };
    const startShowcase = (vocal = true) => {
      if (reduced) return showBubble("已开启减弱动效：仅可拖拽");
      mode = "showcase";
      showcaseIndex = 0;
      showcaseElapsed = 0;
      row = SHOWCASE[0];
      if (vocal) playMeow();
      showBubble("炫技开始～");
    };
    const toggleHelp = () => {
      setHelpVisible(value => {
        const next = !value;
        window.clearTimeout(helpTimer);
        if (next) helpTimer = window.setTimeout(() => setHelpVisible(false), 8000);
        return next;
      });
    };
    const runCommand = (command: "walk" | "run" | "jump" | "pose") => {
      if (reduced) return showBubble("已开启减弱动效：仅可拖拽");
      if (mode === "drag") return;
      if (command === "walk" || command === "run") startTravel(command, true);
      else if (command === "jump") startJump();
      else { playMeow(); choosePose(); }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches("input,textarea,select") || target.isContentEditable)) return;
      if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
      const commands: Record<string, "walk" | "run" | "jump" | "pose"> = { KeyW: "walk", KeyR: "run", KeyJ: "jump", KeyP: "pose" };
      if (commands[event.code]) runCommand(commands[event.code]);
      else if (/^Digit[0-9]$/.test(event.code)) { playMeow(); startPoseRow(Number(event.code.slice(5))); }
      else if (event.code === "KeyC") startShowcase();
      else if (event.code === "KeyH") toggleHelp();
      else return;
      event.preventDefault();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0 || pointerId !== -1) return;
      event.preventDefault();
      pointerId = event.pointerId;
      pointerMoved = false;
      longPressTriggered = false;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerOffsetX = event.clientX - x;
      bubbleShown = false;
      setBubble(null);
      playMeow();
      try { stage.setPointerCapture(pointerId); } catch {}
      holdTimer = window.setTimeout(() => {
        longPressTriggered = true;
        startShowcase(false);
      }, 550);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      if (!pointerMoved && Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) < 6) return;
      pointerMoved = true;
      mode = "drag";
      row = 8;
      stage.classList.add("grabbing");
      window.clearTimeout(holdTimer);
      longPressTriggered = false;
      x = Math.max(0, Math.min(viewportWidth - size, event.clientX - pointerOffsetX));
      event.preventDefault();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      window.clearTimeout(holdTimer);
      try { stage.releasePointerCapture(pointerId); } catch {}
      pointerId = -1;
      stage.classList.remove("grabbing");
      if (mode === "showcase" || longPressTriggered) return;
      if (pointerMoved) {
        mode = "drop";
        row = 8;
        dropElapsed = 0;
      } else randomClickPose();
    };
    const onMouseEnter = () => {
      if (pointerId === -1 && !reduced && !bubbleShown) showBubble("喵？", 700);
    };
    const onResize = () => {
      viewportWidth = window.innerWidth;
      scale = reduced ? 3 : window.matchMedia("(max-width: 640px)").matches ? 2 : 4;
      setDimensions();
      x = Math.max(0, Math.min(x, viewportWidth - size));
    };
    const updateTransform = (offset = vertical, rotate = 0) => {
      const flip = facing === "left" ? "scaleX(-1) " : "";
      sprite.style.transform = `${flip}translateY(${Math.round(offset)}px) rotate(${rotate}deg)`;
      const squash = mode === "drag" ? .55 : mode === "drop" ? .55 + .45 * Math.min(1, dropElapsed / .3) : vertical ? Math.max(.65, 1 - Math.abs(vertical) / (42 * scale) * .5) : 1;
      shadow.style.transform = `translateX(-50%) scale(${squash.toFixed(2)})`;
    };
    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(.05, Math.max(0, (now - last) / 1000));
      last = now;
      clock += dt;
      stage.style.left = `${Math.round(x)}px`;

      if (mode === "drag") {
        vertical = -(14 * scale) + Math.sin(clock * 22) * .8;
        setFrame(Math.floor(clock * 6) % 2);
        updateTransform(vertical, Math.sin(clock * 16) * 4);
        return;
      }
      if (mode === "drop") {
        dropElapsed += dt;
        vertical = -(14 * scale) * (1 - Math.min(1, dropElapsed / .3));
        setFrame(0);
        updateTransform();
        if (dropElapsed >= .3) randomClickPose(true);
        return;
      }
      if (mode === "jump") {
        jumpElapsed += dt;
        const progress = jumpElapsed / .62;
        if (progress >= 1) { vertical = 0; setIdle(); return; }
        vertical = -42 * scale * Math.sin(Math.PI * progress);
        setFrame(Math.floor(progress * 7) % 7);
        updateTransform();
        return;
      }

      vertical = 0;
      updateTransform(mode === "idle" || mode === "pose" || mode === "sleep" ? Math.sin(clock * 2.1) * .35 * scale : 0);
      if (reduced) return;

      chatterElapsed += dt;
      if (chatterElapsed > chatterTarget && !bubbleShown) {
        showBubble(IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]);
        chatterElapsed = 0;
        chatterTarget = 10 + Math.random() * 18;
      }
      if (mode === "showcase") {
        showcaseElapsed += dt;
        const showcaseFrames = ROW_FRAMES[SHOWCASE[showcaseIndex]] ?? 4;
        setFrame(Math.floor(showcaseElapsed / .12) % showcaseFrames);
        if (showcaseElapsed > .6) {
          showcaseIndex++;
          if (showcaseIndex >= SHOWCASE.length) { setIdle(); startTravel(); }
          else { row = SHOWCASE[showcaseIndex]; showcaseElapsed = 0; }
        }
        return;
      }
      if (mode === "pose") {
        actionElapsed += dt;
        setFrame(Math.floor(actionElapsed / .13) % frames);
        if (actionElapsed > actionDuration) setIdle(.7);
        return;
      }
      if (mode === "sleep") {
        actionElapsed += dt;
        setFrame(Math.floor(actionElapsed / 2.4) % 2);
        return;
      }
      if (mode === "idle") {
        idleElapsed += dt;
        setFrame(0);
        if (idleElapsed > idleDelay) Math.random() < .8 ? choosePose() : startTravel();
        return;
      }
      const step = Math.min(Math.abs(targetX - x), speed * dt);
      x += Math.sign(targetX - x) * step;
      distanceTravelled += step;
      setFrame(Math.floor(distanceTravelled / (mode === "run" ? 62 : 36) * COLS));
      if (Math.abs(targetX - x) < 14) setIdle(.6 + Math.random() * .9);
    };

    setDimensions();
    stage.style.left = `${Math.round(x)}px`;
    setFrame(0);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("mouseenter", onMouseEnter);
    if (!reduced) startTravel();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(bubbleTimer);
      window.clearTimeout(helpTimer);
      window.clearTimeout(holdTimer);
      activeAudio?.pause();
      meowPool.forEach(audio => { audio.pause(); audio.src = ""; });
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  return (
    <div className="catpet">
      <button
        type="button"
        className="cp-shortcut"
        aria-expanded={helpVisible}
        onClick={() => setHelpVisible(value => !value)}
        title="打开猫咪操作指南"
      >
        <kbd>Shift</kbd><span>+</span><kbd>H</kbd><span>猫咪指南</span>
      </button>
      <div ref={stageRef} className="cp-stage">
        {bubble && <div className="cp-bubble">{bubble}</div>}
        <div ref={spriteRef} className="cp-sprite" />
        <span ref={shadowRef} className="cp-shadow" />
      </div>
      {helpVisible && (
        <div className="cp-help">
          <div className="cp-help-title">🐾 试玩测试键（按住 Shift）</div>
          <code>W</code> 巡逻　<code>R</code> 奔跑　<code>J</code> 跳跃　<code>P</code> 随机待机　<code>C</code> 炫技连招
          <div className="cp-help-row"><code>1 ~ 8</code> 逐一预览精灵图动作行（0-3/5-7/9 行为不同动作）</div>
          <div className="cp-help-row">点击 = 猫叫 + 随机动作；落地 = 随机动作；<b>长按猫</b> = 炫技连招；拖动可摆放</div>
        </div>
      )}
    </div>
  );
}
