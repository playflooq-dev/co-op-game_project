import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BULLET_RADIUS,
  PLAYER_MAX_HP,
  PLAYER_RADIUS,
  REVIVE_RADIUS,
  type GameSnapshot,
  type InputState,
  type ServerMessage,
} from "../shared/protocol.js";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const joinForm = document.getElementById("join") as HTMLFormElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const errorEl = document.getElementById("error")!;

canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;

let socket: WebSocket | null = null;
let myId: string | null = null;
let state: GameSnapshot | null = null;

const input: InputState = { up: false, down: false, left: false, right: false, shooting: false, aim: 0 };
const mouse = { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 };

nameInput.value = localStorageGet("coop-name") ?? "";

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim() || "Player";
  localStorageSet("coop-name", name);
  connect(name);
});

function connect(name: string) {
  errorEl.textContent = "Connecting…";
  const proto = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${proto}://${location.host}/ws`);
  socket.onopen = () => socket!.send(JSON.stringify({ type: "join", name }));
  socket.onmessage = (ev) => {
    const msg: ServerMessage = JSON.parse(ev.data);
    if (msg.type === "welcome") {
      myId = msg.id;
      joinForm.classList.add("hidden");
      errorEl.textContent = "";
    } else if (msg.type === "full") {
      errorEl.textContent = "The game is full (4 players max).";
    } else if (msg.type === "state") {
      state = msg.state;
    }
  };
  socket.onclose = () => {
    if (myId) errorEl.textContent = "Disconnected from server.";
    myId = null;
    state = null;
    joinForm.classList.remove("hidden");
  };
}

// --- Input ---------------------------------------------------------------

const KEYS: Record<string, keyof Omit<InputState, "aim" | "shooting">> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

window.addEventListener("keydown", (e) => {
  if (!myId) return;
  const k = KEYS[e.code];
  if (k) {
    input[k] = true;
    e.preventDefault();
  }
  if ((e.code === "Enter" || e.code === "Space") && (state?.phase === "lobby" || state?.phase === "gameover")) {
    send({ type: "start" });
  }
});
window.addEventListener("keyup", (e) => {
  const k = KEYS[e.code];
  if (k) input[k] = false;
});
window.addEventListener("blur", () => {
  input.up = input.down = input.left = input.right = input.shooting = false;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * ARENA_WIDTH;
  mouse.y = ((e.clientY - rect.top) / rect.height) * ARENA_HEIGHT;
});
canvas.addEventListener("mousedown", () => {
  input.shooting = true;
  if (state?.phase === "lobby" || state?.phase === "gameover") send({ type: "start" });
});
window.addEventListener("mouseup", () => (input.shooting = false));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

function send(msg: object) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(msg));
}

// Send input at a steady rate rather than on every event.
setInterval(() => {
  const me = state?.players.find((p) => p.id === myId);
  if (me) input.aim = Math.atan2(mouse.y - me.y, mouse.x - me.x);
  send({ type: "input", input });
}, 1000 / 30);

// --- Rendering -----------------------------------------------------------

const ENEMY_COLORS = { grunt: "#e57373", runner: "#ffd54f", brute: "#ba68c8" } as const;

function render() {
  ctx.fillStyle = "#171b22";
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  drawGrid();

  if (state) {
    for (const p of state.players) {
      if (p.downed) {
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.setLineDash([6, 6]);
        circle(p.x, p.y, REVIVE_RADIUS, false);
        ctx.setLineDash([]);
      }
    }

    ctx.fillStyle = "#fff59d";
    for (const b of state.bullets) circle(b.x, b.y, BULLET_RADIUS, true);

    for (const e of state.enemies) {
      ctx.fillStyle = ENEMY_COLORS[e.kind];
      circle(e.x, e.y, e.radius, true);
      if (e.hp < e.maxHp) bar(e.x - e.radius, e.y - e.radius - 8, e.radius * 2, e.hp / e.maxHp, "#e57373");
    }

    for (const p of state.players) drawPlayer(p);
    drawHud(state);
  }

  requestAnimationFrame(render);
}

function drawPlayer(p: GameSnapshot["players"][number]) {
  ctx.globalAlpha = p.downed ? 0.45 : 1;
  ctx.fillStyle = p.color;
  circle(p.x, p.y, PLAYER_RADIUS, true);
  if (p.id === myId) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    circle(p.x, p.y, PLAYER_RADIUS + 3, false);
  }
  if (!p.downed) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.aim) * (PLAYER_RADIUS + 10), p.y + Math.sin(p.aim) * (PLAYER_RADIUS + 10));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#e6e6e6";
  ctx.font = "13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(p.downed ? `${p.name} (DOWN)` : p.name, p.x, p.y - PLAYER_RADIUS - 14);
  if (p.downed) bar(p.x - 20, p.y + PLAYER_RADIUS + 6, 40, p.reviveProgress, "#81c784");
  else bar(p.x - 20, p.y + PLAYER_RADIUS + 6, 40, p.hp / PLAYER_MAX_HP, "#4caf50");
}

function drawHud(s: GameSnapshot) {
  ctx.textAlign = "left";
  ctx.font = "bold 20px system-ui";
  ctx.fillStyle = "#e6e6e6";
  ctx.fillText(`Wave ${s.wave}`, 16, 30);
  ctx.font = "14px system-ui";
  s.players.forEach((p, i) => {
    ctx.fillStyle = p.color;
    ctx.fillText(`${p.name}: ${p.score}`, 16, 56 + i * 20);
  });

  ctx.textAlign = "center";
  const mid = (text: string, sub?: string) => {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, ARENA_HEIGHT / 2 - 60, ARENA_WIDTH, sub ? 110 : 80);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px system-ui";
    ctx.fillText(text, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 10);
    if (sub) {
      ctx.font = "18px system-ui";
      ctx.fillText(sub, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 26);
    }
  };
  if (s.phase === "lobby") {
    mid(`${s.players.length}/4 players in lobby`, "Click or press Enter to start when everyone is here");
  } else if (s.phase === "intermission") {
    mid(`Wave ${s.wave + 1} in ${Math.ceil(s.timer)}`);
  } else if (s.phase === "gameover") {
    mid(`Game over — you survived ${Math.max(0, s.wave - 1)} wave(s)`, "Click or press Enter to play again");
  }
}

function drawGrid() {
  ctx.strokeStyle = "#1f2530";
  ctx.lineWidth = 1;
  for (let x = 0; x <= ARENA_WIDTH; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ARENA_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= ARENA_HEIGHT; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ARENA_WIDTH, y);
    ctx.stroke();
  }
}

function circle(x: number, y: number, r: number, fill: boolean) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) ctx.fill();
  else ctx.stroke();
}

function bar(x: number, y: number, w: number, frac: number, color: string) {
  ctx.fillStyle = "#333";
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), 4);
}

function localStorageGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function localStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

requestAnimationFrame(render);
