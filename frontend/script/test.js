
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    userInput.value = "";

    try {
        const res = await fetch(`${API_URL}?q=${encodeURIComponent(text)}`);
        const data = await res.json();

        if (data.answer) {
            addMessage(data.answer, "bot");
        } else {
            addMessage("오류가 발생했습니다.", "bot");
        }
    } catch (err) {
        addMessage("서버 통신 실패!", "bot");
    }
}
