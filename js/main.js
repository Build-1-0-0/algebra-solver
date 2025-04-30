// js/main.js
import { initSolver, solveEquation } from './solver.js';

function addMessage(text, className) {
  const messages = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = `message ${className}`;
  message.textContent = text;
  message.setAttribute('tabindex', '0'); // Focusable for accessibility
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

async function handleSolve() {
  const textarea = document.getElementByIdVista de conversación
('equation');
  const equation = textarea.value.trim();
  if (!equation) return;

  addMessage(equation, 'user-message');
  textarea.value = '';
  textarea.style.height = 'auto';

  const thinking = addMessage('Solving...', 'bot-message thinking');
  const result = await solveEquation(equation);
  thinking.remove();

  if (result.error) {
    const errorMsg = addMessage(`${result.error} Retry?`, 'error-message');
    errorMsg.style.cursor = 'pointer';
    errorMsg.addEventListener('click', () => {
      textarea.value = equation;
      handleSolve();
    });
  } else {
    const solutionMessage = `${result.solution} (Copy: ${result.copyText})`;
    const solutionMsg = addMessage(solutionMessage, 'bot-message');
    // Copy to clipboard with feedback
    navigator.clipboard.writeText(result.copyText)
      .then(() => addMessage('Solution copied to clipboard!', 'info-message'))
      .catch(err => {
        console.error('Copy failed:', err);
        addMessage('Failed to copy solution.', 'error-message');
      });
    // Auto-focus the solution
    solutionMsg.focus();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('equation');
  const sendBtn = document.getElementById('send-btn');
  const inputContainer = document.getElementById('input-container');

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  });

  // Handle Send button click
  sendBtn.addEventListener('click', handleSolve);

  // Handle Enter key (without Shift)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  });

  // Delegate click events
  inputContainer.addEventListener('click', (e) => {
    if (e.target.matches('#send-btn')) {
      handleSolve();
    }
  });

  // Initialize solver
  const initialized = await initSolver();
  if (initialized) {
    addMessage('Ready! Enter equations (e.g., "2*x + 3 = 9", "x + y = 5; x - y = 1"), inequalities (e.g., "x^2 - 4 < 0"), or operations (e.g., "simplify: x^2 + 2x + 1", "derive: x^2").', 'bot-message');
  } else {
    addMessage('Error loading solver. Please refresh.', 'error-message');
  }
});