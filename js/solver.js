// js/solver.js
let pyodide;

// Initialize Pyodide and SymPy
async function initSolver() {
  try {
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/' });
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('sympy')
    `);
    console.log('Solver initialized successfully');
    return true;
  } catch (e) {
    console.error('Solver initialization failed:', e);
    return false;
  }
}

// Parse input and detect operation
function parseInput(input) {
  input = input.trim().toLowerCase();
  let operation = 'solve';
  let equation = input;

  // Detect operation prefix
  const prefixes = ['solve:', 'simplify:', 'expand:', 'factor:', 'derive:', 'integrate:', 'subs:'];
  for (const prefix of prefixes) {
    if (input.startsWith(prefix)) {
      operation = prefix.replace(':', '');
      equation = input.slice(prefix.length).trim();
      break;
    }
  }

  // Split multiple equations (for systems)
  const equations = equation.split(/;|\n/).map(eq => eq.trim()).filter(eq => eq);

  // Parse each equation
  const parsed = equations.map(eq => {
    let subs = null;
    if (operation === 'subs' && eq.includes('where')) {
      const [expr, subsPart] = eq.split('where').map(s => s.trim());
      subs = subsPart.split(',').map(s => {
        const [varName, value] = s.split('=').map(v => v.trim());
        return { var: varName, value };
      });
      eq = expr;
    }

    let rel = '=';
    for (const op of ['<', '>', '<=', '>=']) {
      if (eq.includes(op)) {
        rel = op;
        operation = 'inequality';
        break;
      }
    }

    if (rel === '=') {
      const parts = eq.split('=').map(s => s.trim());
      if (parts.length === 1) {
        return { expr: parts[0], rel: '=' };
      }
      return { left: parts[0], right: parts[1], rel };
    } else {
      const [left, right] = eq.split(rel).map(s => s.trim());
      return { left, right, rel };
    }
  });

  // Normalize expressions
  const normalized = parsed.map(p => ({
    left: p.left ? p.left
      .replace(/\s+/g, '')
      .replace(/(\d+)([a-zA-Z])/g, '$1*$2')
      .replace(/([a-zA-Z])\*([a-zA-Z])/g, '$1**2')
      .replace(/\^/g, '**')
      .replace(/\++/g, '+') : p.expr,
    right: p.right ? p.right
      .replace(/\s+/g, '')
      .replace(/(\d+)([a-zA-Z])/g, '$1*$2')
      .replace(/([a-zA-Z])\*([a-zA-Z])/g, '$1**2')
      .replace(/\^/g, '**')
      .replace(/\++/g, '+') : '0',
    rel: p.rel,
    expr: p.expr
  }));

  return { operation, equations: normalized, subs };
}

// Solve with Pyodide/SymPy
async function solveEquationPyodide(rawInput) {
  try {
    const { operation, equations, subs } = parseInput(rawInput);
    if (!equations.length) {
      return { error: 'No valid input provided.' };
    }

    const pyInputs = equations.map(eq => ({
      left: eq.left ? pyodide.toPy(eq.left) : null,
      right: pyodide.toPy(eq.right),
      rel: eq.rel,
      expr: eq.expr ? pyodide.toPy(eq.expr) : null
    }));

    const pySubs = subs ? pyodide.toPy(Object.fromEntries(subs.map(s => [s.var, s.value]))) : null;

    const result = await pyodide.runPythonAsync(`
      from sympy import symbols, Eq, solve, sympify, diff, integrate, simplify, expand, factor
      from sympy.solvers.inequalities import solve_univariate_inequality
      try:
        result = None
        if "${operation}" in ['simplify', 'expand', 'factor', 'derive', 'integrate']:
          expr = sympify(py_inputs[0]['expr'], strict=False)
          if "${operation}" == 'simplify':
            result = str(simplify(expr))
          elif "${operation}" == 'expand':
            result = str(expand(expr))
          elif "${operation}" == 'factor':
            result = str(factor(expr))
          elif "${operation}" == 'derive':
            vars = list(expr.free_symbols)
            if not vars:
              raise ValueError("No variables found.")
            result = str(diff(expr, vars[0]))
          elif "${operation}" == 'integrate':
            vars = list(expr.free_symbols)
            if not vars:
              raise ValueError("No variables found.")
            result = str(integrate(expr, vars[0]))
        elif "${operation}" == 'subs':
          expr = sympify(py_inputs[0]['expr'], strict=False)
          result = str(expr.subs(py_subs))
        elif "${operation}" == 'inequality':
          left = sympify(py_inputs[0]['left'], strict=False)
          right = sympify(py_inputs[0]['right'], strict=False)
          vars = list((left - right).free_symbols)
          if not vars:
            raise ValueError("No variables found.")
          rel = "${py_inputs[0]['rel']}"
          if rel == '<':
            ineq = left < right
          elif rel == '>':
            ineq = left > right
          elif rel == '<=':
            ineq = left <= right
          elif rel == '>=':
            ineq = left >= right
          result = str(solve_univariate_inequality(ineq, vars[0]))
        else:
          all_vars = set()
          for eq in py_inputs:
            left = sympify(eq['left'], strict=False) if eq['left'] else 0
            right = sympify(eq['right'], strict=False)
            vars = (left - right).free_symbols
            all_vars.update(vars)
          if not all_vars:
            raise ValueError("No variables found.")
          all_vars = list(all_vars)
          if len(py_inputs) == 1:
            left = sympify(py_inputs[0]['left'], strict=False)
            right = sympify(py_inputs[0]['right'], strict=False)
            solutions = solve(Eq(left, right), all_vars[0])
            if not solutions:
              raise ValueError("No real solutions found.")
            result = '[' + ', '.join(str(sol) for sol in solutions) + ']'
          else:
            eqs = [Eq(sympify(eq['left'], strict=False), sympify(eq['right'], strict=False)) for eq in py_inputs]
            solutions = solve(eqs, all_vars)
            if not solutions:
              raise ValueError("No real solutions found.")
            result = str(dict((var, str(sol)) for var, sol in zip(all_vars, solutions)))
        result
      except Exception as e:
        "Error: " + str(e)
    `, { py_inputs: pyodide.toPy(pyInputs), py_subs: pySubs });

    if (!result || typeof result !== 'string') {
      return { error: 'Unable to solve: Invalid response from solver.' };
    }

    if (result.startsWith('Error: ')) {
      return { error: `Invalid input: ${result.slice(7)}` };
    }

    let solution, copyText;
    if (operation === 'solve' && equations.length === 1) {
      solution = `${[...(sympify(pyInputs[0].left) - sympify(pyInputs[0].right)).free_symbols][0]} = ${result}`;
      copyText = `${rawInput} → ${solution}`;
    } else if (operation === 'solve') {
      solution = `Solutions: ${result}`;
      copyText = `${rawInput} → ${result}`;
    } else {
      solution = `${operation}: ${result}`;
      copyText = `${rawInput} → ${result}`;
    }

    return { solution, copyText };
  } catch (e) {
    console.error('Solver error:', e);
    return { error: `Unable to solve: ${e.message}. Use syntax like '2*x + 3 = 9' or 'simplify: x^2 + 2x + 1'.` };
  }
}

export { initSolver, solveEquationPyodide };