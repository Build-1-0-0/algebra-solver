// js/main.js
import { initSolver, solveEquationPyodide } from './solver.js';
import { solveEquationMath } from './mathSolver.js';

function addMessage(text, className) {
  const messages = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = `message ${className}`;
  message.textContent = text;
  message.setAttribute('tabindex', '0');
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

async function handleSolve(equation, solverType) {
  if (!equation) return;

  addMessage(equation, 'user-message');
  const thinking = addMessage('Solving...', 'bot-message thinking');

  let result;
  if (solverType === 'mathjs') {
    result = solveEquationMath(equation);
  } else {
    result = await solveEquationPyodide(equation);
  }

  thinking.remove();

  if (result.error) {
    const errorMsg = addMessage(`${result.error} Retry?`, 'error-message');
    errorMsg.style.cursor = 'pointer';
    errorMsg.addEventListener('click', () => {
      document.getElementById('equation').value = equation;
      handleSolve(equation, solverType);
    });
  } else {
    const solutionMessage = `${result.solution} (Copy: ${result.copyText})`;
    const solutionMsg = addMessage(solutionMessage, 'bot-message');
    navigator.clipboard.writeText(result.copyText)
      .then(() => addMessage('Solution copied to clipboard!', 'info-message'))
      .catch(err => {
        console.error('Copy failed:', err);
        addMessage('Failed to copy solution.', 'error-message');
      });
    solutionMsg.focus();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('solver-form');
  const textarea = document.getElementById('equation');
  const sendBtn = document.getElementById('send-btn');
  const solverTypeSelect = document.getElementById('solver-type');

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const equation = textarea.value.trim();
    const solverType = solverTypeSelect.value;
    textarea.value = '';
    textarea.style.height = 'auto';
    handleSolve(equation, solverType);
  });

  // Handle Enter key (without Shift)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  // Initialize Pyodide/SymPy
  const initialized = await initSolver();
  if (initialized) {
    addMessage('Ready! Use math.js for algebra (e.g., "2*x + 3 = 9") or SymPy for advanced math (e.g., "x + y = 5; x - y = 1", "derive: x^2").', 'bot-message');
  } else {
    addMessage('SymPy solver failed to load. math.js is still available.', 'error-message');
  }
});