// client/scripts/socket.js
let socket;
function initSocket(token, groupId, onMessage) {
  socket = new WebSocket(`ws://${window.location.hostname}:${location.port}`);
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", token, group: groupId }));
  });
  socket.addEventListener("message", (ev) => {
    const data = JSON.parse(ev.data);
    if (onMessage) onMessage(data);
  });
}

function sendChat(text) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type: "chat", text }));
}

window.initSocket = initSocket;
window.sendChat = sendChat;
