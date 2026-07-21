const timeElement = document.querySelector("[data-local-time]");
const header = document.querySelector(".site-header");
const navLinks = Array.from(document.querySelectorAll(".main-nav a"));
const revealElements = document.querySelectorAll(".reveal");
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

function updateLocalTime() {
  if (!timeElement) return;
  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  timeElement.textContent = `IND ${time}`;
  timeElement.setAttribute("datetime", now.toISOString());
}

function updatePageState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  const current = sections.slice().reverse().find((section) => section.getBoundingClientRect().top <= 180);
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", Boolean(current?.id && link.getAttribute("href") === `#${current.id}`));
  });
}

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const marqueeTrack = document.querySelector(".tool-marquee > div");
if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

function createNetworkOrb() {
  const canvas = document.querySelector("#network-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  const orbitalFigure = document.querySelector(".orbital-figure");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staticPreview = new URLSearchParams(window.location.search).has("qa");
  const motionDisabled = prefersReducedMotion || staticPreview;
  const pointCount = window.innerWidth < 700 ? 52 : 76;
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  let width = 0;
  let height = 0;
  let baseCenterX = 0;
  let baseCenterY = 0;
  let centerX = 0;
  let centerY = 0;
  let radius = 0;
  let rotationY = -0.55;
  let rotationX = 0.15;
  let targetX = 0;
  let targetY = 0;
  let animationFrame = 0;
  let lastFrame = 0;
  let scrollX = 0;
  let scrollY = 0;
  let scrollRotation = 0;
  let targetScrollX = 0;
  let targetScrollY = 0;
  let targetScrollRotation = 0;
  let scrollVelocity = 0;
  let lastScrollPosition = window.scrollY;

  for (let index = 0; index < pointCount; index += 1) {
    const y = 1 - (index / (pointCount - 1)) * 2;
    const localRadius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    points.push({
      x: Math.cos(angle) * localRadius,
      y,
      z: Math.sin(angle) * localRadius,
      phase: (index % 11) / 11,
    });
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.35);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    radius = Math.min(width, height) * (width < 700 ? 0.34 : 0.48);
    baseCenterX = width < 700 ? width * 0.64 : width * 0.69;
    baseCenterY = width < 700 ? height * 0.39 : height * 0.43;
    centerX = baseCenterX + scrollX;
    centerY = baseCenterY + scrollY;
  }

  function rotatePoint(point) {
    const scrollRotationRadians = scrollRotation * (Math.PI / 180);
    const cosY = Math.cos(rotationY + scrollRotationRadians);
    const sinY = Math.sin(rotationY + scrollRotationRadians);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const x1 = point.x * cosY - point.z * sinY;
    const z1 = point.x * sinY + point.z * cosY;
    const y1 = point.y * cosX - z1 * sinX;
    const z2 = point.y * sinX + z1 * cosX;
    const depth = 2.8 + z2;
    const scale = 2.8 / depth;
    return {
      x: centerX + x1 * radius * scale,
      y: centerY + y1 * radius * scale,
      z: z2,
      scale,
      alpha: Math.max(0.12, Math.min(1, (z2 + 1.15) / 2.15)),
      phase: point.phase,
    };
  }

  function draw(timestamp = 0) {
    if (!motionDisabled && timestamp - lastFrame < 32) {
      animationFrame = requestAnimationFrame(draw);
      return;
    }
    lastFrame = timestamp;
    scrollX += (targetScrollX - scrollX) * 0.06;
    scrollY += (targetScrollY - scrollY) * 0.06;
    scrollRotation += (targetScrollRotation - scrollRotation) * 0.06;
    scrollVelocity *= 0.86;
    centerX = baseCenterX + scrollX;
    centerY = baseCenterY + scrollY;
    orbitalFigure?.style.setProperty("--orb-scroll-x", `${scrollX.toFixed(2)}px`);
    orbitalFigure?.style.setProperty("--orb-scroll-y", `${scrollY.toFixed(2)}px`);
    orbitalFigure?.style.setProperty("--orb-scroll-rotation", `${scrollRotation.toFixed(2)}deg`);
    context.clearRect(0, 0, width, height);
    rotationX += (targetY - rotationX) * 0.025;
    rotationY += (targetX - rotationY) * 0.025;
    if (!motionDisabled) rotationY += 0.0012;
    rotationY += scrollVelocity * 0.006;

    const projected = points.map(rotatePoint);

    const sphereGlow = context.createRadialGradient(centerX, centerY, radius * 0.08, centerX, centerY, radius * 1.08);
    sphereGlow.addColorStop(0, "rgba(255, 103, 61, 0.055)");
    sphereGlow.addColorStop(0.58, "rgba(255, 103, 61, 0.022)");
    sphereGlow.addColorStop(0.94, "rgba(8, 9, 10, 0)");
    context.fillStyle = sphereGlow;
    context.beginPath();
    context.arc(centerX, centerY, radius * 1.08, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(centerX, centerY);
    context.strokeStyle = "rgba(238, 238, 233, 0.16)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([5, 14]);
    context.strokeStyle = "rgba(255, 103, 61, 0.2)";
    context.beginPath();
    context.ellipse(0, 0, radius * 1.12, radius * 0.34, -0.35, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    context.restore();

    context.lineWidth = 0.7;
    for (let a = 0; a < projected.length; a += 1) {
      for (let b = a + 1; b < projected.length; b += 1) {
        const dx = projected[a].x - projected[b].x;
        const dy = projected[a].y - projected[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const threshold = radius * 0.34;
        if (distance < threshold && projected[a].z > -0.55 && projected[b].z > -0.55) {
          const opacity = (1 - distance / threshold) * Math.min(projected[a].alpha, projected[b].alpha) * 0.42;
          context.strokeStyle = `rgba(225, 230, 224, ${opacity})`;
          context.beginPath();
          context.moveTo(projected[a].x, projected[a].y);
          context.lineTo(projected[b].x, projected[b].y);
          context.stroke();
        }
      }
    }

    projected.sort((a, b) => a.z - b.z).forEach((point, index) => {
      const pulse = motionDisabled ? 1 : 0.78 + Math.sin(timestamp * 0.0017 + point.phase * 8) * 0.22;
      const size = Math.max(1.4, 2.8 * point.scale * pulse);
      const isAccent = index % 17 === 0;
      context.fillStyle = isAccent
        ? `rgba(255, 103, 61, ${Math.min(1, point.alpha + 0.28)})`
        : `rgba(238, 238, 233, ${point.alpha * 0.82})`;
      context.beginPath();
      context.arc(point.x, point.y, isAccent ? size * 1.7 : size, 0, Math.PI * 2);
      context.fill();
    });

    if (!motionDisabled && !document.hidden) animationFrame = requestAnimationFrame(draw);
  }

  function handlePointer(event) {
    targetX = -0.55 + (event.clientX / width - 0.5) * 0.45;
    targetY = 0.15 + (event.clientY / height - 0.5) * 0.28;
  }

  function handleScroll() {
    const currentScrollPosition = window.scrollY;
    const scrollDelta = currentScrollPosition - lastScrollPosition;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
    const scrollProgress = Math.min(1, Math.max(0, currentScrollPosition / maxScroll));
    lastScrollPosition = currentScrollPosition;

    targetScrollX = scrollProgress * Math.min(width * 0.035, 42);
    targetScrollY = scrollProgress * Math.min(height * 0.12, 90);
    targetScrollRotation = scrollProgress * 16;
    scrollVelocity = Math.max(-1, Math.min(1, scrollVelocity + scrollDelta * 0.004));
  }

  function handleVisibility() {
    cancelAnimationFrame(animationFrame);
    if (!document.hidden && !motionDisabled) animationFrame = requestAnimationFrame(draw);
  }

  resize();
  if (!motionDisabled) handleScroll();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", handlePointer, { passive: true });
  if (!motionDisabled) window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
}

updateLocalTime();
updatePageState();
createNetworkOrb();

setInterval(updateLocalTime, 1000);
window.addEventListener("scroll", updatePageState, { passive: true });
