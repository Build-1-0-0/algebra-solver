// main.js
function addMessage(text, className) {
  const messages = document.getElementById("messages");
  const message = document.createElement("div");
  message.className = `message ${className}`;
  message.textContent = text;
  message.setAttribute("tabindex", "0"); // Focusable for accessibility
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

  addMessage("Solving...", "bot-message thinking");
  const result = await solveEquation(equation);
  document.querySelector(".thinking")?.remove();

  if (result.error) {
    addMessage(result.error, "error-message");
  } else {
    const solutionMessage = `${result.solution} (Copy: ${equation} → ${result.solution})`;
    addMessage(solutionMessage, "bot-message");
    // Auto-focus the solution for accessibility
    document.querySelector(".bot-message:last-child").focus();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const textarea = document.getElementById("equation");
  const sendBtn = document.getElementById("send-btn");
  const inputContainer = document.getElementById("input-container");

  // Auto-resize textarea
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  });

  // Handle Send button click
  sendBtn.addEventListener("click", handleSolve);

  // Handle Enter key (without Shift)
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  });

  // Delegate click events
  inputContainer.addEventListener("click", (e) => {
    if (e.target.matches("#send-btn")) {
      handleSolve();
    }
  });

  // Initialize solver
  const initialized = await initSolver();
  if (initialized) {
    addMessage("Ready! Enter an equation.", "bot-message");
  } else {
    addMessage("Error loading solver. Please refresh.", "error-message");
  }
});