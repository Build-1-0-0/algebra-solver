// js/main.js
import { solveEquationMath } from './mathSolver.js';
import { solveEquationPyodide } from './solver.js';

let pyodide;

async function loadMathJs() {
  return await import('mathjs'); // v14.4.0
}

async function initSolver() {
  if (!pyodide) {
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/' });
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('sympy')
    `);
    console.log('Pyodide initialized');
  }
}

function addMessage(text, className, icon = '') {
  const messages = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = `message ${className}`;
  message.innerHTML = `${icon} ${text}`;
  message.setAttribute('tabindex', '0');
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function validateEquation(equation) {
  if (!equation.includes('=')) {
    return { valid: false, error: 'Equation must include an equals sign.' };
  }
  const sides = equation.split('=').map(s => s.trim());
  if (sides.length !== 2 || !sides[1]) {
    return { valid: false, error: 'Equation must include a valid right-hand side (e.g., "2*x + 3 = 9").' };
  }
  return { valid: true };
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('solver-form');
  const textarea = document.getElementById('equation');
  const solverTypeSelect = document.getElementById('solver-type');
  const messages = document.getElementById('messages');
  messages.setAttribute('aria-live', 'polite');

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const equation = textarea.value.trim();
    const solverType = solverTypeSelect.value;

    if (!equation) {
      addMessage('Please enter an equation.', 'error-message', '❌');
      return;
    }

    addMessage(`Input: ${equation}`, 'user-message', '➡️');
    const thinking = addMessage('Solving...', 'bot-message thinking', '⏳');

    try {
      const validation = validateEquation(equation);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      let result;
      if (solverType === 'mathjs') {
        const math = await loadMathJs();
        result = await solveEquationMath(equation, math);
      } else if (solverType === 'pyodide') {
        await initSolver();
        result = await solveEquationPyodide(equation);
      }

      thinking.remove();
      if (result.error) {
        throw new Error(result.error);
      }

      addMessage(`Result: ${result.solution}`, 'bot-message', '✅');
      navigator.clipboard.writeText(result.copyText)
        .then(() => addMessage('Result copied to clipboard!', 'info-message', '📋'))
        .catch(() => addMessage('Failed to copy result.', 'error-message', '❌'));
    } catch (err) {
      thinking.remove();
      const errorMsg = addMessage(`Error: ${err.message || err}`, 'error-message', '❌');
      errorMsg.style.cursor = 'pointer';
      errorMsg.addEventListener('click', () => {
        textarea.value = equation;
        form.dispatchEvent(new Event('submit'));
      });
    }

    textarea.value = '';
    textarea.style.height = 'auto';
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  initSolver().then(() => {
    addMessage('Ready! Use math.js for algebra (e.g., "2*x + 3 = 9") or SymPy for advanced math (e.g., "x^2 - 4 = 0").', 'bot-message', 'ℹ️');
  }).catch(() => {
    addMessage('SymPy solver failed to load. math.js is still available.', 'error-message', '❌');
  });
});