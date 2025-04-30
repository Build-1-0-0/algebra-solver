// main.js
// Add a message to the chat
function addMessage(text, className) {
  const messages = document.getElementById("messages");
  const message = document.createElement("div");
  message.className = `message ${className}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

// Handle equation solving
async function handleSolve() {
  const textarea = document.getElementById("equation");
  const equation = textarea.value.trim();
  if (!equation) return;

  // Show user input and clear textarea
  addMessage(equation, "user-message");
  textarea.value = "";
  textarea.style.height = "auto";

  // Show temporary "Solving..." message
  addMessage("Solving...", "bot-message thinking");
  
  const result = await solveEquation(equation);
  
  // Remove "Solving..." message
  const thinking = document.querySelector(".thinking");
  if (thinking) thinking.remove();

  // Display result
  if (result.error) {
    addMessage(result.error, "error-message");
  } else {
    addMessage(result.solution, "bot-message");
  }
}

// Initialize UI and solver
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

  // Delegate click events for future buttons (e.g., feature toggles)
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