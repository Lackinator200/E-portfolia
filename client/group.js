/* GLOBAL STATE */
const isLeader = true;
const groupId = "group_alpha";
const currentUser = "Waseem";
const GRID = 20;

/* MEMBERS */
const members = [
  { name: "Waseem", points: 8, leader: true },
  { name: "Alex", points: 1, leader: false }
];

/* ===================== MEMBERS ===================== */
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


/* ===================== CHAT ===================== */
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
    btn.className = "tab-button";
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
    div.className = "msg";
    div.textContent = `${msg.user}: ${msg.text}`;
    chatArea.appendChild(div);
  });
  chatArea.scrollTop = chatArea.scrollHeight;
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


/* ===================== PORTFOLIO ===================== */
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

/* ===================== CALENDAR ===================== */
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


/* ===================== LAYOUT ===================== */
const portfolioBox = document.getElementById("portfolioBox");
const widthControl = document.getElementById("widthControl");
const heightControl = document.getElementById("heightControl");
const layoutPanel = document.getElementById("layoutPanel");
const togglePanel = document.getElementById("togglePanel");
const editToggle = document.getElementById("editToggle");

let editMode = false;
let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

if (!isLeader) layoutPanel.style.display = "none";

function saveLayout() {
  localStorage.setItem(
    `layout_${groupId}`,
    JSON.stringify({
      width: portfolioBox.style.width,
      height: portfolioBox.style.height,
      left: portfolioBox.style.left,
      top: portfolioBox.style.top,
      position: portfolioBox.style.position
    })
  );
}

function loadLayout() {
  const data = JSON.parse(localStorage.getItem(`layout_${groupId}`));
  if (data) Object.assign(portfolioBox.style, data);
}
loadLayout();

editToggle.onclick = () => {
  editMode = !editMode;
  editToggle.textContent = editMode ? "Done" : "Edit";
};

togglePanel.onclick = () => {
  layoutPanel.classList.toggle("collapsed");
};

portfolioBox.querySelector(".box-header").onmousedown = e => {
  if (!editMode || !isLeader) return;
  dragTarget = portfolioBox;
  offsetX = e.clientX - portfolioBox.offsetLeft;
  offsetY = e.clientY - portfolioBox.offsetTop;
}