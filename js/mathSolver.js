// js/mathSolver.js
import * as math from 'mathjs';

function solveEquationMath(equation) {
  try {
    const sides = equation.split('=').map(s => s.trim());
    if (sides.length !== 2) {
      throw new Error('Invalid equation format. Use syntax like "2*x + 3 = 9".');
    }

    const left = math.parse(sides[0]);
    const right = math.parse(sides[1]);

    // Move to left: left - right = 0
    const diff = math.simplify(math.subtract(left, right));
    const solutions = math.solve(diff, 'x');

    if (solutions.length === 0) {
      return { error: 'No solution found.' };
    }

    const solution = solutions.map(sol => `x = ${sol}`).join(', ');
    return {
      solution,
      copyText: `${equation} → ${solution}`
    };
  } catch (error) {
    return { error: `Error solving equation: ${error.message}` };
  }
}

export { solveEquationMath };