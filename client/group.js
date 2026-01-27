// client/scripts/group.js
(async () => {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "/index.html"; return; }

  // get group from query param ?group=group_alpha
  const params = new URLSearchParams(location.search);
  const groupId = params.get("group") || "group_alpha";

  // helper for auth header
  function authHeaders() { return { "Authorization": "Bearer " + token, "Content-Type": "application/json" }; }

  // fetch user info quickly via token decode (we didn't make /me route; decode client-side is ok for demo)
  // Light decode of JWT payload: split and parse base64
  function decodeToken(t) {
    try {
      const pl = t.split(".")[1];
      return JSON.parse(atob(pl));
    } catch { return {}; }
  }
  const me = decodeToken(token);
  document.getElementById("userInfo").textContent = me.name + " (" + me.role + ")";

  // initialize socket
  initSocket(token, groupId, handleSocketMessage);

  // load members list
  const mres = await fetch(`/api/group/${groupId}/members`, { headers: { Authorization: "Bearer " + token }});
  const mjson = await mres.json();
  const members = mjson.members || [];
  renderMembers(members);

  // load portfolio
  const pres = await fetch(`/api/group/${groupId}/portfolio`, { headers: { Authorization: "Bearer " + token }});
  const pjson = await pres.json();
  renderPortfolio(pjson.portfolio || []);

  // load calendar
  const cres = await fetch(`/api/group/${groupId}/calendar`, { headers: { Authorization: "Bearer " + token }});
  const cjson = await cres.json();
  renderCalendar(cjson.calendar || {});

  // layout: load saved layout and apply
  const lres = await fetch(`/api/group/${groupId}/layout`, { headers: { Authorization: "Bearer " + token }});
  const ljson = await lres.json();
  if (ljson.layout) applyLayout(ljson.layout);

  // CHAT
  const chatArea = document.getElementById("chatArea");
  const chatInput = document.getElementById("chatInput");
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && chatInput.value.trim()) {
      sendChat(chatInput.value.trim());
      chatInput.value = "";
    }
  });

  function handleSocketMessage(data) {
    if (data.type === "chat") {
      const d = document.createElement("div");
      d.className = "msg";
      d.textContent = `${data.user}: ${data.text}`;
      chatArea.appendChild(d);
      chatArea.scrollTop = chatArea.scrollHeight;
    } else if (data.type === "joined") {
      const d = document.createElement("div");
      d.className = "msg";
      d.textContent = `→ ${data.user} joined`;
      chatArea.appendChild(d);
    }
  }

  // render members
  function renderMembers(list) {
    const el = document.getElementById("memberList");
    el.innerHTML = "";
    list.forEach(m => {
      const d = document.createElement("div");
      d.textContent = `${m.name} ${m.role === "LEADER" ? "⭐" : ""} — ${m.perms ? m.perms.join(",") : ""}`;
      el.appendChild(d);
    });
  }

  // portfolio upload
  const uploadBtn = document.getElementById("uploadBtn");
  const upload = document.getElementById("upload");
  const feed = document.getElementById("portfolioFeed");
  uploadBtn.addEventListener("click", () => upload.click());
  upload.addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const post = { user: me.name, imgDataUrl: reader.result, desc: prompt("Description?") || "", time: Date.now() };
      await fetch(`/api/group/${groupId}/portfolio`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ post })
      });
      // prepend locally
      renderPortfolio([post, ...Array.from(feed.querySelectorAll(".post")).map(p=>p)]);
      // reload from server ideally, but this quick path is fine
    };
    reader.readAsDataURL(file);
  });

  function renderPortfolio(list) {
    feed.innerHTML = "";
    list.forEach(p => {
      const d = document.createElement("div");
      d.className = "post";
      d.innerHTML = `<strong>${p.user}</strong><div><img src="${p.imgDataUrl}"></div><p>${p.desc}</p><small>${new Date(p.time).toLocaleString()}</small>`;
      feed.appendChild(d);
    });
  }

  // calendar UI (simple 1..30 days)
  function renderCalendar(calendarObj) {
    const cal = document.getElementById("calendar");
    cal.innerHTML = "";
    for (let i=1;i<=30;i++){
      const day = document.createElement("div");
      day.className = "day";
      day.dataset.day = i;
      day.innerHTML = `<strong>${i}</strong>`;
      const events = calendarObj[i] || [];
      events.forEach(ev=> {
        const span = document.createElement("div");
        span.className = "event";
        span.textContent = ev.text + " — " + ev.user;
        day.appendChild(span);
      });
      day.addEventListener("click", async () => {
        // check permission (quick client-side check)
        if (!me.perms || !me.perms.includes("calendar")) return alert("No permission");
        const text = prompt("Event text:");
        if (!text) return;
        await fetch(`/api/group/${groupId}/calendar`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ dayKey: i, text })
        });
        // simple reload
        const r = await fetch(`/api/group/${groupId}/calendar`, { headers: authHeaders() });
        const j = await r.json();
        renderCalendar(j.calendar || {});
      });
      cal.appendChild(day);
    }
  }

  // Layout control (portfolio-only as requested)
  const portfolioBox = document.getElementById("portfolioBox");
  const layoutPanel = document.getElementById("layoutPanel");
  const togglePanel = document.getElementById("togglePanel");
  const editToggle = document.getElementById("editToggle");
  const widthControl = document.getElementById("widthControl");
  const heightControl = document.getElementById("heightControl");
  const saveLayoutBtn = document.getElementById("saveLayout");
  let editMode = false;
  let GRID = 20;

  togglePanel.addEventListener("click", () => layoutPanel.classList.toggle("collapsed"));
  editToggle.addEventListener("click", () => {
    editMode = !editMode;
    editToggle.textContent = editMode ? "Done" : "Edit";
    portfolioBox.style.border = editMode ? "2px dashed red" : "";
  });

  widthControl.addEventListener("input", () => portfolioBox.style.width = widthControl.value + "px");
  heightControl.addEventListener("input", () => portfolioBox.style.height = heightControl.value + "px");

  saveLayoutBtn.addEventListener("click", async () => {
    const layout = { width: portfolioBox.style.width, height: portfolioBox.style.height, left: portfolioBox.style.left || "", top: portfolioBox.style.top || "" };
    await fetch(`/api/group/${groupId}/layout`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ layout })
    });
    alert("Layout saved");
  });

  // drag (snap grid)
  let dragTarget = null, offsetX = 0, offsetY = 0;
  portfolioBox.querySelector(".box-header").addEventListener("mousedown", startDrag);
  portfolioBox.querySelector(".box-header").addEventListener("touchstart", startDrag, {passive:true});
  function startDrag(e) {
    if (!editMode || !(me.perms && me.perms.includes("layout"))) return;
    dragTarget = portfolioBox;
    const p = e.touches ? e.touches[0] : e;
    offsetX = p.clientX - (dragTarget.offsetLeft || 0);
    offsetY = p.clientY - (dragTarget.offsetTop || 0);
    dragTarget.style.position = "absolute";
  }
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("touchmove", doDrag, {passive:true});
  function snap(v){ return Math.round(v/GRID)*GRID; }
  function doDrag(e) {
    if (!dragTarget) return;
    const p = e.touches ? e.touches[0] : e;
    const x = snap(p.clientX - offsetX);
    const y = snap(p.clientY - offsetY);
    dragTarget.style.left = x + "px";
    dragTarget.style.top = y + "px";
  }
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);
  function stopDrag() {
    if (dragTarget) {
      // if we want, automatically save after each drag
      // save layout to server
      // (we will not auto-save here to avoid many requests; use Save Layout button instead)
    }
    dragTarget = null;
  }

})();

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}
