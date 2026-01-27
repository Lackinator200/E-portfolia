/* GLOBAL STATE */
const isLeader = true;
const groupId = "group_alpha";
const currentUser = "Waseem";
const GRID = 20;

// members
const members = [
  { name: "Waseem", points: 8, leader: true },
  { name: "Alex (sample user)", points: 3, leader: false }
];

// member list
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

// chat box
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


// portfolio
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

// calendar
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


// layout custom
const layoutPanel = document.getElementById("layoutPanel");
const togglePanel = document.getElementById("togglePanel");
const boxSelector = document.getElementById("boxSelector");
const widthControl = document.getElementById("widthControl");
const heightControl = document.getElementById("heightControl");
const widthValue = document.getElementById("widthValue");
const heightValue = document.getElementById("heightValue");
const saveLayoutBtn = document.getElementById("saveLayoutBtn");
const editToggle = document.getElementById("editToggle");

const GRID_SIZE = 20;
let editMode = false;
let selectedBox = null;
let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

// Get all boxes
const boxes = {
  chatBox: document.querySelector('[data-box-id="chatBox"]'),
  membersBox: document.querySelector('[data-box-id="membersBox"]'),
  portfolioBox: document.querySelector('[data-box-id="portfolioBox"]'),
  calendarBox: document.querySelector('[data-box-id="calendarBox"]')
};

// Toggle layout panel
togglePanel.onclick = () => {
  layoutPanel.classList.toggle("collapsed");
};

// Box selection
boxSelector.addEventListener("change", (e) => {
  if (!e.target.value) {
    selectedBox = null;
    widthControl.disabled = true;
    heightControl.disabled = true;
    return;
  }
  
  selectedBox = e.target.value;
  const box = boxes[selectedBox];
  
  widthControl.disabled = false;
  heightControl.disabled = false;
  
  // Get current dimensions
  const width = box.offsetWidth || 400;
  const height = box.offsetHeight || 300;
  
  widthControl.value = width;
  heightControl.value = height;
  widthValue.textContent = width + "px";
  heightValue.textContent = height + "px";
  
  if (editMode) {
    highlightBox(box);
  }
});

// Width control
widthControl.addEventListener("input", (e) => {
  if (!selectedBox) return;
  const box = boxes[selectedBox];
  const width = e.target.value;
  box.style.width = width + "px";
  widthValue.textContent = width + "px";
});

// Height control
heightControl.addEventListener("input", (e) => {
  if (!selectedBox) return;
  const box = boxes[selectedBox];
  const height = e.target.value;
  box.style.height = height + "px";
  heightValue.textContent = height + "px";
});

// Edit mode toggle
editToggle.onclick = () => {
  editMode = !editMode;
  editToggle.textContent = editMode ? "Done Editing" : "Edit Mode";
  editToggle.style.background = editMode ? "#ff6b6b" : "#5096f9";
  
  if (editMode) {
    if (selectedBox) {
      highlightBox(boxes[selectedBox]);
    }
    enableDragging();
  } else {
    disableDragging();
    removeHighlights();
  }
};

function highlightBox(box) {
  removeHighlights();
  box.style.border = "3px dashed #5096f9";
}

function removeHighlights() {
  Object.values(boxes).forEach(box => {
    if (box) box.style.border = "";
  });
}

// Snap to grid function
function snap(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

// Enable dragging for all boxes
function enableDragging() {
  Object.entries(boxes).forEach(([key, box]) => {
    if (!box) return;
    const header = box.querySelector(".box-header");
    if (header) {
      header.style.cursor = "grab";
      header.onmousedown = startDrag;
    }
  });
}

// Disable dragging
function disableDragging() {
  Object.entries(boxes).forEach(([key, box]) => {
    if (!box) return;
    const header = box.querySelector(".box-header");
    if (header) {
      header.style.cursor = "grab";
      header.onmousedown = null;
    }
  });
}

function startDrag(e) {
  if (!editMode) return;
  dragTarget = e.target.closest(".box");
  if (!dragTarget) return;
  
  offsetX = e.clientX - dragTarget.offsetLeft;
  offsetY = e.clientY - dragTarget.offsetTop;
  
  dragTarget.style.position = "absolute";
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);
}

function doDrag(e) {
  if (!dragTarget) return;
  
  const x = snap(e.clientX - offsetX);
  const y = snap(e.clientY - offsetY);
  
  dragTarget.style.left = x + "px";
  dragTarget.style.top = y + "px";
}

function stopDrag() {
  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("mouseup", stopDrag);
  dragTarget = null;
}

// Save layout to localStorage
saveLayoutBtn.onclick = () => {
  const layout = {};
  
  Object.entries(boxes).forEach(([key, box]) => {
    if (box) {
      layout[key] = {
        width: box.style.width || box.offsetWidth,
        height: box.style.height || box.offsetHeight,
        left: box.style.left || "",
        top: box.style.top || "",
        position: box.style.position || "relative"
      };
    }
  });
  
  localStorage.setItem(`layout_${groupId}`, JSON.stringify(layout));
  alert("Layout saved successfully!");
};

// Load layout from localStorage
function loadLayout() {
  const savedLayout = localStorage.getItem(`layout_${groupId}`);
  if (!savedLayout) return;
  
  const layout = JSON.parse(savedLayout);
  
  Object.entries(layout).forEach(([key, styles]) => {
    const box = boxes[key];
    if (box) {
      Object.assign(box.style, styles);
    }
  });
}

// Initialize
widthControl.disabled = true;
heightControl.disabled = true;
loadLayout();
