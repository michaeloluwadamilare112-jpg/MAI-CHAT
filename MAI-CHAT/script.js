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

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  typingEffect(() => {
    const reply = generateReply(text);
    addMessage(reply, "bot");
    speak(reply);

    chats.push(text);
    localStorage.setItem("maichatHistory", JSON.stringify(chats));
    renderHistory();
  });
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function typingEffect(callback) {
  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.textContent = "MAICHAT is typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    typing.remove();
    callback();
  }, 1200);
}

function generateReply(text) {
  return "You said: " + text;
}

function renderHistory() {
  historyBox.innerHTML = chats.map(chat =>
    `<div class="history-item">${chat}</div>`
  ).join("");
}

function newChat() {
  chatBox.innerHTML = `
    <div class="message bot">Hello, I’m MAICHAT. How can I help?</div>
  `;
}

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

/* VOICE TO TEXT */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.textContent = "🎙️";
  });

  recognition.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
    micBtn.textContent = "🎤";
  };

  recognition.onerror = () => {
    micBtn.textContent = "🎤";
  };

  recognition.onend = () => {
    micBtn.textContent = "🎤";
  };
} else {
  micBtn.style.display = "none";
}
