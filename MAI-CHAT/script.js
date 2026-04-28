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
   MEMORY (LOCAL STORAGE)
====================== */
let chats = JSON.parse(localStorage.getItem("maichatHistory")) || [];
renderHistory();

/* ======================
   SIDEBAR CONTROLS
====================== */
menuBtn.onclick = () => {
  sidebar.classList.add("active");
  overlay.style.display = "block";
};

overlay.onclick = closeSidebar;

function closeSidebar(){
  sidebar.classList.remove("active");
  overlay.style.display = "none";
}

/* ======================
   NEW CHAT
====================== */
newChatBtn.onclick = () => {
  chatBox.innerHTML = `<div class="message bot">New chat started 🚀</div>`;
  closeSidebar();
};

/* ======================
   SEND MESSAGE
====================== */
sendBtn.onclick = sendMessage;

async function sendMessage(){
  const text = userInput.value.trim();
  if(!text) return;

  addMessage(text, "user");
  userInput.value = "";

  const botBubble = createBotMessage();
  const typing = showTyping();

  try {
    const reply = await getAIResponse(text);

    typing.remove();

    streamText(reply, botBubble);
    speak(reply);

    chats.push(text);
    localStorage.setItem("maichatHistory", JSON.stringify(chats));
    renderHistory();

  } catch (error) {
    typing.remove();
    botBubble.textContent = "⚠️ MAICHAT error. Check backend connection.";
    console.error(error);
  }
}

/* ======================
   ADD MESSAGE
====================== */
function addMessage(text, type){
  const div = document.createElement("div");
  div.className = `message ${type === "user" ? "user-message" : "ai-message"}`;
  div.textContent = text;
  chatBox.appendChild(div);
  scrollToBottom();
}

/* ======================
   BOT MESSAGE HOLDER
====================== */
function createBotMessage(){
  const div = document.createElement("div");
  div.className = "message ai-message";
  chatBox.appendChild(div);
  return div;
}

/* ======================
   TYPING INDICATOR
====================== */
function showTyping(){
  const div = document.createElement("div");
  div.className = "message ai-message";
  div.textContent = "MAICHAT is thinking...";
  chatBox.appendChild(div);
  scrollToBottom();
  return div;
}

/* ======================
   STREAMING EFFECT
====================== */
function streamText(text, element){
  let i = 0;
  element.textContent = "";

  function type(){
    if(i < text.length){
      element.textContent += text[i];
      i++;
      scrollToBottom();
      setTimeout(type, 10); // speed
    }
  }

  type();
}

/* ======================
   SCROLL CONTROL
====================== */
function scrollToBottom(){
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ======================
   CALL BACKEND (RENDER)
====================== */
async function getAIResponse(message){
  const res = await fetch("https://YOUR-RENDER-URL.onrender.com/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  return data.reply;
}

/* ======================
   HISTORY SYSTEM
====================== */
function renderHistory(){
  historyBox.innerHTML = chats.map(c =>
    `<div class="history-item">${c}</div>`
  ).join("");
}

/* ======================
   SPEECH OUTPUT (AI VOICE)
====================== */
function speak(text){
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

/* ======================
   VOICE INPUT (MIC)
====================== */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if(SpeechRecognition){
  const rec = new SpeechRecognition();
  rec.lang = "en-US";

  micBtn.onclick = () => rec.start();

  rec.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
  };
}
