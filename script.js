const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("search-input");
const searchBtn = document.getElementById("searchBtn");
const newChatBtn = document.getElementById('newChatBtn');
newChatBtn.onclick = startNewChat;


window.onload = () => {
  const savedChat = localStorage.getItem("chatHistory");
  console.log({ savedChat });
  if (savedChat) chatBox.innerHTML = savedChat;
  chatBox.scrollTop = chatBox.scrollHeight;
};

function addMessage(message, className) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", className);
  msgDiv.textContent = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function startNewChat() {
  chatBox.innerHTML = ''; // Clear chat display
  localStorage.removeItem('chatHistory'); // Clear saved chat
  userInput.value = ''; // Clear input field
  userInput.focus(); // Focus input for user
}


function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-message");
  typingDiv.textContent = "AI is typing ....";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typingDiv;
}

async function getBotReply(userMessage) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": "AIzaSyA3tE9ngqYkXIuruE3XPR2TFLJ2_BbBBxI" // Replace with your actual API key
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error:", data);
      return data?.error?.message || "Error fetching response.";
    }

    // Return normal api reply outside the if block
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get that.";

  } catch (error) {
    console.error("Fetch error:", error);
    return "Error fetching reply.";
  }
}


searchBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (message === "") return;

  addMessage(message, "user-message");
  userInput.value = "";

  const typingDiv = showTyping();

  try {
    const botReply = await getBotReply(message);
    typingDiv.remove();
    addMessage(botReply, "bot-message");
    localStorage.setItem("chatHistory", chatBox.innerHTML);
  } catch (err) {
    typingDiv.remove();
    addMessage("Error fetching reply.", "bot-message");
    console.error(err);
  }
};

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.onclick();
});
