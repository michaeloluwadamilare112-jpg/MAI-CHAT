const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const historyBox = document.getElementById("history");
const newChatBtn = document.getElementById("newChatBtn");

let chats = JSON.parse(localStorage.getItem("maichatHistory")) || [];

renderHistory();

sendBtn.addEventListener("click", sendMessage);
newChatBtn.addEventListener("click", newChat);

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  const typing = showTyping();

  try {
    const reply = await getAIResponse(text);

    typing.remove();
    addMessage(reply, "bot");
    speak(reply);

    chats.push(text);
    localStorage.setItem("maichatHistory", JSON.stringify(chats));
    renderHistory();

  } catch (err) {
    typing.remove();
    addMessage("AI error. Check backend connection.", "bot");
  }
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "message bot";
  div.textContent = "MAICHAT is typing...";
  chatBox.appendChild(div);
  return div;
}

/* REAL AI BACKEND CALL */
async function getAIResponse(message) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  return data.reply;
}

/* MEMORY */
function renderHistory() {
  historyBox.innerHTML = chats.map(c =>
    `<div class="history-item">${c}</div>`
  ).join("");
}

function newChat() {
  chatBox.innerHTML = `<div class="message bot">New chat started.</div>`;
}

/* TEXT TO SPEECH */
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

/* VOICE INPUT */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  micBtn.addEventListener("click", () => recognition.start());

  recognition.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
  };
}
