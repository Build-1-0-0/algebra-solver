// js/mathSolver.js
function solveEquationMath(equation, math) {
  try {
    const validation = validateEquation(equation);
    if (!validation.valid) {
      return { error: validation.error };
    }

    let operation = 'solve';
    let expr = equation;
    const prefixes = ['solve:', 'simplify:', 'expand:', 'factor:'];
    for (const prefix of prefixes) {
      if (equation.startsWith(prefix)) {
        operation = prefix.replace(':', '');
        expr = equation.slice(prefix.length).trim();
        break;
      }
    }

    if (operation === 'simplify') {
      const simplified = math.simplify(expr).toString();
      return { solution: simplified, copyText: `${equation} → ${simplified}` };
    } else if (operation === 'expand') {
      const expanded = math.simplify(math.expand(expr)).toString();
      return { solution: expanded, copyText: `${equation} → ${expanded}` };
    } else if (operation === 'factor') {
      const factored = math.simplify(expr, { factor: true }).toString();
      return { solution: factored, copyText: `${equation} → ${factored}` };
    }

    const sides = expr.split('=').map(s => s.trim());
    const left = math.parse(sides[0]);
    const right = math.parse(sides[1]);
    const diff = math.simplify(math.subtract(left, right));
    const solutions = math.solve(diff, 'x');
    const solution = solutions.map(sol => `x = ${sol}`).join(', ') || 'No solution';
    return { solution, copyText: `${equation} → ${solution}` };
  } catch (error) {
    return { error: `Error solving with math.js: ${error.message}` };
  }
}

export { solveEquationMath };