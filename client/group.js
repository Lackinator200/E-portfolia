const GRID_SIZE = 20;

const isLeader = true;
const groupId = "group_alpha";
const currentUser = "Waseem";

let members = [
  { name: "Waseem", points: 8, leader: true },
  { name: "Alex", points: 1, leader: false }
];


const panel = document.getElementById("layoutPanel");
const toggleBtn = document.getElementById("togglePanel");
const widthControl = document.getElementById("widthControl");
const heightControl = document.getElementById("heightControl");

// ONLY portfolio box
const portfolioBox = document.querySelector('.box[data-type="portfolio"]');

// Leader-only access
if (!isLeader) {
  panel.style.display = "none";
  portfolioBox.style.resize = "none";
}


function startDrag(e) {
  if (!isLeader || !editMode) return;

  dragTarget = portfolioBox;
  const point = e.touches ? e.touches[0] : e;
  offsetX = point.clientX - dragTarget.offsetLeft;
  offsetY = point.clientY - dragTarget.offsetTop;
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

function snap(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function drag(e) {
  if (!dragTarget || !editMode) return;

  const point = e.touches ? e.touches[0] : e;

  const x = snap(point.clientX - offsetX);
  const y = snap(point.clientY - offsetY);

  dragTarget.style.position = "absolute";
  dragTarget.style.left = x + "px";
  dragTarget.style.top = y + "px";
}

function stopDrag() {
  if (dragTarget) saveLayout();
  dragTarget = null;
}

const chatArea = document.getElementById("chatArea");
const chatInput = document.getElementById("chatInput");
const tabsContainer = document.querySelector(".tabs");

let currentChat = "group";

// Create user tabs
members.forEach(m => {
  if (m.name !== currentUser) {
    const btn = document.createElement("button");
    btn.textContent = m.name;
    btn.dataset.chat = m.name;
    tabsContainer.appendChild(btn);
  }
});

// Load messages
function loadChat(chatId) {
  chatArea.innerHTML = "";
  const messages = JSON.parse(
    localStorage.getItem(`chat_${groupId}_${chatId}`) || "[]"
  );

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.textContent = `${msg.user}: ${msg.text}`;
    chatArea.appendChild(div);
  });
}

loadChat("group");

// Switch tabs
tabsContainer.addEventListener("click", e => {
  if (!e.target.dataset.chat) return;

  document.querySelectorAll(".tabs button")
    .forEach(b => b.classList.remove("active"));

  e.target.classList.add("active");
  currentChat = e.target.dataset.chat;
  loadChat(currentChat);
});

// Send message
chatInput.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !chatInput.value.trim()) return;

  const msg = {
    user: currentUser,
    text: chatInput.value,
    time: Date.now()
  };

  const key = `chat_${groupId}_${currentChat}`;
  const messages = JSON.parse(localStorage.getItem(key) || "[]");
  messages.push(msg);
  localStorage.setItem(key, JSON.stringify(messages));

  chatInput.value = "";
  loadChat(currentChat);
});

const calendar = document.getElementById("calendar");

function renderCalendar() {
  calendar.innerHTML = "";
  const days = 30;

  for (let i = 1; i <= days; i++) {
    const day = document.createElement("div");
    day.className = "day";
    day.textContent = i;

    day.onclick = () => {
      const event = prompt("Event:");
      if (!event) return;

      const events = JSON.parse(
        localStorage.getItem(`calendar_${groupId}`) || "{}"
      );

      events[i] = event;
      localStorage.setItem(`calendar_${groupId}`, JSON.stringify(events));
      renderCalendar();
    };

    const events = JSON.parse(
      localStorage.getItem(`calendar_${groupId}`) || "{}"
    );

    if (events[i]) {
      const dot = document.createElement("span");
      dot.className = "event-dot";
      day.appendChild(dot);
    }

    calendar.appendChild(day);
  }
}

renderCalendar();

const memberList = document.getElementById("memberList");

function renderMembers() {
  memberList.innerHTML = "";

  members.forEach(m => {
    const div = document.createElement("div");
    div.className = "member";
    div.innerHTML = `
      ${m.name} ${m.leader ? "⭐" : ""}
      <span>${m.points}</span>
    `;
    memberList.appendChild(div);
  });
}

renderMembers();

const upload = document.getElementById("upload");
const feed = document.getElementById("portfolioFeed");

upload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const post = {
      user: currentUser,
      img: reader.result,
      desc: prompt("Description:"),
      time: new Date().toLocaleString()
    };

    const posts = JSON.parse(
      localStorage.getItem(`portfolio_${groupId}`) || "[]"
    );

    posts.unshift(post);
    localStorage.setItem(`portfolio_${groupId}`, JSON.stringify(posts));
    renderPortfolio();
  };
  reader.readAsDataURL(file);
});

function renderPortfolio() {
  feed.innerHTML = "";
  const posts = JSON.parse(
    localStorage.getItem(`portfolio_${groupId}`) || "[]"
  );

  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <strong>${p.user}</strong>
      <img src="${p.img}">
      <p>${p.desc}</p>
      <small>${p.time}</small>
    `;
    feed.appendChild(div);
  });
}

renderPortfolio();


document.addEventListener("mouseup", stopDrag);
document.addEventListener("touchend", stopDrag);

function stopDrag() {
  dragTarget = null;
}

function saveLayout() {
  const layout = {
    width: portfolioBox.style.width,
    height: portfolioBox.style.height,
    left: portfolioBox.style.left,
    top: portfolioBox.style.top,
    position: portfolioBox.style.position
  };

  localStorage.setItem(`layout_${groupId}`, JSON.stringify(layout));
}

function loadLayout() {
  const saved = localStorage.getItem(`layout_${groupId}`);
  if (!saved) return;

  const layout = JSON.parse(saved);
  Object.assign(portfolioBox.style, layout);
}

// Load on start
loadLayout();

let editMode = false;
const editToggle = document.getElementById("editToggle");

editToggle.addEventListener("click", () => {
  editMode = !editMode;
  editToggle.textContent = editMode ? "Done" : "Edit";

  portfolioBox.style.border = editMode
    ? "3px dashed red"
    : "2px solid black";
});

widthControl.addEventListener("change", saveLayout);
heightControl.addEventListener("change", saveLayout);


