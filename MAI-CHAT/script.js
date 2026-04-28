const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const historyBox = document.getElementById("history");
const newChatBtn = document.getElementById("newChatBtn");

let chats = JSON.parse(localStorage.getItem("maichatHistory")) || [];

/* SIDEBAR */
menuBtn.onclick = () => {
  sidebar.classList.add("active");
  overlay.style.display = "block";
};

overlay.onclick = closeSidebar;

function closeSidebar(){
  sidebar.classList.remove("active");
  overlay.style.display = "none";
}

/* NEW CHAT */
newChatBtn.onclick = () => {
  chatBox.innerHTML = `<div class="message bot">New chat started 🚀</div>`;
  closeSidebar();
};

/* SEND */
sendBtn.onclick = sendMessage;

async function sendMessage(){
  const text = userInput.value.trim();
  if(!text) return;

  addMessage(text,"user");
  userInput.value="";

  const botDiv = document.createElement("div");
  botDiv.className="message bot";
  chatBox.appendChild(botDiv);

  const typing = showTyping();

  const reply = await getAI(text);

  typing.remove();

  streamText(reply, botDiv);
  speak(reply);

  chats.push(text);
  localStorage.setItem("maichatHistory",JSON.stringify(chats));
  renderHistory();
}

/* STREAMING TEXT (GPT STYLE) */
function streamText(text, element){
  let i = 0;
  element.textContent = "";

  function type(){
    if(i < text.length){
      element.textContent += text[i];
      i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      setTimeout(type, 12);
    }
  }
  type();
}

/* MESSAGE */
function addMessage(text,type){
  const div=document.createElement("div");
  div.className=`message ${type}`;
  div.textContent=text;
  chatBox.appendChild(div);
}

/* TYPING */
function showTyping(){
  const div=document.createElement("div");
  div.className="message bot";
  div.textContent="MAICHAT is thinking...";
  chatBox.appendChild(div);
  return div;
}

/* AI BACKEND */
async function getAI(message){
  const res = await fetch("/.netlify/functions/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({message})
  });

  const data = await res.json();
  return data.reply;
}

/* MEMORY */
function renderHistory(){
  historyBox.innerHTML = chats.map(c=>
    `<div class="history-item">${c}</div>`
  ).join("");
}
renderHistory();

/* SPEECH OUTPUT */
function speak(text){
  const s=new SpeechSynthesisUtterance(text);
  s.lang="en-US";
  window.speechSynthesis.speak(s);
}

/* VOICE INPUT */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(SpeechRecognition){
  const rec=new SpeechRecognition();
  rec.lang="en-US";

  micBtn.onclick=()=>rec.start();

  rec.onresult=(e)=>{
    userInput.value=e.results[0][0].transcript;
  };
}
