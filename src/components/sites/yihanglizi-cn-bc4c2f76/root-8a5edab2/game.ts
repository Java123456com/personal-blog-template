type Direction = "left" | "right" | "up" | "down";

type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  element: HTMLDivElement;
};

const SCOPE = "data-v-5c7e5b93";
const BEST_KEY = "personal-blog-cyber2048-best";
const MOVE_DURATION = 130;

function savedBest(): number {
  try {
    const value = Number(window.localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number): void {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // The game still works when storage is disabled.
  }
}

function createTile(value: number, row: number, col: number): Tile {
  const element = document.createElement("div");
  const inner = document.createElement("div");
  element.className = "c2048-tile";
  element.setAttribute(SCOPE, "");
  inner.className = `c2048-tile-inner t${value} is-new`;
  inner.setAttribute(SCOPE, "");
  inner.textContent = String(value);
  element.appendChild(inner);
  const tile: Tile = { id: 0, value, row, col, element };
  positionTile(tile);
  return tile;
}

function positionTile(tile: Tile): void {
  tile.element.dataset.row = String(tile.row);
  tile.element.dataset.col = String(tile.col);
  tile.element.style.left = `${tile.col * 25}%`;
  tile.element.style.top = `${tile.row * 25}%`;
}

function gameKey(key: string): Direction | null {
  switch (key) {
    case "ArrowLeft": case "a": case "A": return "left";
    case "ArrowRight": case "d": case "D": return "right";
    case "ArrowUp": case "w": case "W": return "up";
    case "ArrowDown": case "s": case "S": return "down";
    default: return null;
  }
}

function shouldIgnoreKey(target: EventTarget | null): boolean {
  if (target instanceof HTMLElement) {
    if (target.isContentEditable || target.closest("input, textarea, select, [contenteditable], [role='textbox']")) return true;
  }
  return Boolean(document.querySelector("[role='dialog'][aria-modal='true'], .VPLocalSearchBox, .VPNavScreen:not([style*='display: none'])"));
}

/** Turns the captured CYBER_2048 markup into a playable game. */
export function enhanceGame(root: HTMLElement): () => void {
  const game = root.matches(".cyber2048") ? root : root.querySelector<HTMLElement>(".cyber2048");
  const board = game?.querySelector<HTMLElement>(".c2048-board") as HTMLElement;
  if (!game || !board) return () => {};

  const statValues = Array.from(game.querySelectorAll<HTMLElement>(".c2048-stat-v"));
  const scoreValue = game.querySelector<HTMLElement>(".c2048-stat-v.gold") ?? statValues[0];
  const bestValue = statValues.find((value) => value !== scoreValue);
  let tiles: Tile[] = [];
  let nextId = 1;
  let score = 0;
  let best = savedBest();
  let busy = false;
  let ended = false;
  let touchStart: { x: number; y: number } | null = null;
  let moveTimer: number | undefined;
  let effectTimer: number | undefined;

  // The captured markup contains two decorative starting tiles. The game owns
  // all tile nodes from this point on; the background grid and scan remain.
  board.querySelectorAll(".c2048-tile, .c2048-overlay").forEach((node) => node.remove());

  function updateStats(pop = false): void {
    if (scoreValue) {
      scoreValue.textContent = String(score);
      if (pop) {
        scoreValue.classList.remove("pop");
        void scoreValue.offsetWidth;
        scoreValue.classList.add("pop");
      }
    }
    if (bestValue) bestValue.textContent = String(best);
  }

  function clearEffects(): void {
    board.classList.remove("is-flash", "is-shake");
    for (const tile of tiles) {
      tile.element.querySelector(".c2048-tile-inner")?.classList.remove("is-new", "is-merged");
    }
  }

  function spawn(): void {
    const empty: Array<[number, number]> = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!tiles.some((tile) => tile.row === row && tile.col === col)) empty.push([row, col]);
      }
    }
    if (!empty.length) return;
    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    const tile = createTile(Math.random() < 0.9 ? 2 : 4, row, col);
    tile.id = nextId++;
    tiles.push(tile);
    board.appendChild(tile.element);
  }

  function hasMoves(): boolean {
    if (tiles.length < 16) return true;
    return tiles.some((tile) => tiles.some((other) =>
      other !== tile && other.value === tile.value &&
      Math.abs(other.row - tile.row) + Math.abs(other.col - tile.col) === 1,
    ));
  }

  function showResult(won: boolean): void {
    ended = true;
    const overlay = document.createElement("div");
    overlay.className = "c2048-overlay";
    overlay.setAttribute(SCOPE, "");
    const title = document.createElement("div");
    title.className = "c2048-over-title";
    title.setAttribute(SCOPE, "");
    title.textContent = won ? "2048 // YOU WIN" : "GAME OVER";
    const row = document.createElement("div");
    row.className = "c2048-over-row";
    row.setAttribute(SCOPE, "");
    row.textContent = `SCORE ${score} · BEST ${best}`;
    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "c2048-btn";
    restart.setAttribute(SCOPE, "");
    restart.textContent = "RESTART";
    restart.addEventListener("click", reset);
    overlay.append(title, row, restart);
    board.appendChild(overlay);
  }

  function reset(): void {
    if (moveTimer !== undefined) window.clearTimeout(moveTimer);
    if (effectTimer !== undefined) window.clearTimeout(effectTimer);
    moveTimer = undefined;
    effectTimer = undefined;
    tiles.forEach((tile) => tile.element.remove());
    tiles = [];
    board.querySelector(".c2048-overlay")?.remove();
    board.classList.remove("is-flash", "is-shake");
    scoreValue?.classList.remove("pop");
    score = 0;
    busy = false;
    ended = false;
    updateStats();
    spawn();
    spawn();
  }

  function move(direction: Direction): void {
    if (busy || ended) return;
    clearEffects();
    const removed = new Set<Tile>();
    const merged = new Set<Tile>();
    let changed = false;
    let gained = 0;

    for (let line = 0; line < 4; line++) {
      const inLine = tiles.filter((tile) =>
        direction === "left" || direction === "right" ? tile.row === line : tile.col === line,
      );
      inLine.sort((a, b) => {
        if (direction === "left") return a.col - b.col;
        if (direction === "right") return b.col - a.col;
        if (direction === "up") return a.row - b.row;
        return b.row - a.row;
      });
      const settled: Tile[] = [];
      for (const tile of inLine) {
        const previous = settled[settled.length - 1];
        if (previous && previous.value === tile.value && !merged.has(previous)) {
          const oldRow = tile.row;
          const oldCol = tile.col;
          tile.row = previous.row;
          tile.col = previous.col;
          if (oldRow !== tile.row || oldCol !== tile.col) changed = true;
          positionTile(tile);
          removed.add(tile);
          merged.add(previous);
          previous.value *= 2;
          gained += previous.value;
          changed = true;
          continue;
        }
        const index = settled.length;
        const nextRow = direction === "up" ? index : direction === "down" ? 3 - index : line;
        const nextCol = direction === "left" ? index : direction === "right" ? 3 - index : line;
        if (tile.row !== nextRow || tile.col !== nextCol) changed = true;
        tile.row = nextRow;
        tile.col = nextCol;
        positionTile(tile);
        settled.push(tile);
      }
    }

    if (!changed) {
      board.classList.remove("is-shake");
      void board.offsetWidth;
      board.classList.add("is-shake");
      return;
    }
    busy = true;
    if (gained) {
      score += gained;
      if (score > best) {
        best = score;
        saveBest(best);
      }
      updateStats(true);
      board.classList.add("is-flash");
    }
    moveTimer = window.setTimeout(() => {
      removed.forEach((tile) => tile.element.remove());
      tiles = tiles.filter((tile) => !removed.has(tile));
      merged.forEach((tile) => {
        const inner = tile.element.querySelector<HTMLElement>(".c2048-tile-inner");
        if (inner) {
          inner.className = `c2048-tile-inner t${tile.value} is-merged`;
          inner.textContent = String(tile.value);
        }
      });
      spawn();
      busy = false;
      moveTimer = undefined;
      if (tiles.some((tile) => tile.value >= 2048)) showResult(true);
      else if (!hasMoves()) showResult(false);
      effectTimer = window.setTimeout(clearEffects, 320);
    }, MOVE_DURATION);
  }

  function onKeyDown(event: KeyboardEvent): void {
    const direction = gameKey(event.key);
    if (!direction || event.altKey || event.ctrlKey || event.metaKey || shouldIgnoreKey(event.target)) return;
    event.preventDefault();
    move(direction);
  }

  function onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  function onTouchEnd(event: TouchEvent): void {
    if (!touchStart || !event.changedTouches.length) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 25) return;
    event.preventDefault();
    move(Math.abs(deltaX) > Math.abs(deltaY)
      ? deltaX > 0 ? "right" : "left"
      : deltaY > 0 ? "down" : "up");
  }

  function onTouchCancel(): void {
    touchStart = null;
  }

  const originalTouchAction = board.style.touchAction;
  board.style.touchAction = "none";
  const knight = game.querySelector<HTMLElement>(".knight");
  const placeKnight = () => {
    if (!knight) return;
    knight.style.left = `${board.offsetWidth + 12}px`;
    knight.style.top = `${Math.max(0, board.offsetHeight - 90)}px`;
  };
  placeKnight();
  const knightObserver = new ResizeObserver(placeKnight);
  knightObserver.observe(board);
  window.addEventListener("keydown", onKeyDown);
  board.addEventListener("touchstart", onTouchStart, { passive: true });
  board.addEventListener("touchend", onTouchEnd, { passive: false });
  board.addEventListener("touchcancel", onTouchCancel);
  reset();

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    board.removeEventListener("touchstart", onTouchStart);
    board.removeEventListener("touchend", onTouchEnd);
    board.removeEventListener("touchcancel", onTouchCancel);
    board.style.touchAction = originalTouchAction;
    knightObserver.disconnect();
    if (moveTimer !== undefined) window.clearTimeout(moveTimer);
    if (effectTimer !== undefined) window.clearTimeout(effectTimer);
    board.querySelector(".c2048-overlay")?.remove();
  };
}
