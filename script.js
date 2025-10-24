const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("search-input");
const searchBtn = document.getElementById("searchBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatWrapper = document.getElementById("chatWrapper");
const toggleViewBtn = document.getElementById("toggleViewBtn");

window.onload = () => {
  const saved = localStorage.getItem("chatHistory");
  if (saved) {
    chatBox.innerHTML = saved;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
};

// Toggle between fullscreen and compact
toggleViewBtn.onclick = () => {
  chatWrapper.classList.toggle("fullscreen-mode");
  chatWrapper.classList.toggle("compact-mode");
  toggleViewBtn.textContent = chatWrapper.classList.contains("fullscreen-mode") ? "🗗" : "⛶";
};

function addMessage(text, className, isMarkdown = false) {
  const div = document.createElement("div");
  div.classList.add("message", className);

  if (isMarkdown) {
    const cleanHTML = DOMPurify.sanitize(marked.parse(text));
    div.innerHTML = cleanHTML;
  } else {
    div.textContent = text;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-message");
  typingDiv.innerHTML = `
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typingDiv;
}

async function getBotReply(userMessage) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": "AIzaSyA3tE9ngqYkXIuruE3XPR2TFLJ2_BbBBxI"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "API Error");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn’t process that.";
  } catch (err) {
    console.error(err);
    return "⚠️ Error fetching reply.";
  }
}

async function handleSend() {
  const msg = userInput.value.trim();
  if (!msg) return;
  userInput.value = "";

  document.querySelector(".empty-state")?.remove();
  addMessage(msg, "user-message");

  const typing = showTyping();
  const reply = await getBotReply(msg);
  typing.remove();
  addMessage(reply, "bot-message", true);

  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

searchBtn.onclick = handleSend;
userInput.addEventListener("keypress", (e) => e.key === "Enter" && handleSend());

newChatBtn.onclick = () => {
  chatBox.innerHTML = '<div class="empty-state">Start a conversation 💬</div>';
  userInput.value = "";
  localStorage.removeItem("chatHistory");
};
