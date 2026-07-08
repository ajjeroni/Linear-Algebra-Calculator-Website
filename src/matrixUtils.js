export const MIN_DIMENSION = 1;
export const MAX_DIMENSION = 5;
export const MIN_MATRICES = 2;
export const MAX_MATRICES = 5;

export function createDefaultMatrices(count, rows, cols) {
  return Array.from({ length: count }, () =>
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""))
  );
}

export function buildMatricesWithDimensions(count, rows, cols, previous = []) {
  return Array.from({ length: count }, (_, matrixIndex) =>
    Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: cols }, (_, colIndex) => {
        const previousMatrix = previous[matrixIndex];
        const previousValue =
          previousMatrix &&
          Array.isArray(previousMatrix[rowIndex]) &&
          typeof previousMatrix[rowIndex][colIndex] !== "undefined"
            ? previousMatrix[rowIndex][colIndex]
            : "";
        return previousValue;
      })
    )
  );
}

function getReferencedMatrixIndices(expression) {
  if (typeof expression !== "string") {
    return [];
  }

  const labels = expression.match(/[A-Za-z]+/g) ?? [];
  const labelOrder = ["A", "B", "C", "D", "E"];

  return labels
    .map((label) => labelOrder.indexOf(label.toUpperCase()))
    .filter((index) => index !== -1);
}

export function validateMatrices(rows, cols, matrices, expression = "") {
  const errors = [];

  if (!Number.isInteger(rows) || rows < MIN_DIMENSION || rows > MAX_DIMENSION) {
    errors.push(
      `Rows must be an integer between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`
    );
  }

  if (!Number.isInteger(cols) || cols < MIN_DIMENSION || cols > MAX_DIMENSION) {
    errors.push(
      `Columns must be an integer between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`
    );
  }

  if (!Array.isArray(matrices)) {
    errors.push("Matrices must be provided as an array.");
    return { valid: errors.length === 0, errors };
  }

  if (matrices.length < MIN_MATRICES || matrices.length > MAX_MATRICES) {
    errors.push(
      `You must use between ${MIN_MATRICES} and ${MAX_MATRICES} matrices.`
    );
  }

  const matrixIndicesToValidate = getReferencedMatrixIndices(expression);
  const matricesToValidate =
    matrixIndicesToValidate.length > 0
      ? matrixIndicesToValidate
      : matrices.map((_, index) => index);

  matricesToValidate.forEach((matrixIndex) => {
    const matrix = matrices[matrixIndex];

    if (!Array.isArray(matrix)) {
      errors.push(`Matrix ${matrixIndex + 1} must be an array.`);
      return;
    }

    if (matrix.length !== rows) {
      errors.push(
        `Matrix ${matrixIndex + 1} must have ${rows} rows, but it has ${matrix.length}.`
      );
    }

    matrix.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        errors.push(
          `Matrix ${matrixIndex + 1} row ${rowIndex + 1} must be an array.`
        );
        return;
      }

      if (row.length !== cols) {
        errors.push(
          `Matrix ${matrixIndex + 1} row ${rowIndex + 1} must have ${cols} columns, but it has ${row.length}.`
        );
      }

      row.forEach((value, colIndex) => {
        if (value === "" || value === null || value === undefined) {
          errors.push(
            `Matrix ${matrixIndex + 1} cell [${rowIndex + 1},${colIndex + 1}] is required.`
          );
        } else if (Number.isNaN(Number(value))) {
          errors.push(
            `Matrix ${matrixIndex + 1} cell [${rowIndex + 1},${colIndex + 1}] must be a number.`
          );
        }
      });
    });
  });

  return { valid: errors.length === 0, errors };
}

function normalizeMatrix(matrix) {
  return matrix.map((row) => row.map((value) => Number(value)));
}

function getMatrixDimensions(matrix) {
  return {
    rows: matrix.length,
    cols: matrix[0]?.length ?? 0,
  };
}

function ensureSameDimensions(leftMatrix, rightMatrix) {
  const leftDimensions = getMatrixDimensions(leftMatrix);
  const rightDimensions = getMatrixDimensions(rightMatrix);

  if (
    leftDimensions.rows !== rightDimensions.rows ||
    leftDimensions.cols !== rightDimensions.cols
  ) {
    return {
      valid: false,
      error: "The matrices must have the same dimensions for addition or subtraction.",
    };
  }

  return { valid: true };
}

export function addMatrices(leftMatrix, rightMatrix) {
  const dimensionCheck = ensureSameDimensions(leftMatrix, rightMatrix);

  if (!dimensionCheck.valid) {
    throw new Error(dimensionCheck.error);
  }

  return leftMatrix.map((row, rowIndex) =>
    row.map((value, colIndex) => value + rightMatrix[rowIndex][colIndex])
  );
}

export function subtractMatrices(leftMatrix, rightMatrix) {
  const dimensionCheck = ensureSameDimensions(leftMatrix, rightMatrix);

  if (!dimensionCheck.valid) {
    throw new Error(dimensionCheck.error);
  }

  return leftMatrix.map((row, rowIndex) =>
    row.map((value, colIndex) => value - rightMatrix[rowIndex][colIndex])
  );
}

export function multiplyMatrixByScalar(matrix, scalar) {
  return matrix.map((row) => row.map((value) => value * scalar));
}

function tokenizeMatrixExpression(expression) {
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (["+", "-", "*", "(", ")"].includes(character)) {
      tokens.push(character);
      index += 1;
      continue;
    }

    if (/\d|\./.test(character)) {
      let number = "";
      while (index < expression.length && /\d|\./.test(expression[index])) {
        number += expression[index];
        index += 1;
      }

      tokens.push(number);
      continue;
    }

    if (/[A-Za-z]/.test(character)) {
      let label = "";
      while (index < expression.length && /[A-Za-z]/.test(expression[index])) {
        label += expression[index].toUpperCase();
        index += 1;
      }

      tokens.push(label);
      continue;
    }

    throw new Error(`Unexpected character "${character}".`);
  }

  return tokens;
}

class MatrixExpressionParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek() {
    return this.tokens[this.index];
  }

  consume(expectedToken = null) {
    const currentToken = this.peek();

    if (expectedToken && currentToken !== expectedToken) {
      throw new Error(`Expected ${expectedToken}, received ${currentToken ?? "end of expression"}.`);
    }

    this.index += 1;
    return currentToken;
  }

  parse() {
    const node = this.parseExpression();

    if (this.peek() !== undefined) {
      throw new Error(`Unexpected token "${this.peek()}".`);
    }

    return node;
  }

  parseExpression() {
    let left = this.parseTerm();

    while (this.peek() === "+" || this.peek() === "-") {
      const operator = this.consume();
      const right = this.parseTerm();
      left = { type: "binary", operator, left, right };
    }

    return left;
  }

  parseTerm() {
    let left = this.parseFactor();

    while (true) {
      const token = this.peek();

      if (token === "*") {
        this.consume("*");
        const right = this.parseFactor();
        left = { type: "binary", operator: "*", left, right };
        continue;
      }

      if (token && token !== "+" && token !== "-" && token !== ")") {
        const right = this.parseFactor();
        left = { type: "binary", operator: "*", left, right };
        continue;
      }

      break;
    }

    return left;
  }

  parseFactor() {
    const token = this.peek();

    if (token === "+") {
      this.consume("+");
      return this.parseFactor();
    }

    if (token === "-") {
      this.consume("-");
      return { type: "unary", operator: "-", expression: this.parseFactor() };
    }

    if (token === "(") {
      this.consume("(");
      const expression = this.parseExpression();
      this.consume(")");
      return expression;
    }

    if (token !== undefined && /^\d+(?:\.\d+)?$/.test(String(token))) {
      this.consume();
      return { type: "number", value: Number(token) };
    }

    if (token !== undefined && /^[A-Z]+$/.test(String(token))) {
      this.consume();
      return { type: "matrix", label: String(token) };
    }

    throw new Error(`Unexpected token "${token ?? "end of expression"}".`);
  }
}

function resolveOperandValue(node, matricesByLabel) {
  if (node.type === "number") {
    return { value: node.value, isMatrix: false };
  }

  if (node.type === "matrix") {
    const matrix = matricesByLabel[node.label];

    if (!matrix) {
      throw new Error(`Matrix ${node.label} is not defined.`);
    }

    return { value: normalizeMatrix(matrix), isMatrix: true };
  }

  throw new Error("Unsupported expression node.");
}

function evaluateExpressionNode(node, matricesByLabel) {
  if (node.type === "number") {
    return { value: node.value, isMatrix: false };
  }

  if (node.type === "matrix") {
    const matrix = matricesByLabel[node.label];

    if (!matrix) {
      throw new Error(`Matrix ${node.label} is not defined.`);
    }

    return { value: normalizeMatrix(matrix), isMatrix: true };
  }

  if (node.type === "unary") {
    const operand = evaluateExpressionNode(node.expression, matricesByLabel);

    if (operand.isMatrix) {
      return { value: multiplyMatrixByScalar(operand.value, -1), isMatrix: true };
    }

    return { value: -operand.value, isMatrix: false };
  }

  if (node.type === "binary") {
    const left = evaluateExpressionNode(node.left, matricesByLabel);
    const right = evaluateExpressionNode(node.right, matricesByLabel);

    if (node.operator === "*") {
      if (left.isMatrix && right.isMatrix) {
        throw new Error("Matrix-matrix multiplication is not supported yet.");
      }

      if (left.isMatrix) {
        return { value: multiplyMatrixByScalar(left.value, right.value), isMatrix: true };
      }

      if (right.isMatrix) {
        return { value: multiplyMatrixByScalar(right.value, left.value), isMatrix: true };
      }

      return { value: left.value * right.value, isMatrix: false };
    }

    if (node.operator === "+") {
      if (!left.isMatrix || !right.isMatrix) {
        throw new Error("Addition only supports matrix operands.");
      }

      return { value: addMatrices(left.value, right.value), isMatrix: true };
    }

    if (node.operator === "-") {
      if (!left.isMatrix || !right.isMatrix) {
        throw new Error("Subtraction only supports matrix operands.");
      }

      return { value: subtractMatrices(left.value, right.value), isMatrix: true };
    }
  }

  throw new Error("Unsupported expression.");
}

export function evaluateMatrixExpression(expression, matricesByLabel = {}) {
  if (typeof expression !== "string" || expression.trim() === "") {
    return { valid: false, errors: ["Please enter an algebra expression."], result: null };
  }

  const trimmedExpression = expression.trim().replace(/\s+/g, " ");

  try {
    const tokens = tokenizeMatrixExpression(trimmedExpression);
    const parser = new MatrixExpressionParser(tokens);
    const parsedExpression = parser.parse();
    const result = evaluateExpressionNode(parsedExpression, matricesByLabel);

    if (!result.isMatrix) {
      return { valid: false, errors: ["The expression must resolve to a matrix."], result: null };
    }

    return { valid: true, errors: [], result: result.value };
  } catch (error) {
    return {
      valid: false,
      errors: [error.message || "Unable to evaluate the matrix expression."],
      result: null,
    };
  }
}

export function sumMatrices(matrices, matrixModule = null) {
  if (!matrices.length) {
    return [];
  }

  const rows = matrices[0].length;
  const cols = matrices[0][0]?.length ?? 0;

  if (matrixModule && typeof matrixModule.createMatrix === "function") {
    const toWasmMatrix = (matrixValues) => {
      const wasmMatrix = matrixModule.createMatrix(rows, cols);

      matrixValues.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          if (typeof wasmMatrix.setElement === "function") {
            wasmMatrix.setElement(rowIndex, colIndex, Number(value));
          }
        });
      });

      return wasmMatrix;
    };

    const toPlainMatrix = (wasmMatrix) =>
      Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) =>
          Number(wasmMatrix.getElement(rowIndex, colIndex))
        )
      );

    let resultMatrix = null;

    try {
      for (let index = 0; index < matrices.length; index++) {
        const matrix = matrices[index];
        const wasmMatrix = toWasmMatrix(matrix);

        if (index === 0) {
          resultMatrix = wasmMatrix;
          continue;
        }

        if (resultMatrix && typeof resultMatrix.add === "function") {
          const oldResult = resultMatrix;
          const newResult = oldResult.add(wasmMatrix);

          if (wasmMatrix && typeof wasmMatrix.delete === "function") {
            try {
              wasmMatrix.delete();
            } catch {
              /* ignore deletion errors */
            }
          }

          if (oldResult && typeof oldResult.delete === "function") {
            try {
              oldResult.delete();
            } catch {
              /* ignore deletion errors */
            }
          }

          resultMatrix = newResult;
        } else {
          // If we can't perform a wasm add, free the temporary wasmMatrix
          if (wasmMatrix && typeof wasmMatrix.delete === "function") {
            try {
              wasmMatrix.delete();
            } catch {
              /* ignore deletion errors */
            }
          }
        }
      }

      if (resultMatrix) {
        const plain = toPlainMatrix(resultMatrix);

        if (resultMatrix && typeof resultMatrix.delete === "function") {
          try {
            resultMatrix.delete();
          } catch {
            /* ignore deletion errors */
          }
        }

        return plain;
      }
    } catch (err) {
      if (resultMatrix && typeof resultMatrix.delete === "function") {
        try {
          resultMatrix.delete();
        } catch {
          /* ignore deletion errors */
        }
      }
      throw err;
    }
  }

  const result = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );

  matrices.forEach((matrix) => {
    matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        result[rowIndex][colIndex] += Number(value);
      });
    });
  });

  return result;
}
