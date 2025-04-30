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

// Parse input to handle common user formats (e.g., '2x' -> '2*x')
function parseInput(equation) {
  return equation
    .replace(/(\d+)([a-zA-Z])/g, "$1*$2") // e.g., '2x' -> '2*x'
    .replace(/\^/g, "**"); // e.g., 'x^2' -> 'x**2'
}

// Solve an equation
async function solveEquation(rawEquation) {
  const equation = parseInput(rawEquation.trim());
  if (!equation.includes("=")) {
    return { error: "Please include '=' in the equation (e.g., '2*x + 3 = 9')." };
  }

  try {
    const [left, right] = equation.split('=').map(s => s.trim());
    const result = await pyodide.runPythonAsync(`
      from sympy import symbols, Eq, solve, sympify
      x = symbols('x')
      try:
        left = sympify("${left.replace(/"/g, '\\"')}")
        right = sympify("${right.replace(/"/g, '\\"')}")
        eq = Eq(left, right)
        solutions = solve(eq, x)
        str(solutions)
      except Exception as e:
        "Error: " + str(e)
    `);
    if (result.startsWith("Error: ")) {
      return { error: `Invalid equation: ${result}` };
    }
    return { solution: `x = ${result || 'No solution'}` };
  } catch (e) {
    return { error: "Unable to solve. Ensure correct syntax (e.g., '2*x + 3 = 9' or 'x**2 - 4 = 0')." };
  }
}