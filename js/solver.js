// solver.js
let pyodide;

// Initialize Pyodide and SymPy
async function initSolver() {
  try {
    pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('sympy')
    `);
    console.log("Solver initialized successfully");
    return true;
  } catch (e) {
    console.error("Solver initialization failed:", e);
    return false;
  }
}

// Validate and parse input
function parseInput(equation) {
  // Basic validation for unsupported characters
  if (/[^a-zA-Z0-9\s+\-*/^=().]/.test(equation)) {
    throw new Error("Unsupported symbols detected. Use numbers, x, +, -, *, /, ^, =, or parentheses.");
  }
  return equation
    .replace(/\s+/g, '') // Remove whitespace
    .replace(/(\d+)([a-zA-Z])/g, "$1*$2") // '2x' -> '2*x'
    .replace(/\^/g, "**") // 'x^2' -> 'x**2'
    .replace(/[Xx]/g, 'x') // 'X' or 'x' -> 'x'
    .replace(/\++/g, '+') // Fix 'x++2' -> 'x+2'
    .trim();
}

// Solve an equation
async function solveEquation(rawEquation) {
  if (!rawEquation.includes("=")) {
    return { error: "Please include '=' in the equation (e.g., '2*x + 3 = 9')." };
  }

  let equation;
  try {
    equation = parseInput(rawEquation);
  } catch (e) {
    return { error: e.message };
  }

  try {
    const [left, right] = equation.split('=').map(s => s.trim());
    const result = await pyodide.runPythonAsync(`
      from sympy import symbols, Eq, solve, sympify
      x = symbols('x')
      try:
        left = sympify("${left.replace(/"/g, '\\"')}", strict=False)
        right = sympify("${right.replace(/"/g, '\\"')}", strict=False)
        eq = Eq(left, right)
        solutions = solve(eq, x)
        if not isinstance(solutions, list) or len(solutions) == 0:
          raise ValueError("No real solutions found.")
        str(solutions)
      except Exception as e:
        "Error: " + str(e)
    `);
    if (result.startsWith("Error: ")) {
      return { error: `Invalid equation: ${result.slice(7)}` };
    }
    return { solution: `x = ${result}` };
  } catch (e) {
    return { error: `Unable to solve: ${e.message}. Use syntax like '2*x + 3 = 9' or 'x**2 - 4 = 0'.` };
  }
}