const timeElement = document.querySelector("[data-local-time]");
const navLinks = Array.from(document.querySelectorAll(".nav-links a, .dock a[href^='#']"));
const photoOpen = document.querySelector("[data-photo-open]");
const photoDialog = document.querySelector("[data-photo-dialog]");
const photoClose = document.querySelector("[data-photo-close]");
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateLocalTime() {
  if (!timeElement) {
    return;
  }

  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  timeElement.textContent = time;
  timeElement.setAttribute("datetime", now.toISOString());
}

function updateActiveLinks() {
  const current = sections
    .slice()
    .reverse()
    .find((section) => section.getBoundingClientRect().top <= 120);

  navLinks.forEach((link) => {
    const target = link.getAttribute("href");
    link.classList.toggle("is-active", Boolean(current?.id && target === `#${current.id}`));
  });
}

function revealSections() {
  const animated = document.querySelectorAll(".content-section, .contact-section, .summary");

  if (!("IntersectionObserver" in window)) {
    animated.forEach((node) => node.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  animated.forEach((node) => observer.observe(node));
}

function openPhotoDialog() {
  if (!photoDialog) {
    return;
  }

  if (typeof photoDialog.showModal === "function") {
    photoDialog.showModal();
  } else {
    photoDialog.setAttribute("open", "");
  }
}

function closePhotoDialog() {
  if (!photoDialog) {
    return;
  }

  if (typeof photoDialog.close === "function" && photoDialog.open) {
    photoDialog.close();
  } else {
    photoDialog.removeAttribute("open");
  }
}

photoOpen?.addEventListener("click", openPhotoDialog);
photoClose?.addEventListener("click", closePhotoDialog);

photoDialog?.addEventListener("click", (event) => {
  if (event.target === photoDialog) {
    closePhotoDialog();
  }
});

updateLocalTime();
updateActiveLinks();
revealSections();

setInterval(updateLocalTime, 1000);
window.addEventListener("scroll", updateActiveLinks, { passive: true });
