const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d", { alpha: false }); // Otimização de renderização (sem transparência no canvas pai)

// Cache de dimensões
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const letters =
  "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const fontSize = 16;
let columns = Math.floor(width / fontSize);
let drops = new Float32Array(columns).fill(1); // TypedArray é mais rápido que Array comum

let mouse = { x: -1000, y: -1000 };
const radiusSq = 120 * 120; // 120 ao quadrado para evitar Math.sqrt

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function draw() {
  // Fundo com rastro
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, width, height);

  ctx.font = fontSize + "px monospace";

  // Preparamos a cor padrão para evitar trocas desnecessárias no loop inicial
  ctx.fillStyle = "#0F0";

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    const dx = mouse.x - x;
    const dy = mouse.y - y;
    const distSq = dx * dx + dy * dy;

    // Só altera a cor se estiver perto do mouse, economizando CPU
    if (distSq < radiusSq) {
      ctx.fillStyle = "#8aff8a";
      ctx.fillText(text, x, y);
      ctx.fillStyle = "#0F0"; // Volta para o verde padrão
    } else {
      ctx.fillText(text, x, y);
    }

    if (y > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

// Controle de FPS manual dentro do requestAnimationFrame (para manter os ~150ms)
let lastTime = 0;
function animate(time) {
  if (time - lastTime > 100) {
    // Aproximadamente 10 FPS como no seu original
    draw();
    lastTime = time;
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
