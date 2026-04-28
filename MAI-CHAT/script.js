const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const newChatBtn = document.getElementById("newChatBtn");
const historyBox = document.getElementById("history");

/* ======================
   MEMORY
====================== */
let chats = JSON.parse(localStorage.getItem("maichatHistory")) || [];
renderHistory();

/* ======================
   SIDEBAR
====================== */
menuBtn.onclick = () => {
  sidebar.classList.add("active");
  overlay.style.display = "block";
};

overlay.onclick = closeSidebar;

function closeSidebar() {
  sidebar.classList.remove("active");
  overlay.style.display = "none";
}

/* ======================
   NEW CHAT
====================== */
newChatBtn.onclick = () => {
  chatBox.innerHTML = `<div class="message ai-message">New chat started 🚀</div>`;
  closeSidebar();
};

/* ======================
   SEND MESSAGE
====================== */
sendBtn.onclick = sendMessage;

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user-message");
  userInput.value = "";

  const typing = showTyping();

  try {
    const reply = await getAI(text);

    typing.remove();

    const botBubble = createBotMessage();
    streamText(reply, botBubble);

    speak(reply);

    chats.push(text);
    localStorage.setItem("maichatHistory", JSON.stringify(chats));
    renderHistory();

  } catch (error) {
    typing.remove();

    const botBubble = createBotMessage();
    botBubble.textContent = "⚠️ MAICHAT backend error.";

    console.error(error);
  }
}

/* ======================
   ADD MESSAGE
====================== */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chatBox.appendChild(div);
  scrollBottom();
}

/* ======================
   BOT MESSAGE HOLDER
====================== */
function createBotMessage() {
  const div = document.createElement("div");
  div.className = "message ai-message";
  chatBox.appendChild(div);
  return div;
}

/* ======================
   TYPING INDICATOR
====================== */
function showTyping() {
  const div = document.createElement("div");
  div.className = "message ai-message";
  div.textContent = "MAICHAT is thinking...";
  chatBox.appendChild(div);
  scrollBottom();
  return div;
}

/* ======================
   STREAMING EFFECT
====================== */
function streamText(text, element) {
  let i = 0;
  element.textContent = "";

  function type() {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
      scrollBottom();
      setTimeout(type, 10);
    }
  }

  type();
}

/* ======================
   SCROLL
====================== */
function scrollBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ======================
   AI FETCH (UPDATED URL)
====================== */
async function getAI(message) {

  const token = localStorage.getItem("maichat_token");

  const res = await fetch("https://mai-chat-backend-1.onrender.com/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token || ""}`
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  return data.reply;
}

/* ======================
   HISTORY
====================== */
function renderHistory() {
  historyBox.innerHTML = chats.map(c =>
    `<div class="history-item">${c}</div>`
  ).join("");
}

/* ======================
   TEXT TO SPEECH
====================== */
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

/* ======================
   VOICE INPUT
====================== */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const rec = new SpeechRecognition();
  rec.lang = "en-US";

  micBtn.onclick = () => rec.start();

  rec.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
  };
}
