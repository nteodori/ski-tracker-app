/**
 * Ambient Falling Snow Canvas Animation
 * Lightweight particle system with variable depth, drift, and wind dynamics.
 */

export function initSnowCanvas(canvasId = "snow-canvas") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let flakes = [];
  const flakeCount = 75;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createFlake() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 0.8,
      density: Math.random() * flakeCount,
      speedY: Math.random() * 1.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.6 + 0.2
    };
  }

  function initFlakes() {
    flakes = [];
    for (let i = 0; i < flakeCount; i++) {
      flakes.push(createFlake());
    }
  }

  let angle = 0;
  function update() {
    angle += 0.005;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y += f.speedY;
      f.x += Math.sin(angle + f.density) * 0.5 + f.speedX;

      // Wrap around screen
      if (f.y > height) {
        flakes[i] = {
          ...createFlake(),
          y: -5
        };
      }
      if (f.x > width) f.x = 0;
      if (f.x < 0) f.x = width;

      // Draw flake
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = `rgba(220, 240, 255, ${f.opacity})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(160, 215, 255, 0.4)";
      ctx.fill();
    }

    requestAnimationFrame(update);
  }

  window.addEventListener("resize", resize);
  resize();
  initFlakes();
  requestAnimationFrame(update);
}
