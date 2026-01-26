const isLeader = true; // connect to real auth later

const panel = document.getElementById("layoutPanel");
const toggleBtn = document.getElementById("togglePanel");
const widthControl = document.getElementById("widthControl");
const heightControl = document.getElementById("heightControl");

// ONLY portfolio box
const portfolioBox = document.querySelector('.box[data-type="portfolio"]');

// Leader-only access
if (!isLeader) {
  panel.style.display = "none";
}

// Collapse toggle
toggleBtn.addEventListener("click", () => {
  panel.classList.toggle("collapsed");
  toggleBtn.textContent = panel.classList.contains("collapsed") ? "▲" : "▼";
});

// Initialize sliders
widthControl.value = portfolioBox.offsetWidth;
heightControl.value = portfolioBox.offsetHeight;

// Resize logic
widthControl.addEventListener("input", () => {
  portfolioBox.style.width = widthControl.value + "px";
});

heightControl.addEventListener("input", () => {
  portfolioBox.style.height = heightControl.value + "px";
});

/* Drag support (desktop + touch) */
let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

const header = portfolioBox.querySelector(".box-header");

header.addEventListener("mousedown", startDrag);
header.addEventListener("touchstart", startDrag, { passive: true });

function startDrag(e) {
  dragTarget = portfolioBox;
  const point = e.touches ? e.touches[0] : e;
  offsetX = point.clientX - dragTarget.offsetLeft;
  offsetY = point.clientY - dragTarget.offsetTop;
}

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag, { passive: true });

function drag(e) {
  if (!dragTarget) return;
  const point = e.touches ? e.touches[0] : e;

  dragTarget.style.position = "absolute";
  dragTarget.style.left = point.clientX - offsetX + "px";
  dragTarget.style.top = point.clientY - offsetY + "px";
}

document.addEventListener("mouseup", stopDrag);
document.addEventListener("touchend", stopDrag);

function stopDrag() {
  dragTarget = null;
}
