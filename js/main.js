function addMessage(text, className) {
  const messages = document.getElementById("messages");
  const message = document.createElement("div");
  message.className = `message ${className}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

async function handleSolve() {
  const textarea = document.getElementById("equation");
  const equation = textarea.value.trim();
  if (!equation) return;

  addMessage(equation, "user-message");
  textarea.value = "";
  textarea.style.height = "auto";

  const result = await solveEquation(equation);
  if (result.error) {
    addMessage(result.error, "error-message");
  } else {
    addMessage(result.solution, "bot-message");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const textarea = document.getElementById("equation");
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  });

  document.getElementById("send-btn").addEventListener("click", handleSolve);

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  });

  const initialized = await initSolver();
  if (initialized) {
    addMessage("Ready! Enter an equation.", "bot-message");
  } else {
    addMessage("Error loading solver. Please refresh.", "error-message");
  }
});